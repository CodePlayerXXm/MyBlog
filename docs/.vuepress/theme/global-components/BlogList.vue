<template>
  <article class="articles">
    <div v-for="(item, index) in curArticles" :key="index">
      <router-link :to="item.path">
        <section class="sectionWrap">
          <h2>{{ item.frontmatter.features[0].title }}</h2>
          <p>{{ item.frontmatter.features[0].details }}</p>
          <div class="lastLine">
            <Tags :tagsList="item.frontmatter.tag"></Tags>
            <span class="time">{{ item.lastUpdated }}</span>
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
import { mapState } from "vuex";

export default {
  props: {
    artList: {
      required: true,
      type: Array
    }
  },
  data() {
    return {
      currentPage: 1,
      list: this.artList
    };
  },
  watch: {
    artList(val) {
      this.list = val;
    }
  },
  computed: {
    ...mapState(["selectedTag"]),

    // 时间排序
    timeList() {
      this.list.sort((a, b) => {
        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      });
      return this.list;
    },
    // 分页
    curArticles() {
      let curArticles = this.timeList.filter((item, index) => {
        if (
          index < this.currentPage * 5 &&
          index >= (this.currentPage - 1) * 5
        ) {
          return item;
        }
      });
      return curArticles;
    },
    pages() {
      return this.artList.length;
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

    .lastLine
      display flex
      justify-content space-between

  .sectionWrap >>> .tagWrap:hover
    box-shadow none

@media (max-width: $MQMobile)
  .articles
    width 100%
</style>
