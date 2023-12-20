---
title: TypeScript 的泛型
group: TypeScript
layout: doc
date: 2023-12-18T09:57:53.303Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的泛型
---


## 泛型的写法

泛型主要用在四个场合：函数、接口、类和别名。

### 函数泛型

* function关键字定义的泛型函数，类型参数放在尖括号中，写在函数名后面。
* 变量形式定义的函数

```TypeScript

function id<T>(arg:T):T {
  return arg;
}


// 写法一
let myId:<T>(arg:T) => T = id;

// 写法二
let myId:{ <T>(arg:T): T } = id;

```

### 接口泛型

* 类型参数定义在整个接口，类型参数定义在整个接口，接口内部的所有属性和方法都可以使用该类型参数。
* 类型参数定义在某个方法之中，其他属性和方法不能使用该类型参数

```TypeScript

interface Box<Type> {
  contents: Type;
}

let box:Box<string>;

// 类型定义在整个接口
interface Comparator<T> {
  compareTo(value:T): number;
}

class Rectangle implements Comparator<Rectangle> {

  compareTo(value:Rectangle): number {
    // ...
  }
}

// 类型定义在方法上
interface Fn {
  <Type>(arg:Type): Type;
}

function id<Type>(arg:Type): Type {
  return arg;
}

let myId:Fn = id;

```
### 类的泛型写法


