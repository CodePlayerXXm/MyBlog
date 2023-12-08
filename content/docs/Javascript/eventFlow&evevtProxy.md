---
title: 事件流与事件委托
group: JavaScript
layout: doc
date: 2021-1-02T13:54:36+08:00
tags: [JavaScript,Vue]
sidebar: true
summary: 所谓事件流是描述指页面上DOM事件执行的先后顺序。而事件委托是利用事件流的冒泡，在父元素上监听子元素事件触发的一种优化处理方式。
---
# 事件流与事件委托

## 什么是事件流

&emsp;&emsp;所谓事件流是描述指页面上 DOM 事件执行的先后顺序。因为页面是由多个元素嵌套组成，所以在一个子元素上触发了一个事件，包裹了他的父元素上也会触发这个事件。用一个简单的例子就可以印证：

```vue
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
    },
  },
};
</script>
<style lang="stylus" scoped>
.parent
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
```

<eventFlowEg1/>

&emsp;&emsp;点击最内层黄色的孙子元素，可以发现浏览器依次弹出提示"grandchild"、"child"、"parent"。事件被触发了三次。这里事件的触发顺序是在事件流的冒泡阶段，何为冒泡阶段？就需要引出接下来要讲的内容——事件流的三个阶段。

### 事件流的三个阶段

&emsp;&emsp;DOM 事件流的顺序分为三个阶段——捕获阶段 → 目标阶段 → 冒泡阶段。

&emsp;&emsp;1.捕获阶段

&emsp;&emsp;捕获阶段是由事件流的顺序是由外而内，最外层元素 document 先触发，目标元素最后触发。捕获流程，部分老版本的 IE 浏览器不支持，需要 ie9+才可以支持。

&emsp;&emsp;2.目标阶段

&emsp;&emsp;在这个阶段，事件的触发顺序只取决于跟写代码的先后顺序。

&emsp;&emsp;3.冒泡阶段

&emsp;&emsp;冒泡阶段是由事件流的顺序是由内而外，目标元素先触发，最外 document 元素最后触发。

&emsp;&emsp;通过 addEventListener 这个方法来控制在捕获阶段还是冒泡阶段来触发事件，该方法最后一个参数需要传一个布尔值，默认是 false。是在冒泡阶段触发事件，如果传入 true 则是冒泡阶段触发事件。下面就用这个 api 来深入了解事件流。

```vue
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
      () => {
        console.log("parentT");
      },
      true
    );
  },
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
```

<eventFlowEg2/>

&emsp;&emsp;点击最内部黄色 div 查看 console 的打印结果依次为 parentT、childT、grandchild、grandchildT、child、parent。为排除代码书写先后顺序的影响，我故意按照事件流的相反的顺序书写。观察 console 的打印结果，可以发现事件是按照事件流的顺序触发的，但是值得注意的是 grandchild 在 grandchildT 之前触发，这是因为此时在目标阶段，目标阶段的触发顺序是按照代码的书写顺序来的。

## 什么是事件委托

&emsp;&emsp;事件委托就是利用事件流的冒泡原理，在父元素或者祖先元素上绑定事件的监听，触发其子元素的事件的效果。依然是一个例子：

```vue
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
  },
};
</script>
<style lang="stylus" scoped>
ul > li
  width 100px
  height 30px
  border 1px #000 solid
</style>
```

<eventFlowEg3/>

&emsp;&emsp;从打印结果可以看出，事件监听绑定在父元素上，通过事件委托点击其子元素，可以打印出该子元素内的内容。

### 事件委托的优点

&emsp;&emsp;1.通过事件委托可以提高性能。假如父元素下有多个子元素，不通过事件委托，要在每一个子元素上加一个点击事件，但是事件委托，只需要在父元素上添加一次事件。

&emsp;&emsp;2.事件委托还可以对动态添加的未来元素同样有效。
