<template>
  <router-link
    class="nav-link"
    :to="link"
    @focusout.native="focusoutAction"
    @click.native="isTag(item.text)"
    v-if="!isExternal(link)"
    :exact="exact"
  >
    <span class="iconfont" :class="item.class"></span>
    {{ item.text }}
  </router-link>
  <a
    v-else
    :href="link"
    @focusout="focusoutAction"
    class="nav-link external"
    :target="isMailto(link) || isTel(link) ? null : '_blank'"
    :rel="isMailto(link) || isTel(link) ? null : 'noopener noreferrer'"
  >
    {{ item.text }}
    <OutboundLink />
  </a>
</template>

<script>
import { isExternal, isMailto, isTel, ensureExt } from "../util";

export default {
  props: {
    item: {
      required: true
    }
  },

  computed: {
    link() {
      return ensureExt(this.item.link);
    },

    exact() {
      if (this.$site.locales) {
        return Object.keys(this.$site.locales).some(
          rootLink => rootLink === this.link
        );
      }
      return this.link === "/";
    }
  },

  methods: {
    isExternal,
    isMailto,
    isTel,
    focusoutAction() {
      this.$emit("focusout");
    },
    isTag(val) {
      val === "标签" && this.$store.commit("selectTag", null);
    }
  }
};
</script>
<style lang="stylus" scoped>
@font-face
  font-family 'iconfont'
  src url('../fonts/iconfont.eot')
  src url('../fonts/iconfont.eot?#iefix') format('embedded-opentype'), url('../fonts/iconfont.woff2') format('woff2'), url('../fonts/iconfont.woff') format('woff'), url('../fonts/iconfont.ttf') format('truetype'), url('../fonts/iconfont.svg#iconfont') format('svg')

.iconfont
  font-family 'iconfont' !important
  font-style normal
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale

.icon-zhuye:before
  content '\e6ce'

.icon-biaoqian:before
  content '\e678'
</style>
