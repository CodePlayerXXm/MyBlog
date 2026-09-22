#!/usr/bin/env node
/**
 * 内容校验：构建前跑一遍，把「静默出错」变成明确报错。
 *
 * 为什么需要它：改元数据推导之前，layout 拼错只会渲染成光秃秃的页面；
 * 图片路径写错只在打开页面时看到 404。这类问题在构建时就能拦住。
 *
 * 错误（会中断构建）：标题缺失、图片引用不存在、分组目录名不合法
 * 提示（不中断）：残留的旧约定字段、没有 tags 的文章、未被引用的图片
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const PUBLIC_IMAGES = join(CONTENT, "public", "images");

const errors = [];
const notices = [];

/** content/<分组>/*.md —— 只取文章，不含顶层站点页 */
function listArticles() {
  const out = [];
  for (const entry of readdirSync(CONTENT, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "public") continue;
    const dir = join(CONTENT, entry.name);
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".md")) out.push({ group: entry.name, path: join(dir, f) });
    }
  }
  return out;
}

function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : "";
}

/** 去掉围栏代码块，避免把代码注释里的 # 误当成标题 */
function stripFences(md) {
  return md.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}

function hasH1(src) {
  const body = stripFences(src.replace(/^---[\s\S]*?\r?\n---\r?\n?/, ""));
  return /^#[ \t]+.+$/m.test(body);
}

/** 统计正文里的 H1 数量（跳过围栏代码块，含下划线式） */
function countH1(src) {
  let body = src.replace(/^---[\s\S]*?\r?\n---\r?\n?/, "");
  body = body.replace(/^([^\n]+)\r?\n=+\r?\n/gm, (_, t) => `# ${t.trim()}\n\n`);
  const lines = stripFences(body).split(/\r?\n/);
  return lines.filter((l) => /^#[ \t]+\S/.test(l)).length;
}

const articles = listArticles();
const referenced = new Set();

for (const { group, path } of articles) {
  const rel = relative(ROOT, path);
  const src = readFileSync(path, "utf8");
  const fm = parseFrontmatter(src);

  // 1. 标题：frontmatter.title 或正文 H1，至少有一个
  if (!/^title\s*:/m.test(fm) && !hasH1(src)) {
    errors.push(
      `${rel}：既没有 frontmatter.title 也没有正文 H1，标题会退化成文件名`,
    );
  }

  // 1b. H1 必须唯一 —— 多于一个时标题会取到第一个，容易取成某个章节名
  const h1Count = countH1(src);
  if (h1Count > 1) {
    errors.push(
      `${rel}：有 ${h1Count} 个 H1，标题会取到第一个。章节标题请用 ##（只保留一个 H1 作标题）`,
    );
  }

  // 2. 分组目录名会进 URL，不能有空格和非 ASCII 字符
  if (/[^\x20-\x7E]/.test(group) || /\s/.test(group)) {
    errors.push(`${rel}：分组目录名 "${group}" 含空格或非 ASCII 字符，会成为 URL 段`);
  }

  // 3. 图片引用必须存在
  const imgRe = /(?:src=["']|\]\()(\/images\/[^"')\s]+)/g;
  let m;
  while ((m = imgRe.exec(src))) {
    const url = m[1];
    referenced.add(decodeURI(url));
    if (!existsSync(join(ROOT, "content", "public", url))) {
      errors.push(`${rel}：图片不存在 ${url}`);
    }
  }

  // 4. 旧约定字段提醒（版面与分组现在都由路径推导）
  for (const legacy of ["layout", "group", "sidebar"]) {
    if (new RegExp(`^${legacy}\\s*:`, "m").test(fm)) {
      notices.push(`${rel}：frontmatter 里的 ${legacy} 已由路径推导，可以删掉`);
    }
  }

  // 5. tags 建议写成内联数组
  if (/^tags\s*:/m.test(fm) && !/^tags\s*:\s*\[/m.test(fm) && !/^tags\s*:\s*$/m.test(fm)) {
    notices.push(`${rel}：tags 建议写成内联数组，例如 tags: [AI, RAG]`);
  }

  // 6. 行内公式内侧不能有多余空格，否则不会被渲染、会原样显示成 LaTeX 文本
  //    （markdown-it 的 `$...$` 规则要求 `$` 内侧不紧跟空格，以避免误判 "$5 和 $10"）
  const masked = src
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, "."))
    .replace(/`[^`\n]*`/g, (m) => m.replace(/[^\n]/g, "."));
  masked.split(/\r?\n/).forEach((line, i) => {
    const re = /(?<!\$)\$(?!\$)([^$\n]{1,120}?)\$(?!\$)/g;
    let m2;
    while ((m2 = re.exec(line))) {
      const inner = m2[1];
      if (!/^\s|\s$/.test(inner)) continue;
      if (!/\\[a-zA-Z]+|[a-zA-Z0-9]/.test(inner)) continue;
      errors.push(
        `${rel}:${i + 1}：行内公式「${m2[0]}」的 $ 内侧有多余空格，不会被渲染（应写成「$${inner.trim()}$」）`,
      );
    }
  });
}

// 未被引用的图片（仅提示）
if (existsSync(PUBLIC_IMAGES)) {
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else {
        const url = "/images/" + relative(PUBLIC_IMAGES, p).replace(/\\/g, "/");
        if (!referenced.has(url)) notices.push(`未被引用的图片：${url}`);
      }
    }
  };
  walk(PUBLIC_IMAGES);
}

const uniqueNotices = [...new Set(notices)];

console.log(`\n检查了 ${articles.length} 篇文章`);
if (uniqueNotices.length) {
  console.log(`\n提示（${uniqueNotices.length}）：`);
  for (const n of uniqueNotices.slice(0, 30)) console.log("  · " + n);
  if (uniqueNotices.length > 30) console.log(`  · …还有 ${uniqueNotices.length - 30} 条`);
}

if (errors.length) {
  console.log(`\n❌ 错误（${errors.length}）：`);
  for (const e of errors) console.log("  ✗ " + e);
  console.log("");
  process.exit(1);
}

console.log("\n✓ 内容检查通过\n");
