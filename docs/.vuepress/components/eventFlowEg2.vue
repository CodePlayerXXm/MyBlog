<template>
  <div>
    <div class="parent" ref="parent" id="parent">
      <div class="child" ref="child">
        <div class="grandchild" ref="grandchild"></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  mounted() {
    let parent = this.$refs.parent;
    let child = this.$refs.child;
    let grandchild = this.$refs.grandchild;
    //冒泡阶段
    parent.addEventListener("click", () => {
      console.log("parent");
    });
    child.addEventListener("click", () => {
      console.log("child");
    });
    grandchild.addEventListener("click", () => {
      console.log("grandchild");
    });
    //捕获阶段
    grandchild.addEventListener(
      "click",
      () => {
        console.log("grandchildT");
      },
      true
    );
    child.addEventListener(
      "click",
      () => {
        console.log("childT");
      },
      true
    );
    parent.addEventListener(
      "click",
      event => {
        console.log("parentT");
      },
      true
    );
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
