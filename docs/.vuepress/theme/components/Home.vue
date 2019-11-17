<template>
  <div>
    <header class="hero">
      <!-- <h2 v-if="data.heroText !== null" id="main-title">{{ data.heroText || $title || "Hello" }}</h2> -->
      <h2 class="description">
        {{
          data.page.frontmatter.tagline ||
            $description ||
            "Welcome to your VuePress site"
        }}
      </h2>
    </header>
    <main class="home" aria-labelledby="main-title">
      <div class="features">
        <BlogList :artList="site"></BlogList>
        <aside class="subbar">
          <div class="imgWrap">
            <img src="../images/head.gif" alt="hero" class="personal-img" />
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
            <div>标签墙</div>
            <div style="padding-top:0.75rem">
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
      currentPage: 1
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
        page: this.$page
      };
    }
  },
  methods: {
    goTagList(val) {
      this.$router.push({ path: "/tags/" });
    }
  }
};
</script>

<style lang="stylus">
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
    font-size 1.6rem
    line-height 1.3
    color lighten($textColor, 40%)

.home
  padding 0 2rem
  max-width 1126px
  margin 0 auto
  display block

  .features
    padding 1.2rem 0
    display flex
    align-items flex-start

    .subbar
      position sticky
      top 70px
      transition all .3s
      margin-left 15px
      flex 0 0 300px
      height auto
      background-color #fff
      box-shadow 0 1px 6px 0 rgba(0, 0, 0, .2)
      border-radius .25rem
      box-sizing border-box
      padding 20px
      
      .imgWrap
        margin auto
        width 13rem
        height 13rem
        border-radius 100%
        background-color #eee 

      .personal-img
        display block
        width 100%
        border-radius 100%

      .name
        text-align center

      .num
        display flex
        margin 0 auto 1rem
        width 80%

      .num > div > p,.num > div > h4
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
  margin-top 2rem
  padding 2.5rem
  border-top 1px solid $borderColor
  text-align center
  color lighten($textColor, 25%)

@media (max-width: $MQMobile)
  .home
    .features
      flex-direction column-reverse

      .subbar
        position static
        margin 0
        margin-top .75rem
        margin-bottom .75rem
        width 100%

    .feature
      max-width 100%
      padding 0 2.5rem

@media (max-width: $MQMobileNarrow)
  .home
    padding-left 1.5rem
    padding-right 1.5rem

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
