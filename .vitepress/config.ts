import { getRssFeed } from "./theme/rss";
import { defineConfigWithTheme, PageData } from "vitepress";
import { ThemeConfig } from "../src/types";
import customElements from './mathjax.config'
import mathjax3 from 'markdown-it-mathjax3';

const links: { url: string; lastmod: PageData["lastUpdated"] }[] = [];

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
  base:"/MyBlog/",
  title: "Ethan",
  description: "Ethan's Note.",
  lang: "zh-CN",
  themeConfig: {
    sortBy: "date",
    dateFormat: "YYYY-MM-DD HH:mm:ss",
    editLink: {
      text: "✍",
      pattern: ({relativePath}: { relativePath: string }) => {
        return `https://github.com/fzdwx/vitepress-blog-theme/blob/main/${relativePath}`;
      },
    },
    issues: {
      showComment: true,
    },
    search: {
      provider: "local",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: "Home",
        link: "/",
      },
      {
        text: "Docs",
        link: "/tags?layout=doc",
      },
      { text: "Tags", link: "/tags?layout=post", activeMatch: "" },
    ],
    outline: {
      level: "deep",
      label: "文章大纲",
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/fzdwx/vitepress-blog-theme" },
    ],
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
      name: "fzdwx",
      email: "likelovec@gmail.com",
    },
    links: links,
    baseUrl: "https://vitepress-blog-theme.vercel.app",
    copyright:
      "Copyright (c) 2023-present, fzdwx<likelovec@gmail.com> and blog contributors",
  }),
  markdown: {
    config: (md) => {
      // 使用更多的 Markdown-it 插件！
      md.use(mathjax3)
    }
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag),
      },
    },
  },
});
