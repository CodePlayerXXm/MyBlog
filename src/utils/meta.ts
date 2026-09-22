import dayjs from "dayjs";
import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";

/**
 * 元数据推导的纯函数集合。
 *
 * 被 `src/utils/content.data.ts`（列表/侧边栏）和 `.vitepress/theme/rss.ts`（RSS）
 * 共用，保证两处的标题、日期、摘要规则完全一致。
 */

/** 目录名 → 显示名。目录保持 ASCII，展示按这里的映射 */
export const GROUP_LABEL: Record<string, string> = {
  Javascript: "JavaScript",
  Math: "数学",
};

/** 去掉围栏代码块，避免把代码注释里的 # 误当成标题 */
export function stripFences(md: string): string {
  return md.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}

export function stripFrontmatter(md: string): string {
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

/** 取正文第一个 H1 作为标题 */
export function extractTitle(src: string | undefined): string | undefined {
  if (!src) return undefined;
  const body = stripFences(stripFrontmatter(src));
  const m = body.match(/^#[ \t]+(.+?)[ \t]*$/m);
  return m ? m[1].trim() : undefined;
}

export function plainText(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** 去掉常见的 markdown 行内记号，只留文字 */
export function stripMarkdown(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接保留文字
    .replace(/`([^`]*)`/g, "$1") // 行内代码
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // 粗体
    .replace(/(\*|_)(.*?)\1/g, "$2") // 斜体
    .replace(/<[^>]*>/g, "") // HTML 标签
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 取正文第一个段落作为摘要。
 *
 * 不用 VitePress 的 `excerpt` 选项 —— 它走的是 gray-matter 的 `---` 分隔符语义，
 * 而我们的文章正文里没有 `---`，取出来是空的。
 */
export function firstParagraph(md: string | undefined): string {
  if (!md) return "";
  const lines = stripFrontmatter(md).split(/\r?\n/);
  const para: string[] = [];
  let inFence = false;

  for (const raw of lines) {
    const line = raw.trim();

    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (line === "") {
      if (para.length) break;
      continue;
    }
    // 跳过标题、容器标记、水平线、纯图片行
    if (/^#{1,6}\s/.test(line)) continue;
    if (/^:::+/.test(line)) continue;
    if (/^[-*_]{3,}$/.test(line)) continue;
    if (/^!\[[^\]]*\]\([^)]*\)$/.test(line)) continue;

    para.push(line);
  }

  return stripMarkdown(para.join(" "));
}

/** 从 loader 给的 url（相对 srcDir）取分组原始目录名 */
export function groupKeyFromUrl(url: string): string {
  return decodeURI(url).split("/").filter(Boolean)[0] ?? "Others";
}

/** 从 loader 给的 url 还原仓库里的文件路径（用于取 git 时间 / 校验） */
export function filePathFromUrl(url: string, srcDir = "content"): string {
  const rel = decodeURI(url)
    .split("/")
    .filter(Boolean)
    .join("/")
    .replace(/\.html$/, ".md");
  return `${srcDir}/${rel}`;
}

/**
 * 文章的「首次出现时间」（毫秒）：优先 git 首次提交时间，
 * 取不到就退回文件修改时间 —— 这样刚写好、还没提交的笔记不会显示成 1970 年。
 * 按文件缓存。
 */
const firstSeenCache = new Map<string, number | undefined>();
export function firstSeenTime(filePath: string): number | undefined {
  if (firstSeenCache.has(filePath)) return firstSeenCache.get(filePath);

  let result: number | undefined;
  try {
    const out = execFileSync(
      "git",
      [
        "log",
        "--diff-filter=A",
        "--format=%aI",
        "--max-count=1",
        "--",
        filePath,
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    const first = out.split("\n")[0]?.trim();
    if (first) {
      const t = dayjs(first).valueOf();
      if (!Number.isNaN(t)) result = t;
    }
  } catch {
    // 不在 git 仓库里、或 git 不可用
  }

  if (result === undefined) {
    try {
      result = statSync(filePath).mtimeMs;
    } catch {
      // 文件既不在 git 里也读不到，保持 undefined
    }
  }

  firstSeenCache.set(filePath, result);
  return result;
}

export interface DerivedMeta {
  title: string;
  group: string;
  groupKey: string;
  date: number;
  update: number;
  desc: string;
}

/** 由 loader 的原始条目推导出全部元数据。frontmatter 里的同名字段优先 */
export function deriveMeta(item: {
  url: string;
  src?: string;
  excerpt?: string;
  frontmatter: Record<string, any>;
}): DerivedMeta {
  const { url, src, excerpt, frontmatter } = item;
  const groupKey = groupKeyFromUrl(url);
  const filePath = filePathFromUrl(url);

  const date =
    dayjs(frontmatter.date).valueOf() || firstSeenTime(filePath) || 0;
  const update = frontmatter.update ? dayjs(frontmatter.update).valueOf() : date;

  return {
    title:
      frontmatter.title ||
      extractTitle(src) ||
      decodeURI(url).replace(/\.html$/, "").split("/").filter(Boolean).pop()!,
    group: GROUP_LABEL[groupKey] ?? groupKey,
    groupKey,
    date,
    update,
    desc:
      frontmatter.summary ||
      firstParagraph(src) ||
      plainText(excerpt) ||
      "",
  };
}
