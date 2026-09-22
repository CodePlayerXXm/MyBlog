#!/usr/bin/env node
/**
 * 新建一篇笔记：只写 H1，其余元数据由路径和 git 推导。
 *
 * 用法：
 *   pnpm new "V8 引擎垃圾回收"              交互式选择分组
 *   pnpm new "V8 引擎垃圾回收" Javascript   指定分组
 */
import { readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");

const [title, groupArg] = process.argv.slice(2);

if (!title) {
  console.error('用法：pnpm new "<标题>" [分组]');
  process.exit(1);
}

const groups = readdirSync(CONTENT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== "public")
  .map((e) => e.name);

if (!groups.length) {
  console.error("content/ 下还没有任何分组目录，请先手动建一个，例如 content/TypeScript/");
  process.exit(1);
}

async function pickGroup() {
  if (groupArg) {
    if (!groups.includes(groupArg)) {
      console.error(
        `分组 "${groupArg}" 不存在。现有分组：${groups.join(", ")}\n` +
          `（要用新分组就直接 mkdir content/${groupArg}）`,
      );
      process.exit(1);
    }
    return groupArg;
  }

  console.log("选择分组：");
  groups.forEach((g, i) => console.log(`  ${i + 1}. ${g}`));
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question("输入序号：")).trim();
  rl.close();

  const idx = Number(answer) - 1;
  if (!Number.isInteger(idx) || idx < 0 || idx >= groups.length) {
    console.error("序号无效");
    process.exit(1);
  }
  return groups[idx];
}

/** 标题 → 文件名。保留中文与字母数字，空格与符号换成 - */
function slugify(s) {
  return s
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const group = await pickGroup();
const slug = slugify(title);
const file = join(CONTENT, group, `${slug}.md`);

if (existsSync(file)) {
  console.error(`文件已存在，未覆盖：content/${group}/${slug}.md`);
  process.exit(1);
}

// 注意：不写 frontmatter —— 标题取自 H1，分组取自目录，日期取自 git。
// 需要时再加 tags: [xxx]
writeFileSync(file, `# ${title}\n\n`, "utf8");

console.log(`\n已创建 content/${group}/${slug}.md`);
console.log("格式：正文第一行是 H1（就是标题），其余元数据自动推导。");
console.log("需要标签就加一行 frontmatter：tags: [xxx]\n");
