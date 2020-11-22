<template>
  <div>
    <mainWrap>
      <Tags :tagsList="tags" :currentTag="selectedTag" />
      <div style="padding-top: 1rem">
        <BlogList v-if="selectedTag" :artList="artList" />
        <h4 v-else style="margin: 0">请选择一个标签</h4>
      </div>
    </mainWrap>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { getSite, getTags } from "../theme/util";
import mainWrap from "@theme/components/mainWrap.vue";

export default {
  components: {
    mainWrap,
  },
  computed: {
    ...mapState(["selectedTag"]),
    site() {
      return getSite(this.$site);
    },
    tags() {
      let site = getSite(this.$site);
      return getTags(site);
    },
    artList() {
      return this.site.filter((item) => {
        return item.frontmatter.tag.includes(this.selectedTag);
      });
    },
  },
};
</script>
