<template>
  <div>
    <mainWrap>
      <Tags :tagsList="tags" :currentTag="selectedTag" />
      <div style="padding-top:1rem">
        <BlogList
          v-if="selectedTag"
          :artList="artList"
          :pages="artList.length"
        />
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
  computed: {
    ...mapState(["selectedTag"]),
    tags() {
      let tags = window.sessionStorage.getItem("tag");
      return JSON.parse(tags);
    },
    artList() {
      let articles = JSON.parse(window.sessionStorage.getItem("site"));
      let newArticles = articles.filter(item => {
        return item.frontmatter.tag.includes(this.selectedTag);
      });
      return newArticles;
    }
  }
};
</script>
