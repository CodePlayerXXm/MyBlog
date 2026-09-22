#!/usr/bin/env node
/**
 * 修正 H1 结构：确保每篇文章有且只有一个 H1，并且它就是文章标题。
 *
 * 背景：这批笔记原本用 H1（含下划线式 `===`）写各章节标题，标题本身在 frontmatter.title 里。
 * 迁移删掉 title 并把标题改由 H1 提供之后，出现了两类问题：
 *   1. 多个 H1 的文章，页面标题变成了第一个章节名
 *   2. 下划线式 H1 没被识别，被额外插了一个 H1，造成重复
 *
 * 本脚本的做法：
 *   - 从 git 历史里取回原 frontmatter.title 作为权威标题
 *   - 下划线式 H1 统一转成 `#` 形式
 *   - 把第一个 H1 之外的所有 H1 降为 H2（它们本来就是章节标题，降级后也能进大纲）
 *   - 标题不对就补一行 H1
 *
 * 用法：node scripts/fix-h1.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const DRY = process.argv.includes("--dry");

function gitShow(file) {
  try {
    return execFileSync("git", ["show", `HEAD:${file}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

/** 去掉围栏代码块 */
const stripFences = (md) => md.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");

let changed = 0;
const report = [];

for (const g of readdirSync(CONTENT, { withFileTypes: true })) {
  if (!g.isDirectory() || g.name === "public") continue;

  for (const name of readdirSync(join(CONTENT, g.name))) {
    if (!name.endsWith(".md")) continue;
    const file = join(CONTENT, g.name, name);
    const raw = readFileSync(file, "utf8");

    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    const fm = fmMatch ? fmMatch[1] : "";
    let body = fmMatch ? raw.slice(fmMatch[0].length) : raw;

    // 当前 frontmatter 里的 title（迁移后一般已删）
    const curTitle = (fm.match(/^title:\s*(.*)$/m) || [])[1];
    // 从 git 历史取原 title（迁移前的权威标题）
    const oldPath = `content/docs/${g.name}/${name}`;
    const oldRaw = gitShow(oldPath);
    const oldFm = oldRaw ? (oldRaw.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || "" : "";
    const oldTitle = (oldFm.match(/^title:\s*(.*)$/m) || [])[1];
    const unquote = (s) => (s == null ? "" : s.trim().replace(/^["']|["']$/g, "").trim());
    const title = unquote(curTitle) || unquote(oldTitle);

    if (!title) {
      report.push(`跳过 ${g.name}/${name}：找不到标题来源`);
      continue;
    }

    // 1. 下划线式 H1 → ATX
    body = body.replace(/^([^\n]+)\r?\n=+\r?\n/gm, (_, text) => `# ${text.trim()}\n\n`);

    // 2. 找出所有 H1（跳过围栏）
    const lines = body.split(/\r?\n/);
    const h1Indexes = [];
    let inFence = false;
    lines.forEach((line, i) => {
      if (/^(```|~~~)/.test(line.trim())) inFence = !inFence;
      if (!inFence && /^#[ \t]+\S/.test(line)) h1Indexes.push(i);
    });

    const firstH1Text = h1Indexes.length
      ? lines[h1Indexes[0]].replace(/^#[ \t]+/, "").trim()
      : "";

    const notes = [];
    if (firstH1Text !== title) {
      // 标题不对（或没有 H1）：补一行标题，并把原有 H1 全部降级
      const demoted = h1Indexes.length;
      for (const i of h1Indexes) lines[i] = "#" + lines[i];
      lines.unshift(`# ${title}`, "");
      if (demoted) notes.push(`${demoted} 个原 H1 降为 H2`);
      notes.push("补标题 H1");
    } else {
      // 第一个 H1 就是标题，其余降级
      const extra = h1Indexes.slice(1);
      for (const i of extra) lines[i] = "#" + lines[i];
      if (extra.length) notes.push(`${extra.length} 个多余 H1 降为 H2`);
    }

    if (!notes.length) continue;

    const newBody = lines.join("\n").replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "") + "\n";
    const out = (fmMatch ? `---\n${fm}\n---\n\n` : "") + newBody;

    changed++;
    report.push(`${g.name}/${name}：${notes.join("、")}`);
    if (!DRY) writeFileSync(file, out, "utf8");
  }
}

console.log(`\n${DRY ? "[试运行] " : ""}处理完成，改动 ${changed} 个文件`);
report.forEach((r) => console.log("  · " + r));
console.log("");
