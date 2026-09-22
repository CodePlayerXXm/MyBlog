<script setup lang="ts">
import NavBar from "./NavBar.vue";
</script>

<template>
  <header class="Nav">
    <div class="fixed header-bar" />
    <NavBar>
      <template #nav-bar-title-before>
        <slot name="nav-bar-title-before" />
      </template>
      <template #nav-bar-title-after>
        <slot name="nav-bar-title-after" />
      </template>
      <template #nav-bar-content-before> </template>
      <template #nav-bar-content-after>
        <slot name="nav-bar-content-after" />
      </template>
    </NavBar>
  </header>
</template>

<style scoped>
.Nav {
  width: 100%;
  z-index: 1020;
  position: sticky;
  top: 0;
}

.header-bar {
  width: 100% !important;
  border-top: 2px solid transparent;
  border-image-source: linear-gradient(
    90deg,
    transparent,
    #fce300 22%,
    #ff2e88 78%,
    transparent
  );
  border-image-slice: 1;
}
</style>
