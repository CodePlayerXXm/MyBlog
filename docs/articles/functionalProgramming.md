---
sidebar: auto
tag:
  - 技术
  - JavaScript
  - 网易云课堂笔记
features:
  - title: 函数式编程
    details: 记一下函数式编程的特性
---

# 函数式编程的一些特性

## 什么是函数式编程？

<br/>
<img style="display:table;margin:auto" src="../.vuepress/images/functionalProgramming/functionalProgramming1.png" />

## 函数式编程的特性

### 纯函数

<br/>
<img style="display:table;margin:auto" src="../.vuepress/images/functionalProgramming/functionalProgramming2.png" />

<br/>
<img style="display:table;margin:auto" src="../.vuepress/images/functionalProgramming/functionalProgramming3.png" />

<br/>
<img style="display:table;margin:auto" src="../.vuepress/images/functionalProgramming/functionalProgramming4.png" />

### 无函数副作用

<br/>
<img style="display:table;margin:auto" src="../.vuepress/images/functionalProgramming/functionalProgramming5.png" />

<br/>
<img style="display:table;margin:auto" src="../.vuepress/images/functionalProgramming/functionalProgramming6.png" />

### 函数柯里化

<br/>
<img style="display:table;margin:auto" src="../.vuepress/images/functionalProgramming/functionalProgramming7.png" />

### 函数组合——compose、pipe 函数

<br/>
<img style="display:table;margin:auto" src="../.vuepress/images/functionalProgramming/functionalProgramming8.png" />

<br/>
<img style="display:table;margin:auto" src="../.vuepress/images/functionalProgramming/functionalProgramming9.png" />

```JavaScript
    const add = a => a + 10
    const multi = a => a * 10

    const compose = function () {
      const arg = [].slice.call(arguments)
      return function (params) {
        return arg.reduceRight((acc, cur) => cur(acc)
          , params)
      }
    }
    const pipe = function () {
      const arg = [].slice.call(arguments)
      return function (params) {
        return arg.reduce((acc, cur) => cur(acc)
          , params)
      }
    }

    const composeRes = compose(multi, add)
    const pipeRes = pipe(multi, add)

    console.log(composeRes(2)); //120 compose自右向左
    console.log(pipeRes(2)); //30 pipe自左向右
```

## 总结

<br/>
<img style="display:table;margin:auto" src="../.vuepress/images/functionalProgramming/functionalProgramming10.png" />
