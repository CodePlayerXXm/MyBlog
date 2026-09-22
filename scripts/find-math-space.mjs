#!/usr/bin/env node
/**
 * 找出「行内公式因为内侧有多余空格而不渲染」的地方，并提供修复。
 *
 * 背景：markdown-it 系的行内公式规则要求 `$` 内侧不能紧跟空格
 * （这条规则是为了避免把 "$5 和 $10" 误判成公式）。所以
 *     $\LARGE a, b, c $
 * 这种结尾带空格的写法不会渲染，会原样显示成 LaTeX 文本。
 *
 * 用法：
 *   node scripts/find-math-space.mjs          # 只报告
 *   node scripts/find-math-space.mjs --fix    # 去掉多余空格
 *
 * 安全措施：跳过围栏代码块与行内代码；只处理「内含反斜杠或数学符号」的
 * 候选，避免误伤 `$el` / `$data` 这类正文里成对出现的美元符号。
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const FIX = process.argv.includes("--fix");

/** 掩掉围栏代码块和行内代码，保持字符位置不变（用点填充） */
function maskCode(src) {
  const blank = (m) => m.replace(/[^\n]/g, ".");
  return src
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/~~~[\s\S]*?~~~/g, blank)
    .replace(/`[^`\n]*`/g, blank);
}

/** 内容像不像 LaTeX：含反斜杠命令，或只由数学符号/字母数字组成 */
function looksLikeTex(s) {
  if (/\\[a-zA-Z]+/.test(s)) return true;
  return /^[\s\d+\-*/=<>^_{}()[\],.;!|a-zA-Z]+$/.test(s) && /[a-zA-Z0-9]/.test(s);
}

function collect(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "public") collect(p, out);
    } else if (e.name.endsWith(".md")) {
      out.push(p);
    }
  }
  return out;
}

let total = 0;
const files = collect(CONTENT);

for (const file of files) {
  const raw = readFileSync(file, "utf8");
  const masked = maskCode(raw);
  const lines = masked.split(/\r?\n/);
  let changed = false;
  const rawLines = raw.split(/\r?\n/);

  lines.forEach((line, li) => {
    // 单美元行内公式，前后都不挨着 $（排除 $$）
    const re = /(?<!\$)\$(?!\$)([^$\n]{1,120}?)\$(?!\$)/g;
    let m;
    let outLine = null;
    while ((m = re.exec(line))) {
      const inner = m[1];
      if (!/^\s|\s$/.test(inner)) continue;
      if (!looksLikeTex(inner.trim())) continue;

      const start = m.index;
      const end = m.index + m[0].length;
      total++;
      const rel = file.replace(ROOT + "\\", "").replace(ROOT + "/", "");
      console.log(`${rel}:${li + 1}  「${m[0]}」 → 「$${inner.trim()}$」`);

      if (FIX) {
        if (!outLine) outLine = rawLines[li];
        // 在原始行上按同样位置替换（掩码不改变长度）
        outLine =
          outLine.slice(0, start) + "$" + inner.trim() + "$" + outLine.slice(end);
        rawLines[li] = outLine;
        changed = true;
      }
    }
  });

  if (changed) writeFileSync(file, rawLines.join("\n"), "utf8");
}

console.log(
  `\n共 ${total} 处${FIX ? "（已修复）" : "（未修改，加 --fix 执行修复）"}`,
);
