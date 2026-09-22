import { Page } from "@/types";
import { createContentLoader } from "vitepress";
import { deriveMeta } from "./meta";

/**
 * 列表 / 侧边栏 / 标签页共用的内容加载器。
 *
 * 目标：写一篇笔记只需要「建文件 + 写 H1 + 写正文」，frontmatter 全部可选。
 * 各项元数据的推导规则见 `src/utils/meta.ts`。
 *
 * ⚠️ 两个必须注意的点：
 * 1. glob 是相对 **srcDir**（content/）解析的，不是相对项目根目录。
 *    所以下面的 glob 只匹配 content/<分组>/<文章>.md 这种两级路径，
 *    顶层站点页（index.md / tags.md）不会进来。
 * 2. 本文件在构建期（Node）运行，返回值会被序列化给客户端，
 *    所以**不要把文章全文或渲染后的 HTML 放进返回值**，否则客户端负载会爆炸。
 */
export default createContentLoader("./*/*.md", {
  // excerpt 只取首段，比 render: true 小几个数量级
  excerpt: true,
  // 需要源码来提取 H1；它只在本文件的 transform 里用，不会进入返回值
  includeSrc: true,
  transform(raw): Page[] {
    return raw
      .map(({ url, src, excerpt, frontmatter }) => {
        const meta = deriveMeta({ url, src, excerpt, frontmatter });
        return { ...meta, url, frontmatter };
      })
      .sort((a, b) => b.update - a.update);
  },
});
