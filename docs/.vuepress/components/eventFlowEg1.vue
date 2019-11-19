<template>
  <div>
    <div class="parent" @click="handleClick('parent')">
      <div class="child" @click="handleClick('child')">
        <div class="grandchild" @click="handleClick('grandchild')"></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    handleClick(sth) {
      alert(sth);
    }
  }
};
</script>
<style lang="stylus" scoped>
.parent
  margin 50px auto
  width 200px
  height 200px
  background blue

  .child
    width 100px
    height 100px
    background red

    .grandchild
      width 50px
      height 50px
      background yellow
</style>
