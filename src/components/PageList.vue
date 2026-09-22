<script setup lang="ts">
import { withBase } from "vitepress";
import { Page } from "../types";
import PageListItem from "./PageListItem";

defineProps<{
  pages: Page[];
}>();

const showCover = (page: Page) => {
  return page.frontmatter.cover !== undefined;
};

const position = (page: Page) => {
  if (page.frontmatter.cover && page.frontmatter.cover.position) {
    return page.frontmatter.cover.position;
  }
  return "top";
};
</script>

<template>
  <div class="pages main-content">
    <div class="post-entry" v-for="(page, i) of pages" :key="page.url">
      <span class="entry-index">{{ String(i + 1).padStart(2, "0") }}</span>
      <PageListItem
        :position="position(page)"
        :showCover="showCover(page)"
        :page="page"
      />
      <a class="entry-link" :aria-label="page.title" :href="withBase(page.url)"></a>
    </div>
  </div>
</template>
