---
title: 防抖与节流
group: JavaScript
layout: doc
date: 2021-1-02T13:54:36+08:00
tags: [JavaScript,Vue]
sidebar: true
summary: 防抖与节流的实现，在Vue中的实现。
---

# 防抖

## 定义与作用

<br/>
<img style="display:table;margin:auto" src="/images/debounce&throttle/debounce&throttle1.png" />

<br/>
<img style="display:table;margin:auto" src="/images/debounce&throttle/debounce&throttle2.png" />

<br/>
<img style="display:table;margin:auto" src="/images/debounce&throttle/debounce&throttle3.png" />

## 代码实现

```javascript
let debounce = (func, delay, immediate) => {
  immediate = immediate === void 0 ? true : immediate;
  let lastTime = 0;
  let timer = null;
  return (...arg) => {
    let now = Date.now();
    if (now - lastTime >= delay && immediate) {
      func.apply(this, arg);
    }
    if (!immediate) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        func.apply(this, arg);
      }, delay);
    }
    lastTime = now;
  };
};
```

func 为要执行的函数，delay 为一定时间，immediate 为布尔值，true 表示立即执行，false 表示过一定间隔后在执行。

## Vue 中的使用

模板：

```HTML
<el-input placeholder="请输入内容" v-model="text" @input.native="search" ></el-input>
<el-button>搜索</el-button>
```

Js 部分

```javascript
//引入防抖函数
import { debounce } from "../../utils/judge.js";
export default {
  name: "supplyDemandPlatform",
  //created周期声明一个函数，把防抖函数赋值给它
  created() {
    this.search = debounce(this.log, 500, false);
  },
  data() {
    return {
      text: "",
    };
  },
  methods: {
    log(txt) {
      txt = this.text;
      console.log(txt);
    },
  },
};
```

最终效果：

<br/>
<img style="display:table;margin:auto" src="/images/debounce&throttle/debounce&throttle6.png" />

# 节流

## 定义与作用

<br/>
<img style="display:table;margin:auto" src="/images/debounce&throttle/debounce&throttle4.png" />

<br/>
<img style="display:table;margin:auto" src="/images/debounce&throttle/debounce&throttle5.png" />

## 代码实现

```javascript
let throttle = (func, delay, immediate) => {
  immediate = immediate === void 0 ? true : immediate;
  let lastTime = 0;
  let timer = null;
  let remain = delay;
  let flag = true;
  return (...arg) => {
    if (immediate) {
      let now = Date.now();
      lastTime = lastTime === void 0 ? now : lastTime;
      remain -= now - lastTime;
      if (remain <= 0) {
        func.apply(this, arg);
        remain = delay;
      }
      lastTime = now;
      return;
    }
    if (!flag) return;
    flag = false;
    setTimeout(() => {
      func.apply(this, arg);
      flag = true;
    }, delay);
  };
};
```

传参及用法同上
