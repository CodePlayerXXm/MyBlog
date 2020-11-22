<template>
  <div>
    <header class="hero">
      <!-- <h2 v-if="data.heroText !== null" id="main-title">{{ data.heroText || $title || "Hello" }}</h2> -->
      <!-- <h2 class="description">
        {{
        data.page.frontmatter.tagline ||
        $description ||
        "Welcome to your VuePress site"
        }}
      </h2>-->
    </header>
    <main class="home" aria-labelledby="main-title">
      <div class="features">
        <div class="articles">
          <p class="showHide fontBig">文章列表</p>
          <BlogList :artList="site"></BlogList>
        </div>
        <aside class="subbar">
          <div class="imgWrap">
            <img src="../images/head.jpg" alt="hero" class="personal-img" />
          </div>
          <h3 class="name">Constable</h3>
          <div class="num">
            <div>
              <h4>文章</h4>
              <p>{{ pages }}</p>
            </div>
            <div>
              <h4>标签</h4>
              <p>{{ tags }}</p>
            </div>
          </div>
          <div>
            <div class="fontBig">标签</div>
            <div style="padding-top: 0.75rem">
              <Tags :tagsList="tag" @jump="goTagList"></Tags>
            </div>
          </div>
        </aside>
      </div>
    </main>
    <div class="footer">{{ data.page.frontmatter.footer }}</div>
  </div>
</template>

<script>
import NavLink from "@theme/components/NavLink.vue";
import { getSite, getTags } from "../util";

export default {
  components: { NavLink },
  data() {
    return {
      currentPage: 1,
    };
  },
  computed: {
    site() {
      return getSite(this.$site);
    },
    tag() {
      let site = getSite(this.$site);
      return getTags(site);
    },
    pages() {
      return this.site.length;
    },
    tags() {
      return this.tag.length;
    },
    data() {
      return {
        page: this.$page,
      };
    },
  },
  methods: {
    goTagList(val) {
      this.$router.push({ path: "/tags/" });
    },
  },
};
</script>

<style lang="stylus">
@font-face
  font-family 'logoFont'
  src url('../fonts/billcorporate.ttf')

.hero
  padding-top $navbarHeight
  width 100%
  text-align center

  h2
    border-bottom none

  h1
    font-size 3rem

  h1, .description
    margin auto

  .description
    max-width 35rem
    height 20rem
    font-size 1.6rem
    line-height 20rem
    color lighten($textColor, 40%)

.home
  padding 0 2rem
  max-width 1126px
  margin 0 auto
  display block

  .features
    display flex
    position relative
    align-items flex-start

    .fontBig
      font-size 1.2rem

    .articles
      margin-right 20px
      padding-top 1rem
      -webkit-box-flex 1
      flex auto

      .showHide
        display none

    .subbar
      margin-top 1rem
      width 300px
      transition all .3s
      border-radius .25rem
      box-shadow 0 1px 6px 0 rgba(0, 0, 0, .2)
      background-image linear-gradient(#ddd, #fff)
      box-sizing border-box
      padding 2rem 1rem 1rem 1rem

      .imgWrap
        margin auto
        width 13rem
        height 13rem
        border-radius 100%
        box-shadow 3px 0 8px -4px #000

      .personal-img
        display block
        width 100%
        border-radius 100%

      .name
        text-align center
        font-family 'logoFont'

      .num
        display flex
        margin 0 auto 2rem
        width 80%

      .num > div > p, .num > div > h4
        margin 0

      .num > div
        text-align center
        -webkit-box-flex 1
        flex auto

      .num > div:first-child
        border-right 1px solid #ccc

  .feature
    flex-grow 1
    flex-basis 30%
    max-width 30%

    h2
      font-size 1.4rem
      font-weight 500
      border-bottom none
      padding-bottom 0
      color lighten($textColor, 10%)

    p
      color lighten($textColor, 25%)

.footer
  width 100%
  padding 2.5rem 0
  text-align center
  color lighten($textColor, 25%)

@media (max-width $MQMobile)
  .home
    padding 0

    .features
      flex-direction column-reverse

      .articles
        padding 0 1rem
        margin-right 0

        .showHide
          display block

      .subbar
        margin 0
        width 100%
        min-height 0

        .imgWrap
          width 18rem
          height 18rem

    .feature
      max-width 100%
      padding 0 2.5rem

  .footer
    position static

@media (max-width $MQMobileNarrow)
  .home
    padding 0

    .hero
      img
        max-height 210px
        margin 2rem auto 1.2rem

      h1
        font-size 2rem

      h1, .description, .action
        margin 1.2rem auto

      .description
        font-size 1.2rem

      .action-button
        font-size 1rem
        padding .6rem 1.2rem

    .feature
      h2
        font-size 1.25rem
</style>
