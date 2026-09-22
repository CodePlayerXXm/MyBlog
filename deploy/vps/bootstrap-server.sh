#!/usr/bin/env bash
#
# 一次性服务器初始化脚本（Ubuntu / Debian）。
#
# 目标：你只需要在服务器上跑一次这个脚本，之后日常部署全在 GitHub Actions 里完成，
# 不需要再登录服务器。
#
# 用法（在服务器上以 root 执行）：
#   bash bootstrap-server.sh <你的域名> [--harden-ssh]
#
#   例：bash bootstrap-server.sh blog.example.com --harden-ssh
#
#   --harden-ssh 会关闭密码登录与 root 登录。**加这个参数前请确认你本地已有可用的 SSH 密钥**，
#   否则会把自己锁在外面。
#
# 脚本做的事：
#   1. 建无 sudo 权限的 deploy 用户与站点目录
#   2. 装 Caddy（自动 HTTPS）、rsync、fail2ban、ufw、unattended-upgrades
#   3. 写 Caddyfile、开防火墙（22/80/443）
#   4. 开启自动安全更新（这样你不用每月手动打补丁）
#   5. 生成部署密钥，并用 rrsync 把它限制成「只能写 /var/www/blog」
#   6. 最后打印私钥 —— 复制到 GitHub Secrets 后就删掉
#
set -euo pipefail

DOMAIN="${1:-}"
HARDEN_SSH=false
[[ "${2:-}" == "--harden-ssh" ]] && HARDEN_SSH=true

if [[ -z "$DOMAIN" ]]; then
  echo "用法：bash bootstrap-server.sh <你的域名> [--harden-ssh]" >&2
  exit 1
fi

if [[ $EUID -ne 0 ]]; then
  echo "请用 root 运行（sudo bash bootstrap-server.sh $DOMAIN）" >&2
  exit 1
fi

SITE_DIR=/var/www/blog
DEPLOY_USER=deploy
KEY_PATH=/home/$DEPLOY_USER/.ssh/deploy_key

echo "==> 1/6 创建 $DEPLOY_USER 用户与目录"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
mkdir -p "$SITE_DIR"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$SITE_DIR"
chmod 755 "$SITE_DIR"

echo "==> 2/6 安装软件包"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq \
  debian-keyring debian-archive-keyring apt-transport-https curl gnupg \
  rsync python3 fail2ban ufw unattended-upgrades >/dev/null
# 注意：python3 是必需的 —— rrsync 是个 Python 脚本，没有它部署会失败

if ! command -v caddy >/dev/null 2>&1; then
  curl -fsSL 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -fsSL 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -qq
  apt-get install -y -qq caddy >/dev/null
fi

echo "==> 3/6 写入 Caddyfile"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/Caddyfile" ]]; then
  sed "s/__DOMAIN__/$DOMAIN/" "$SCRIPT_DIR/Caddyfile" > /etc/caddy/Caddyfile
else
  # 没有模板文件时（比如 curl 单文件执行）就地生成一份等价的
  cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
	root * $SITE_DIR
	encode zstd gzip
	try_files {path}.html {path} {path}/index.html
	@hashed path /assets/*
	header @hashed Cache-Control "public, max-age=31536000, immutable"
	@media path /images/* /font/*
	header @media Cache-Control "public, max-age=2592000"
	file_server
}
EOF
fi
systemctl enable caddy >/dev/null 2>&1 || true
systemctl reload caddy 2>/dev/null || systemctl restart caddy || true

echo "==> 4/6 防火墙"
ufw allow 22/tcp >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null
systemctl enable fail2ban >/dev/null 2>&1 || true
systemctl restart fail2ban || true

echo "==> 5/6 自动安全更新"
dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null 2>&1 || true
systemctl enable unattended-upgrades >/dev/null 2>&1 || true

echo "==> 6/6 生成部署密钥（用 rrsync 限制为只能写 $SITE_DIR）"
mkdir -p /home/$DEPLOY_USER/.ssh
chmod 700 /home/$DEPLOY_USER/.ssh

if [[ ! -f "$KEY_PATH" ]]; then
  ssh-keygen -t ed25519 -N "" -C "gh-deploy" -f "$KEY_PATH" >/dev/null
fi

RRSYNC_BIN="$(command -v rrsync || echo /usr/bin/rrsync)"
if [[ "$RRSYNC_BIN" == "/usr/bin/rrsync" && ! -x /usr/bin/rrsync ]]; then
  echo "  !! 找不到 rrsync（rsync 包的一部分），部署会失败，请检查上面的安装步骤" >&2
fi
PUB_KEY="$(cat "$KEY_PATH.pub")"
# restrict: 关掉端口转发等一切额外能力
# command=: 只允许 rsync，且只能写 $SITE_DIR
cat > /home/$DEPLOY_USER/.ssh/authorized_keys <<EOF
restrict,command="$RRSYNC_BIN -wo $SITE_DIR" $PUB_KEY
EOF
chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh

if [[ "$HARDEN_SSH" == true ]]; then
  # 关键安全检查：只有系统中已经存在可用的公钥时才关闭密码登录，
  # 否则你（用密码登录的）会被立刻锁在外面。
  EXISTING_KEYS=0
  for f in /root/.ssh/authorized_keys /home/*/.ssh/authorized_keys; do
    [[ -s "$f" ]] && EXISTING_KEYS=$((EXISTING_KEYS + 1))
  done

  if [[ $EXISTING_KEYS -eq 0 ]]; then
    echo "  !! 没有检测到任何已配置的 SSH 公钥，跳过加固 —— 否则你会被锁在外面" >&2
    echo "     想加固的话：先在本地 ssh-keygen，把公钥加到 /root/.ssh/authorized_keys，" >&2
    echo "     确认能用密钥登录后，再手动写入 /etc/ssh/sshd_config.d/99-myblog.conf：" >&2
    echo "         PasswordAuthentication no" >&2
    echo "         PermitRootLogin no" >&2
  else
    cat > /etc/ssh/sshd_config.d/99-myblog.conf <<'EOF'
PasswordAuthentication no
PermitRootLogin no
EOF
    systemctl reload ssh 2>/dev/null || systemctl reload sshd || true
    echo "  已关闭密码登录与 root 登录（检测到 $EXISTING_KEYS 处已有公钥）"
  fi
else
  echo "  未改动 SSH 配置。确认本地已有密钥后，可以加 --harden-ssh 重跑，"
  echo "  或手动写入 /etc/ssh/sshd_config.d/99-myblog.conf："
  echo "      PasswordAuthentication no"
  echo "      PermitRootLogin no"
fi

cat <<EOF

============================================================
完成。接下来两件事：

【1】把下面这段**私钥**内容存到 GitHub 仓库的 Secret：
     名称：DEPLOY_SSH_KEY
     内容：先执行下面这条命令，把输出整体作为 Secret 值
            base64 -w0 $KEY_PATH

   再添加两个 Secret：
     DEPLOY_HOST = $(curl -s -m 3 ifconfig.me || echo "这台机器的公网 IP")
     DEPLOY_USER = $DEPLOY_USER

   存好后，在服务器上删掉私钥（它已经不需要留在服务器上了）：
     rm -f $KEY_PATH

【2】确认两处放行：
   - 腾讯云控制台 → 轻量应用服务器 → 防火墙：放行 443（默认只开了 22/80）
   - 域名解析：把 $DOMAIN 的 A 记录指向上面那个公网 IP

都就绪后，本地 git push 就会自动构建并部署。
============================================================
EOF
