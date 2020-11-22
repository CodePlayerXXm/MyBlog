<template>
  <div class="tagsWrap">
    <span
      class="tagWrap"
      :class="colorNum(item)"
      v-for="(item, index) in tagsList"
      :key="index"
      @click="selectTag(item)"
      >{{ item }}</span
    >
  </div>
</template>

<script>
export default {
  props: {
    tagsList: {
      required: true,
      type: Array,
    },
    currentTag: {
      type: String,
    },
  },
  data() {
    return {
      colors: {
        color1: "技术",
        color2: "生活",
        color3: "Vue",
        color4: "JavaScript",
        color5: "CSS",
        color6: "React",
        color7: "HTML",
        color8: "网易云课堂笔记",
        color9: "Git",
        color10: "TypeScript",
      },
    };
  },
  computed: {
    colorNum() {
      return (val) => {
        let current = val === this.currentTag ? true : false;
        for (let keys in this.colors) {
          if (this.colors[keys] === val) {
            return current ? keys + " " + "current" : keys;
          }
        }
      };
    },
  },
  methods: {
    selectTag(val) {
      this.$store.commit("selectTag", val);
      this.$emit("jump");
    },
  },
};
</script>
<style lang="stylus" scoped>
.tagsWrap
  display inline-flex
  flex-wrap wrap
  justify-content flex-start

.tagWrap
  margin 0 .3rem .3rem 0
  display block
  border-radius .3rem
  color #fff
  padding .3rem .6rem
  font-size .75rem
  transition .3s all
  cursor pointer
  line-height 1rem

  &:hover, &.current
    box-shadow inset 0 1px 3px 1px #333

  &.color1
    background-color #ffd452

  &.color2
    background-color #FF416C

  &.color3
    background-color #41b883

  &.color4
    background-color #FF4B2B

  &.color5
    background-color #544a7d

  &.color6
    background-color #0575E6

  &.color7
    background-color #8360c3

  &.color8
    background-color #39a030

  &.color9
    background-color #000

  &.color10
    background-color #294E80
</style>
