<template>
  <footer class="page-edit">
    <div class="edit-link" v-if="editLink">
      <a :href="editLink" target="_blank" rel="noopener noreferrer">
        {{
        editLinkText
        }}
      </a>
      <OutboundLink />
    </div>

    <!-- id 将作为查询条件 -->
    <div class="edit-link">
      <span :id="routePath" class="leancloud_visitors" data-flag-title="Your Article Title">
        <em class="post-meta-item-text">阅读量：</em>
        <i class="leancloud-visitors-count"></i>
      </span>
    </div>
    <div class="last-updated" v-if="lastUpdated">
      <span class="prefix">{{ lastUpdatedText }}:</span>
      <span class="time">{{ lastUpdated }}</span>
    </div>
  </footer>
</template>
<script>
import isNil from "lodash/isNil";
import { endingSlashRE, outboundRE } from "../util";

export default {
  name: "PageEdit",
  computed: {
    routePath() {
      return this.$route.path;
    },
    lastUpdated() {
      return this.$page._lastUpdated;
    },

    lastUpdatedText() {
      if (typeof this.$themeLocaleConfig.lastUpdated === "string") {
        return this.$themeLocaleConfig.lastUpdated;
      }
      if (typeof this.$site.themeConfig.lastUpdated === "string") {
        return this.$site.themeConfig.lastUpdated;
      }
      return "Last Updated";
    },

    editLink() {
      const showEditLink = isNil(this.$page.frontmatter.editLink)
        ? this.$site.themeConfig.editLinks
        : this.$page.frontmatter.editLink;

      const {
        repo,
        docsDir = "",
        docsBranch = "master",
        docsRepo = repo
      } = this.$site.themeConfig;

      if (showEditLink && docsRepo && this.$page.relativePath) {
        return this.createEditLink(
          repo,
          docsRepo,
          docsDir,
          docsBranch,
          this.$page.relativePath
        );
      }
      return null;
    },

    editLinkText() {
      return (
        this.$themeLocaleConfig.editLinkText ||
        this.$site.themeConfig.editLinkText ||
        `Edit this page`
      );
    }
  },

  methods: {
    createEditLink(repo, docsRepo, docsDir, docsBranch, path) {
      const bitbucket = /bitbucket.org/;
      if (bitbucket.test(repo)) {
        const base = outboundRE.test(docsRepo) ? docsRepo : repo;
        return (
          base.replace(endingSlashRE, "") +
          `/src` +
          `/${docsBranch}/` +
          (docsDir ? docsDir.replace(endingSlashRE, "") + "/" : "") +
          path +
          `?mode=edit&spa=0&at=${docsBranch}&fileviewer=file-view-default`
        );
      }

      const base = outboundRE.test(docsRepo)
        ? docsRepo
        : `https://github.com/${docsRepo}`;
      return (
        base.replace(endingSlashRE, "") +
        `/edit` +
        `/${docsBranch}/` +
        (docsDir ? docsDir.replace(endingSlashRE, "") + "/" : "") +
        path
      );
    }
  }
};
</script>
<style lang="stylus">
@import '../styles/wrapper.styl'

.page-edit
  @extends $wrapper
  background none
  padding-top 1rem
  padding-bottom 1rem
  overflow auto

  .edit-link
    display inline-block

    a
      color lighten($textColor, 25%)
      margin-right .25rem

  .last-updated
    float right
    font-size .9em

    .prefix
      font-weight 500
      color lighten($textColor, 25%)

    .time
      font-weight 400
      color #aaa

@media (max-width: $MQMobile)
  .page-edit
    .edit-link
      margin-bottom .5rem

    .last-updated
      font-size .8em
      float none
      text-align left
</style>
