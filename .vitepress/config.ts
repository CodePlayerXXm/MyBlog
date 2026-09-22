import { getRssFeed } from "./theme/rss";
import { defineConfigWithTheme, PageData } from "vitepress";
import { ThemeConfig } from "../src/types";
import customElements from "./mathjax.config";
import mathjax3 from "markdown-it-mathjax3";
import { fileURLToPath } from "node:url";
import vueJsx from "@vitejs/plugin-vue-jsx";
import AutoImport from "unplugin-auto-import/vite";

// 站点地址。RSS、sitemap 都用它，写错了会把错误域名发布出去。
const SITE_URL = "https://643336.xyz";
const GITHUB_REPO = "https://github.com/CodePlayerXXm/MyBlog";

if (!SITE_URL.startsWith("https://") || SITE_URL.includes("example.com")) {
  console.warn(
    "\n⚠️  .vitepress/config.ts 的 SITE_URL 看起来不对 —— RSS 与 sitemap 里的域名会是错的。\n",
  );
}

const links: { url: string; lastmod: PageData["lastUpdated"] }[] = [];

/**
 * 中文友好的搜索分词器。
 *
 * MiniSearch 默认按空白/标点切分，中文整段会变成一个大 token ——
 * 结果是搜「闭包」永远搜不到东西。这里用 Intl.Segmenter 做真正的中文分词
 * （Node 与现代浏览器都内置），不支持的环境退回逐字切分。
 *
 * ⚠️ 这个函数会被序列化成源码发到客户端，内部不能引用外部变量。
 */
const cjkTokenize = (text: string): string[] => {
  const hasSegmenter =
    typeof Intl !== "undefined" && typeof (Intl as any).Segmenter === "function";
  if (hasSegmenter) {
    const segmenter = new (Intl as any).Segmenter("zh", {
      granularity: "word",
    });
    const out: string[] = [];
    for (const part of segmenter.segment(text)) {
      if (part.isWordLike) out.push(part.segment);
    }
    return out;
  }
  return String(text)
    .split(/[\s\u3000]+|(?=[\u4e00-\u9fff])/)
    .filter(Boolean);
};

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
  base: "/",
  // 内容根目录。顶层 .md 是站点页，子目录里的 .md 是文章 —— 见下面的 transformPageData
  srcDir: "content",
  title: "Ethan",
  description: "Ethan's Note.",
  lang: "zh-CN",
  // URL 去掉 .html 后缀
  cleanUrls: true,
  // 赛博朋克主题只有深色一种形态，隐藏明暗切换
  appearance: "force-dark",
  themeConfig: {
    sortBy: "date",
    dateFormat: "YYYY-MM-DD HH:mm:ss",
    editLink: {
      text: "✍",
      // 注意：这个函数会被序列化成源码发到客户端，不能引用模块级变量
      pattern: ({ relativePath }: { relativePath: string }) =>
        `https://github.com/CodePlayerXXm/MyBlog/blob/master/content/${relativePath}`,
    },
    search: {
      provider: "local",
      options: {
        miniSearch: {
          // 索引侧分词
          options: { tokenize: cjkTokenize },
          // 查询侧分词 —— 两侧必须一致，否则查不到
          searchOptions: { tokenize: cjkTokenize },
        },
      },
    },
    nav: [
      { text: "Home", link: "/" },
      { text: "Tags", link: "/tags" },
    ],
    outline: {
      level: "deep",
      label: "文章大纲",
    },
    socialLinks: [{ icon: "github", link: GITHUB_REPO }],
  },

  /**
   * 版面由路径推导，不需要在 frontmatter 里手写 `layout`：
   *   index.md        → home
   *   tags.md         → tags
   *   <分组>/<文章>.md → doc
   *   其它顶层 md      → 无 layout（走默认 <Content/> 渲染）
   */
  transformPageData(pageData) {
    const rel = pageData.relativePath;
    if (rel === "index.md") {
      pageData.frontmatter.layout = "home";
    } else if (rel === "tags.md") {
      pageData.frontmatter.layout = "tags";
    } else if (rel.includes("/")) {
      pageData.frontmatter.layout = "doc";
    }
  },

  transformHtml: (_, id, { pageData }) => {
    if (!/[\\/]404\.html$/.test(id))
      links.push({
        url: pageData.relativePath.replace(/((^|\/)index)?\.md$/, "$2"),
        lastmod: pageData.lastUpdated,
      });
  },
  buildEnd: getRssFeed({
    author: {
      name: "Ethan",
    },
    links: links,
    baseUrl: SITE_URL,
    copyright: `Copyright (c) ${new Date().getFullYear()} Ethan`,
  }),
  markdown: {
    config: (md) => {
      // 使用更多的 Markdown-it 插件！
      md.use(mathjax3);
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag),
      },
    },
  },

  /**
   * Vite 配置必须写在 .vitepress/config.ts 里，不能放在根目录的 vite.config.ts ——
   * VitePress 会把 Vite 的 root 设为 srcDir，于是根目录的 vite.config.ts 不会被加载。
   */
  vite: {
    resolve: {
      alias: {
        "@/": fileURLToPath(new URL("../src/", import.meta.url)),
      },
    },
    esbuild: {
      jsxFactory: "h",
      jsxFragment: "Fragment",
    },
    plugins: [
      vueJsx({}),
      // https://github.com/antfu/unplugin-auto-import
      // 注意：dirs 必须用绝对路径 —— Vite 的 root 是 srcDir(content/)，相对路径会解析到 content/ 下而找不到文件
      AutoImport({
        imports: ["vue", "vue/macros", "@vueuse/core"],
        dts: true,
        dirs: [
          fileURLToPath(new URL("../src/components", import.meta.url)),
          fileURLToPath(new URL("../src/utils", import.meta.url)),
          fileURLToPath(new URL("../src/types", import.meta.url)),
        ],
        vueTemplate: true,
        eslintrc: {
          enabled: true,
        },
      }),
    ],
  },
});
