<template>
  <article class="articles">
    <div v-for="(item, index) in curArticles" :key="index">
      <router-link :to="item.path">
        <section class="sectionWrap">
          <h2>{{ item.frontmatter.features[0].title }}</h2>
          <p>{{ item.frontmatter.features[0].details }}</p>
          <div>
            <Tags :tagsList="item.frontmatter.tag"></Tags>
          </div>
        </section>
      </router-link>
    </div>
    <el-pagination
      style="display:flex;justify-content:center"
      :current-page.sync="currentPage"
      @current-change="pageChange"
      :page-size="5"
      layout="total,prev, pager, next, jumper"
      :total="pages"
    ></el-pagination>
  </article>
</template>

<script>
export default {
  props: {
    artList: {
      required: true,
      type: Array
    },
    pages: {
      required: true,
      type: Number
    }
  },
  data() {
    return {
      currentPage: 1
    };
  },
  computed: {
    curArticles() {
      let curArticles = this.artList.filter((item, index) => {
        if (
          index < this.currentPage * 5 &&
          index >= (this.currentPage - 1) * 5
        ) {
          return item;
        }
      });
      return curArticles;
    }
  },
  methods: {
    pageChange(val) {
      this.currentPage = val;
    }
  }
};
</script>
<style lang="stylus" scoped>
.articles
  -webkit-box-flex 1
  flex auto

  .sectionWrap
    margin 0 auto 20px
    padding 16px 20px
    width 100%
    overflow hidden
    border-radius .25rem
    box-shadow 0 1px 6px 0 rgba(0, 0, 0, .2)
    box-sizing border-box
    background-color #fff
    transition all .3s

    &:hover
      box-shadow 0 2px 16px 0 rgba(0, 0, 0, .2)
      transform scale(1.005)

  .sectionWrap >>> .tagWrap:hover
    box-shadow none
</style>
