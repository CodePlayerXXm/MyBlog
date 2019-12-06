---
sidebar: auto
tag:
  - 技术
  - Vue
features:
  - title: Vue2与Vue3中数据响应的实现
    details: defineProperty与proxy在Vue2、3中的使用
---

## Vue2 中 defineProperty 实现数据响应

### Object.defineProperty

defineProperty 这个 API 并不是作为做数据响应而生的，他作用是描述一个对象的某个属性的。他可以设置的属性如下：

```JavaScript

Object.defineProperty(obj,key,{
  enumerable: false, //是否可枚举
  configurable: false, //是否可Delete这个属性
  writable: false, //是否可写
  value: 'val' ,//这个属性的值
  get(){},//读取这个属性时，触发的钩子函数
  set(){}//改写这个属性的值时，触发的钩子函数
})

```
