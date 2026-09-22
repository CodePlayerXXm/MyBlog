import { createContentLoader, type SiteConfig } from "vitepress";
import { Author, Feed } from "feed";
import path from "path";
import { resolve } from "path";
import { writeFileSync, createWriteStream } from "fs";
import { SitemapStream } from "sitemap";
import { deriveMeta } from "../../src/utils/meta";

/**
 * RSS 与 sitemap。
 *
 * 元数据推导复用 `src/utils/meta.ts`，与列表页 / 侧边栏规则一致。
 * 这里的 glob 同样是相对 srcDir（content/）解析的 —— 只取 content/<分组>/<文章>.md。
 */
export const getRssFeed = ({
  baseUrl,
  links,
  copyright,
  author,
}: {
  baseUrl: string;
  copyright: string;
  links: any;
  author?: Author;
}) => {
  return async (config: SiteConfig) => {
    const posts = await createContentLoader("./*/*.md", {
      excerpt: true,
      includeSrc: true,
    }).load();

    const items = posts
      .map((p: any) => ({
        ...deriveMeta(p),
        url: p.url,
      }))
      .sort((a, b) => b.date - a.date);

    rss(config, baseUrl, copyright, items, author);

    await sitemap(baseUrl, config, links);
  };
};

async function sitemap(baseUrl: string, config: SiteConfig<any>, links: any) {
  const sitemap = new SitemapStream({ hostname: baseUrl });
  const writeStream = createWriteStream(resolve(config.outDir, "sitemap.xml"));
  sitemap.pipe(writeStream);
  links.forEach((link: any) => sitemap.write(link));
  sitemap.end();
  await new Promise((r) => writeStream.on("finish", r));
}

function rss(
  config: SiteConfig<any>,
  baseUrl: string,
  copyright: string,
  items: { title: string; url: string; desc: string; date: number }[],
  author?: Author
) {
  const feed = new Feed({
    title: config.site.title,
    description: config.site.description,
    language: config.site.lang,
    id: baseUrl,
    link: baseUrl,
    image: `${baseUrl}/favicon.ico`,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: copyright,
    author: author,
  });

  for (const { title, url, desc, date } of items) {
    feed.addItem({
      title,
      id: `${baseUrl}${url}`,
      link: `${baseUrl}${url}`,
      // 只放摘要不放全文：全文会让 feed 体积到 MB 级，对带宽不划算
      description: desc,
      date: new Date(date),
    });
  }

  writeFileSync(path.join(config.outDir, "rss.xml"), feed.rss2());
}
