---
title: 函数式编程
group: JavaScript
layout: post
date: 2021-1-02T13:54:36+08:00
tags: [JavaScript]
sidebar: true
summary: 记一下函数式编程的特性
---

# 函数式编程的一些特性

## 什么是函数式编程？

<br/>
<img style="display:table;margin:auto" src="/images/functionalProgramming/functionalProgramming1.png" />

## 函数式编程的特性

### 纯函数

<br/>
<img style="display:table;margin:auto" src="/images/functionalProgramming/functionalProgramming2.png" />

<br/>
<img style="display:table;margin:auto" src="/images/functionalProgramming/functionalProgramming3.png" />

<br/>
<img style="display:table;margin:auto" src="/images/functionalProgramming/functionalProgramming4.png" />

### 无函数副作用

<br/>
<img style="display:table;margin:auto" src="/images/functionalProgramming/functionalProgramming5.png" />

<br/>
<img style="display:table;margin:auto" src="/images/functionalProgramming/functionalProgramming6.png" />

### 函数柯里化

<br/>
<img style="display:table;margin:auto" src="/images/functionalProgramming/functionalProgramming7.png" />

### 函数组合——compose、pipe 函数

<br/>
<img style="display:table;margin:auto" src="/images/functionalProgramming/functionalProgramming8.png" />

<br/>
<img style="display:table;margin:auto" src="/images/functionalProgramming/functionalProgramming9.png" />

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
<img style="display:table;margin:auto" src="/images/functionalProgramming/functionalProgramming10.png" />
