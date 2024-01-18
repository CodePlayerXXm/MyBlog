---
title: TypeScript 的类型映射
group: TypeScript
layout: doc
date: 2024-01-18T08:59:16.544Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的类型映射
---

## 简介

映射（mapping）指的是，将一种类型按照映射规则，转换成另一种类型，通常用于对象类型。

```TypeScript

type A = {
  foo: number;
  bar: number;
};

type B = {
  foo: string;
  bar: string;
};


// 通过映射，将A转换成B
type B = {
  [prop in keyof A]: string;
};
```
* prop：属性名变量，名字可以随便起。
* in：运算符，用来取出右侧的联合类型的每一个成员。
* eyof A：返回类型A的每一个属性名，组成一个联合类型。


```TypeScript

// 复制A的类型
type B = {
  [prop in keyof A]: A[prop];
};

```
可以把常用的映射写成泛型。

```TypeScript

// 可以将其他对象的所有属性值都改成 boolean 类型
type ToBoolean<Type> = {
  [Property in keyof Type]: boolean;
};

```
keyof 实质上是展开为联合类型，所以后面也可以直接用联合类型。

```TypeScript

type MyObj = {
  [P in 0|1|2]: string;
};

// 等同于
type MyObj = {
  0: string;
  1: string;
  2: string;
};

// 不使用联合类型，直接使用某种具体类型进行属性名映射，也是可以的。
type MyObj = {
  [p in 'foo']: number;
};

// 等同于
type MyObj = {
  foo: number;
};

// 甚至还可以写成p in string。
type MyObj = {
  [p in string]: boolean;
};

// 等同于
type MyObj = {
  [p: string]: boolean;
};


// 可以把某个对象的所有属性改成可选属性
type A = {
  a: string;
  b: number;
};

type B = {
  [Prop in keyof A]?: A[Prop];
};


// 将 T 的所有属性改为只读属性
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```
## 映射修饰符

映射会原样复制原始对象的可选属性和只读属性。

* +修饰符：写成+?或+readonly，为映射属性添加?修饰符或readonly修饰符。
* –修饰符：写成-?或-readonly，为映射属性移除?修饰符或readonly修饰符。
* +?或-?要写在属性名的后面
* +readonly和-readonly要写在属性名的前面。
* 原生的工具类型Required&lt;T&gt; 专门移除可选属性，就是使用-?修饰符实现的。
* –?修饰符移除了可选属性以后，该属性就不能等于undefined了，实际变成必选属性了。但是，这个修饰符不会移除null类型。
* +?修饰符可以简写成?，+readonly修饰符可以简写成readonly。

```TypeScript

type A = {
  a?: string;
  readonly b: number;
};

type B = {
  [Prop in keyof A]: A[Prop];
};

// 等同于
type B = {
  a?: string;
  readonly b: number;
};



// 添加可选属性
type Optional<Type> = {
  [Prop in keyof Type]+?: Type[Prop];
};

// 移除可选属性
type Concrete<Type> = {
  [Prop in keyof Type]-?: Type[Prop];
};



// 添加 readonly
type CreateImmutable<Type> = {
  +readonly [Prop in keyof Type]: Type[Prop];
};

// 移除 readonly
type CreateMutable<Type> = {
  -readonly [Prop in keyof Type]: Type[Prop];
};



// 同时增加
type MyObj<T> = {
  +readonly [P in keyof T]+?: T[P];
};

// 同时移除
type MyObj<T> = {
  -readonly [P in keyof T]-?: T[P];
}


type A<T> = {
  +readonly [P in keyof T]+?: T[P];
};

// 等同于
type A<T> = {
  readonly [P in keyof T]?: T[P];
};
```

## 键名重映射

### 语法

TypeScript 4.1 引入了键名重映射（key remapping），允许改变键名。

```TypeScript

type A = {
  foo: number;
  bar: number;
};

type B = {
  [p in keyof A as `${p}ID`]: number;
};

// 等同于
type B = {
  fooID: number;
  barID: number;
};


interface Person {
  name: string;
  age: number;
  location: string;
}

type Getters<T> = {
  [P in keyof T
    as `get${Capitalize<string & P>}`]: () => T[P];
};

type LazyPerson = Getters<Person>;
// 等同于
type LazyPerson = {
  getName: () => string;
  getAge: () => number;
  getLocation: () => string;
}
```
* get：为键名添加的前缀。
* Capitalize&lt;T&gt;：一个原生的工具泛型，用来将T的首字母变成大写。
* string & P：一个交叉类型，其中的P是 keyof 运算符返回的键名联合类型string|number|symbol，但是Capitalize&lt;T&gt;只能接受字符串作为类型参数，因此string & P只返回P的字符串属性名。

### 属性过滤

键名重映射还可以过滤掉某些属性。

```TypeScript

type User = {
  name: string,
  age: number
}

type Filter<T> = {
  [K in keyof T
    as T[K] extends string ? K : never]: string
}

type FilteredUser = Filter<User> // { name: string }

```
### 联合类型的映射

```TypeScript

type S = {
  kind: 'square',
  x: number,
  y: number,
};

type C = {
  kind: 'circle',
  radius: number,
};

type MyEvents<Events extends { kind: string }> = {
  [E in Events as E['kind']]: (event: E) => void;
}

type Config = MyEvents<S|C>;
// 等同于
type Config = {
  square: (event:S) => void;
  circle: (event:C) => void;
}

```
