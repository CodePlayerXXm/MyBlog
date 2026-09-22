# 部署操作手册

静态站部署到 **Cloudflare Workers 静态资源**，由 GitHub Actions 自动构建并发布。

```
你本地                GitHub Actions                    Cloudflare
git push ──► 构建（含内容校验）──wrangler deploy──►  Workers 静态资源
                                                      ▲ 自定义域名 + 自动 HTTPS
```

选这条路的理由：免费、零运维、不用管证书和服务器；博客能被稳定打开。原来那套
"自有服务器 + Caddy + rsync" 的方案保留在 `deploy/vps/`，作为备选（例如将来换了台
不用做代理的机器，或者域名备了案想走国内节点）。

## 前置：把域名接入 Cloudflare

Workers 绑定自定义域名要求域名在同一账号下，所以需要把域名的 NS 改到 Cloudflare：

1. 注册 / 登录 [Cloudflare](https://dash.cloudflare.com)，Add a site 输入你的域名，选 Free 计划
2. Cloudflare 会给你两个 NS 地址，去域名注册商处把 NS 改成这两个
3. 等生效（通常几分钟到几小时，`dig NS 你的域名` 能看到 Cloudflare 的 NS 即为生效）

> 域名可以继续在原注册商续费，只是解析交给 Cloudflare。这一步是必须的，不是可选优化。

## 第一次部署

### 1. 创建 API Token

Cloudflare 控制台 → 右上角头像 → **My Profile** → **API Tokens** → **Create Token**
→ 用 **"Edit Cloudflare Workers"** 模板 → 创建后复制 token（只显示一次）。

### 2. 拿到 Account ID

控制台 → **Workers & Pages** → 右侧栏能看到 **Account ID**。

### 3. 配置 GitHub Secrets

仓库 → Settings → Secrets and variables → Actions：

| Secret | 值 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | 上一步复制的 token |
| `CLOUDFLARE_ACCOUNT_ID` | 上一步复制的 Account ID |

### 4. 触发部署

```shell
git push          # 推到 master 即触发
```

也可以在仓库 Actions 页面手动点 **Deploy → Run workflow**。

首次部署成功后，站点已经能通过默认域名访问：
`https://myblog.<你的账号子域>.workers.dev` —— 先用它验证页面正常，再绑自定义域名。

> 注意 `*.workers.dev` 在国内多数网络下不通，所以**必须绑自定义域名**，别拿默认域名当正式地址。

### 5. 绑定自定义域名

控制台 → **Workers & Pages** → 选中 `myblog` → **Settings** → **Domains & Routes**
→ **Add** → **Custom domain** → 填你的域名（如 `blog.example.com`）。

绑定后 Cloudflare 自动签发并续期证书，不用做别的。

> **先清理旧 DNS 记录**：接入 Cloudflare 时它会自动导入你原有的解析记录。如果里面有指向
> 别的服务器（旧 VPS、另一台代理机）的 A 记录，**要先在 Cloudflare 的 DNS 页面删掉**，
> 否则会和 Worker 的解析冲突。删之前确认那条记录对应的服务已经不需要了。

## 之后的日常部署

```shell
git push    # 推到 master 即自动构建 + 部署
```

- `pnpm build` 内含内容校验（`scripts/check.mjs`）：H1 缺失/重复、图片引用不存在、
  公式内侧带空格、分组目录名不合法都会**让构建失败，从而不会部署**。
- 免费额度：每天 10 万次请求，静态资源请求不消耗 CPU 时间；单次部署最多 2 万个文件、
  单文件 25 MiB（当前约 670 个文件、最大 1.7 MB）。

## 验证清单

```shell
curl -I https://你的域名                     # 200
curl -I https://你的域名/TypeScript/Generic  # 200（cleanUrls 是否生效）
curl -I https://你的域名/TypeScript/Generic.html  # 307 跳到上面那个
curl -s https://你的域名/rss.xml | head       # 域名是否是你的
```

浏览器里再确认：样式正常、图片能加载、搜索能搜到中文、公式渲染正确。

最后用 itdog 之类做**分运营商**多节点测速，那才是读者真实体验。Cloudflare 在国内
通常 130–220ms 且比较稳定。

## 排查表

| 现象 | 原因 |
| --- | --- |
| Actions 报 `Authentication error` | `CLOUDFLARE_API_TOKEN` 权限不对（要用 Edit Cloudflare Workers 模板） |
| Actions 报找不到 account | `CLOUDFLARE_ACCOUNT_ID` 填错 |
| 部署成功但打不开自定义域名 | 域名 NS 还没切到 Cloudflare，或自定义域名没添加 |
| 文章页 404 | `wrangler.jsonc` 里的 `html_handling` 被改了 —— 必须是 `auto-trailing-slash` |
| `xxx.html` 打不开 | 同上；正常行为是 307 跳到不带 .html 的干净 URL |
| 首页正常但搜索无结果 | 搜索索引是懒加载的，首次打开搜索会拉 500KB 左右，等一秒 |
| 部署成功但样式丢了 | 浏览器缓存了旧资源哈希，强刷 |

## 备选：自有服务器方案

`deploy/vps/` 里是完整的一套（Caddy + rsync + GitHub Actions + 一句话初始化脚本），
适用于：不用做代理的机器、或者域名已备案想走国内节点的情况。

**注意**：如果服务器上已有服务占用 443（例如代理软件），Caddy 会启动失败；另外
Let's Encrypt 签发证书需要 80 或 443 可用。用之前先确认：

```shell
ss -lntp | grep -E ':80|:443'
ss -lnup | grep -E ':80|:443'
```

使用方式见 `deploy/vps/bootstrap-server.sh` 顶部注释。
