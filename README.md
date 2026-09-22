# MyBlog

个人技术笔记，用 VitePress 构建，部署在自己的服务器上。

## 写一篇笔记

```shell
pnpm new "笔记标题"           # 交互式选择分组
pnpm new "笔记标题" TypeScript # 或直接指定分组
```

然后只写正文。**frontmatter 全部可选** —— 元数据从路径和 git 推导：

| 字段 | 来源 |
| --- | --- |
| 标题 | 正文第一个 `# H1` |
| 分组 | 所在目录名（`content/<分组>/`） |
| 日期 | `frontmatter.date`，缺失则取 git 首次提交时间（没提交时用文件时间） |
| 摘要 | `frontmatter.summary`，缺失则取正文首段 |
| 版面 | 由路径推导（顶层 md 是站点页，子目录 md 是文章） |

唯一建议手写的是标签：

```markdown
---
tags: [TypeScript, 泛型]
---

# TypeScript 的泛型

正文……
```

## 常用命令

```shell
pnpm dev       # 本地写作（热更新）
pnpm build     # 构建，内部会先跑内容校验
pnpm check     # 只跑内容校验：H1 缺失 / 图片不存在 / 目录名不合法
pnpm preview   # 预览构建产物
```

`pnpm build` 会先执行 `scripts/check.mjs`：标题缺失、图片引用不存在、分组目录名不合法都会直接**报错中断**，避免这类问题静默上线。

## 目录结构

```
content/
  index.md              首页
  tags.md               标签总览
  <分组>/<文章>.md       文章，URL 形如 /TypeScript/Generic
  public/images/         图片（注意在 content 下：VitePress 的 publicDir 相对 srcDir 解析）
.vitepress/
  config.ts             站点配置 + Vite 配置 + 版面推导
  theme/                RSS / sitemap 生成
src/
  layout/               页面布局（首页 / 文章页 / 标签页）
  components/           列表、元信息、导航等组件
  styles/theme.css      赛博朋克主题（配色、底纹、组件样式）
  utils/meta.ts         元数据推导的纯函数，列表与 RSS 共用
scripts/                new / check / migrate 三个脚本
deploy/                 部署手册（README.md）与备选的自有服务器方案（vps/）
```

## 部署

部署到 **Cloudflare Workers 静态资源**，GitHub Actions 自动构建发布，免费且零运维。

**首次部署**（详细步骤见 `deploy/README.md`）：

1. 域名 NS 改到 Cloudflare（Workers 绑自定义域名要求域名在同一账号下）
2. Cloudflare 建一个 **Edit Cloudflare Workers** 模板的 API Token
3. 仓库里配两个 Secret：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`
4. `git push` 到 `master`

之后每次 push 都会自动构建 + 部署。构建里带了内容校验，校验不过就不会部署。

> 仓库里还保留了一套"自有服务器 + Caddy + rsync"的方案在 `deploy/vps/`，作为备选。
> 注意它需要 80/443 可用（证书签发要求），且不能与占用 443 的服务共存。

## 改动须知

- **改主题**：视觉集中在 `src/styles/theme.css`，VitePress 默认主题的观感靠 `--vp-c-*` 变量映射，改配色不需要动组件。
- **RSS / 摘要规则**：只改 `src/utils/meta.ts`，列表页和 RSS 共用这一份逻辑，不会出现两处不一致。
- **不要手动维护 `content/public/`**：那是静态资源目录，构建时原样拷贝。
- **构建依赖 `content/` 的目录层级**：顶层 `.md` 会被当成站点页而不是文章。
