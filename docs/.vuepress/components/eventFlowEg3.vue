<template>
  <div>
    <ul ref="parent">
      <li>1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  </div>
</template>
<script>
export default {
  mounted() {
    let parent = this.$refs.parent;
    parent.addEventListener("click", event => {
      console.log(event.target.innerText);
    });
  }
};
</script>
<style lang="stylus" scoped>
ul
  margin 50px auto
  width 300px

  li
    width 100%
    height 30px
    border 1px #000 solid
</style>
