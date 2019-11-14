<template>
  <div>
    <mainWrap>
      <Tags :tagsList="tags" :currentTag="selectedTag" />
      <div style="padding-top:1rem">
        <BlogList v-if="selectedTag" :artList="artList" />
        <h4 v-else style="margin:0">请选择一个标签</h4>
      </div>
    </mainWrap>
  </div>
</template>
<script>
import { mapState } from "vuex";
import mainWrap from "@theme/components/mainWrap.vue";

export default {
  components: {
    mainWrap
  },
  data() {
    return {
      tags: this.tag,
      articles: [...this.site]
    };
  },
  // beforeMount() {
  //   this.tags = JSON.parse(window.sessionStorage.getItem("tag"));
  //   this.articles = JSON.parse(window.sessionStorage.getItem("site"));
  // },
  computed: {
    ...mapState(["tag", "site"]),
    artList() {
      return this.articles.filter(item => {
        return item.frontmatter.tag.includes(this.selectedTag);
      });
    }
  }
};
</script>
