import Layout from "./Layout.vue";
import "./styles/tailwind.postcss";
import "./styles/reset.css";
import "./styles/var.css";
import "./styles/font.css";
// cover.css 名字起得有误导性，其实是通用布局样式（卡片点击层、内联代码、文档区留白等），必须保留
import "./styles/cover.css";
import "./styles/prose.css";
import "./styles/main.content.css";
import "./style.css";
// 赛博朋克主题放最后，保证覆盖前面的默认样式
import "./styles/theme.css";
import { ThemeConfig } from "./types";

export { Layout };

export { type ThemeConfig };
