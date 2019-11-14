const { description } = require("../../package");

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: "一位前端工程师的修炼笔记",
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,
  base:"/MyBlog/",
  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ["meta", { name: "theme-color", content: "#3eaf7c" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    [
      "meta",
      { name: "apple-mobile-web-app-status-bar-style", content: "black" }
    ],
    ["link", { rel: "icon", href: "/favicon.png" }]
  ],
  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: "",
    editLinks: false,
    docsDir: "",
    editLinkText: "",
    lastUpdated: "Last Updated",
    nav: [
      {
        text: "主页",
        link: "/",
        class: "icon-zhuye"
      },
      {
        text: "标签",
        link: "/tags/",
        class: "icon-biaoqian"
      }
    ],
    sidebar: {
      "/guide/": [
        {
          title: "Guide",
          collapsable: false,
          children: ["", "using-vue"]
        }
      ]
    }
  },
  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */ plugins: [
    "@vuepress/plugin-back-to-top",
    "@vuepress/plugin-medium-zoom",
    [
      "vuepress-plugin-comment",
      {
        choosen: "valine",
        // options选项中的所有参数，会传给Valine的配置
        options: {
          el: "#valine-vuepress-comment",
          appId: "BqwiclsjRVjcNj1kRMveAROC-gzGzoHsz",
          appKey: "SfMax0EqoUx4wQE5LC98xLiH",
          placeholder: "请输入你的评论。"
        }
      }
    ]
  ]
};
