#!/usr/bin/env node
/**
 * 一次性内容迁移：把旧主题的 frontmatter 约定统一到新约定。
 *
 * 新约定：
 *   - 标题 = 正文第一个 H1（不再写 frontmatter.title）
 *   - 分组 = 目录名（不再写 group）
 *   - 版面 = 路径推导（不再写 layout / sidebar）
 *   - 日期 = frontmatter.date 覆盖，缺失则取 git（保留现有 date，不依赖 git 历史）
 *   - 摘要 = frontmatter.summary 覆盖，缺失则取正文首段
 *
 * 本脚本做四件事：
 *   1. 给没有 H1 的文章补一行 `# <原 title>`
 *   2. 删掉 layout / group / sidebar / title
 *   3. 删掉与标题完全相同的 summary（冗余，删掉后会自动改用正文首段）
 *   4. 归一化写错的日期格式，如 2021-1-02T13:54:36+08:00 → 2021-01-02T13:54:36+08:00
 *
 * 不含多行 YAML 值的文件才会被处理；有缩进续行的文件会跳过并列出，交人工处理。
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const DROP_KEYS = ["layout", "group", "sidebar", "title"];
const DRY = process.argv.includes("--dry");

const stats = {
  files: 0,
  h1Added: 0,
  keysDropped: 0,
  summaryDropped: 0,
  datesFixed: 0,
  skipped: [],
};

const unquote = (v) =>
  String(v == null ? "" : v)
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();

for (const entry of readdirSync(CONTENT, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === "public") continue;
  const dir = join(CONTENT, entry.name);

  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md")) continue;
    const file = join(dir, name);
    const raw = readFileSync(file, "utf8");

    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) {
      stats.skipped.push(`${entry.name}/${name}：没有 frontmatter`);
      continue;
    }

    const fmBlock = m[1];
    const body = raw.slice(m[0].length);
    const lines = fmBlock.split(/\r?\n/);

    // 有 YAML 续行（缩进行）就跳过，避免误删子项
    if (lines.some((l) => /^\s+\S/.test(l))) {
      stats.skipped.push(`${entry.name}/${name}：frontmatter 含多行值`);
      continue;
    }

    const get = (key) => {
      const line = lines.find((l) => new RegExp(`^${key}\\s*:`).test(l));
      return line ? unquote(line.replace(new RegExp(`^${key}\\s*:`), "")) : undefined;
    };

    const title = get("title");
    const summary = get("summary");

    const out = [];
    let droppedHere = 0;

    for (const line of lines) {
      const key = (line.match(/^([A-Za-z_-]+)\s*:/) || [])[1];

      if (key && DROP_KEYS.includes(key)) {
        droppedHere++;
        continue;
      }

      // 与标题相同的 summary 属于冗余，删掉后摘要改用正文首段
      if (key === "summary" && title && unquote(summary) === title) {
        stats.summaryDropped++;
        continue;
      }

      // 日期归一化：把 2021-1-02T... 这类补零
      if (key === "date") {
        const fixed = line.replace(
          /(\d{4})-(\d)-(\d{2})T/,
          (_, y, mo, d) => `${y}-${String(mo).padStart(2, "0")}-${d}T`,
        );
        if (fixed !== line) stats.datesFixed++;
        out.push(fixed);
        continue;
      }

      out.push(line);
    }

    stats.keysDropped += droppedHere;

    // 补 H1
    const withoutFences = body.replace(/```[\s\S]*?```/g, "");
    const hasH1 = /^#[ \t]+.+$/m.test(withoutFences);
    let newBody = body.replace(/^\s*\n/, "");

    if (!hasH1) {
      if (!title) {
        stats.skipped.push(`${entry.name}/${name}：没有 H1 也没有 title，无法补`);
        continue;
      }
      newBody = `# ${title}\n\n${newBody}`;
      stats.h1Added++;
    }

    const newFm = out.join("\n").replace(/\n+$/, "");
    const result = `---\n${newFm}\n---\n\n${newBody.replace(/\s+$/, "")}\n`;

    if (result !== raw) {
      stats.files++;
      if (!DRY) writeFileSync(file, result, "utf8");
    }
  }
}

console.log(`\n${DRY ? "[试运行] " : ""}迁移完成`);
console.log(`  改动文件：${stats.files}`);
console.log(`  补正文 H1：${stats.h1Added}`);
console.log(`  删除旧字段：${stats.keysDropped}（layout / group / sidebar / title）`);
console.log(`  删除冗余 summary：${stats.summaryDropped}`);
console.log(`  修正日期格式：${stats.datesFixed}`);
if (stats.skipped.length) {
  console.log(`  跳过 ${stats.skipped.length} 个文件（需人工看）：`);
  for (const s of stats.skipped) console.log("    · " + s);
}
console.log("");
