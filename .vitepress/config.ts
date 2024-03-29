import { getRssFeed } from "./theme/rss";
import { defineConfigWithTheme, PageData } from "vitepress";
import { ThemeConfig } from "../src/types";

const links: { url: string; lastmod: PageData["lastUpdated"] }[] = [];

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
  base:"/MyBlog/",
  title: "Ethan",
  description: "Ethan's Note.",
  lang: "zh-CN",
  themeConfig: {
    sortBy: "date",
    icon: "https://raw.githubusercontent.com/fzdwx/blog-history/main/static/images/party_parrot.gif",
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
        text: "Notes",
        link: "/tags?layout=issue",
      },
      {
        text: "Docs",
        link: "/tags?layout=doc",
      },
      { text: "Tags", link: "/tags?layout=post", activeMatch: "" },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/fzdwx/vitepress-blog-theme" },
    ],
  },
  // head: [
  //   [
  //     "script",
  //     { src: "https://www.googletagmanager.com/gtag/js?id=your google" },
  //   ],
  //   [
  //     "script",
  //     {},
  //     `window.dataLayer = window.dataLayer || [];
  //     function gtag(){dataLayer.push(arguments);}
  //     gtag('js', new Date());

  //     gtag('config', 'your google');`,
  //   ],
  // ],
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
});
