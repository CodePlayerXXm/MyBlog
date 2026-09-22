<script setup lang="ts">
import { useData } from "vitepress";
import { getPages } from "../utils";
import PageList from "./../components/PageList.vue";

const { theme } = useData();

const posts = computed(() => getPages(theme.value));

const stats = computed(() => {
  const all = posts.value;
  const groups = new Map<string, number>();
  const tags = new Set<string>();
  for (const p of all) {
    groups.set(p.group, (groups.get(p.group) ?? 0) + 1);
    for (const t of p.frontmatter.tags ?? []) tags.add(t);
  }
  return {
    total: all.length,
    groups: [...groups.entries()].sort((a, b) => b[1] - a[1]),
    tagCount: tags.size,
    latest: all[0]?.date ?? 0,
  };
});

const fmtDate = (t: number) =>
  t ? new Date(t).toISOString().slice(0, 10) : "—";
</script>

<template>
  <div class="home">
    <!-- 非对称 Hero：左侧主视觉，右侧 HUD 数据面板 -->
    <section class="hero">
      <div class="hero-main">
        <p class="section-label">personal notes / 技术笔记</p>
        <h1 class="hero-title glitch-title">Ethan's Note.</h1>
        <p class="hero-sub term-line cursor">记录前端与 AI 相关的学习笔记</p>
        <p class="hero-desc">
          写一篇笔记只需要建一个 markdown 文件、写一行 H1 —— 标题、分组、日期、摘要都由路径和 git 自动推导。
        </p>
      </div>

      <aside class="hud-panel hero-hud">
        <p class="section-label">system status</p>
        <div class="hud-readout">
          <span class="k">articles</span>
          <span class="v">{{ stats.total }}</span>
        </div>
        <div class="hud-readout">
          <span class="k">groups</span>
          <span class="v">{{ stats.groups.length }}</span>
        </div>
        <div class="hud-readout">
          <span class="k">tags</span>
          <span class="v">{{ stats.tagCount }}</span>
        </div>
        <div class="hud-readout">
          <span class="k">last update</span>
          <span class="v">{{ fmtDate(stats.latest) }}</span>
        </div>
      </aside>
    </section>

    <div class="hazard-stripe" />

    <!-- 分组索引 -->
    <section class="groups">
      <p class="section-label">index</p>
      <ul class="group-list">
        <li
          v-for="[name, count] in stats.groups"
          :key="name"
          class="group-item"
        >
          <span class="group-name">{{ name }}</span>
          <span class="group-count">{{ String(count).padStart(2, "0") }}</span>
        </li>
      </ul>
    </section>

    <div class="hazard-stripe" />

    <!-- 文章列表 -->
    <section class="list">
      <p class="section-label">all posts</p>
      <Content class="home-intro vp-doc prose dark:prose-invert" />
      <PageList :pages="posts" />
    </section>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
}

/* --- Hero --- */

.hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  padding: 56px 0 40px;
  align-items: end;
}

@media (min-width: 900px) {
  /* 非对称：主视觉占大头，HUD 面板靠右 */
  .hero {
    grid-template-columns: 1.7fr 1fr;
    gap: 48px;
    padding: 84px 0 56px;
  }
}

.hero-title {
  font-family: var(--jet);
  font-weight: 800;
  font-size: clamp(2.4rem, 7vw, 4.4rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 14px 0 18px;
}

.hero-sub {
  margin: 0 0 18px;
}

.hero-desc {
  font-family: var(--wenkai);
  font-size: 15px;
  line-height: 1.75;
  color: var(--text-1);
  max-width: 46ch;
  margin: 0;
}

.hero-hud {
  align-self: end;
}

/* --- 分组索引 --- */

.groups {
  padding: 30px 0;
}

.group-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
}

.group-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 7px 12px;
  border: 1px solid var(--line-strong);
  clip-path: var(--chamfer-sm);
  background: rgba(252, 227, 0, 0.02);
}

.group-name {
  font-family: var(--jet);
  font-size: 13px;
  color: var(--text-0);
}

.group-count {
  font-family: var(--jet);
  font-size: 11px;
  color: var(--neon-yellow);
  opacity: 0.85;
}

/* --- 列表 --- */

.list {
  padding: 30px 0 10px;
}

.list :deep(.home-intro) {
  max-width: 720px;
  margin: 12px 0 0;
  padding: 0;
}
</style>
