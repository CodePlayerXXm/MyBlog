---
title: TypeScript 的 interface 接口
group: TypeScript
layout: doc
date: 2023-12-14T07:03:10.079Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的 interface 接口。
---

## 简介

大部分同对象

* 方括号运算符可以取出 interface 某个属性的类型。
* interface 可以表示对象的各种语法，它的成员有5种形式。
  * 对象属性
  * 对象的属性索引 number默认自动转string
  * 对象方法
  * 函数 重载问题
  * 构造函数

## 继承
### 继承interface

* 可多重继承
* 如果子接口与父接口存在同名属性，那么子接口的属性会覆盖父接口的属性。注意，子接口与父接口的同名属性必须是类型兼容的，不能有冲突，否则会报错
* 多重继承时，如果多个父接口存在同名属性，那么这些同名属性不能有类型冲突，否则会报错。

```TypeScript

// 多重继承
interface Style {
  color: string;
}

interface Shape {
  name: string;
}

interface Circle extends Style, Shape {
  radius: number;
}

// 父子属性冲突
interface Foo {
  id: string;
}

interface Bar extends Foo {
  id: number; // 报错
}

// 父父属性冲突
interface Foo {
  id: string;
}

interface Bar {
  id: number;
}

// 报错
interface Baz extends Foo, Bar {
  type: string;
}
```
### interface 继承 type

如果type命令定义的类型不是对象，interface 就无法继承。

### interface 继承 class

* interface 还可以继承 class，即继承该类的所有成员。
* 某些类拥有私有成员和保护成员，interface 可以继承这样的类，但是意义不大。

```TypeScript

class A {
  x:string = '';

  y():boolean {
    return true;
  }
}

interface B extends A {
  z: number
}

const b:B = {
  x: '',
  y: function(){ return true },
  z: 123
}


class A {
  private x: string = '';
  protected y: string = '';
}

interface B extends A {
  z: number
}

// 报错
const b:B = { /* ... */ }

// 报错
class C implements B {
  // ...
}
```

## 接口合并

* 同名接口会合并为一个接口
* windows对象和document对象添加自定义属性，但是 TypeScript 会报错，因为原始定义没有这些属性。解决方法就是把自定义属性写成 interface，合并进原始定义
* 同名接口合并时，同一个属性如果有多个类型声明，彼此不能有类型冲突。
* 同名接口合并时，如果同名方法有不同的类型声明，那么会发生函数重载。而且，后面的定义比前面的定义具有更高的优先级。
* 同名方法之中，如果有一个参数是字面量类型，字面量类型有更高的优先级。
* 如果两个 interface 组成的联合类型存在同名属性，那么该属性的类型也是联合类型。

```TypeScript

// document 合并属性
interface Document {
  foo: string;
}

document.foo = 'hello';

// 冲突报错
interface A {
  a: number;
}

interface A {
  a: string; // 报错
}

// 函数重载
interface Cloner {
  clone(animal: Animal): Animal;
}

interface Cloner {
  clone(animal: Sheep): Sheep;
}

interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
}

// 等同于
interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
  clone(animal: Sheep): Sheep;
  clone(animal: Animal): Animal;
}

// 字面量优先
interface A {
  f(x:'foo'): boolean;
}

interface A {
  f(x:any): void;
}

// 等同于
interface A {
  f(x:'foo'): boolean;
  f(x:any): void;
}

// 重载优先级 相对复杂示例
interface Document {
  createElement(tagName: any): Element;
}
interface Document {
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
}
interface Document {
  createElement(tagName: string): HTMLElement;
  createElement(tagName: "canvas"): HTMLCanvasElement;
}

// 等同于
interface Document {
  createElement(tagName: "canvas"): HTMLCanvasElement;
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
  createElement(tagName: string): HTMLElement;
  createElement(tagName: any): Element;
}

// 联合类型
interface Circle {
  area: bigint;
}

interface Rectangle {
  area: number;
}

declare const s: Circle | Rectangle;

s.area;   // bigint | number
```
## interface 与 type 的异同

* type能够表示非对象类型，而interface只能表示对象类型（包括数组、函数等）。
* interface可以继承其他类型，type不支持继承。
* 继承的主要作用是添加属性，type定义的对象类型如果想要添加属性，只能使用&运算符，重新定义一个类型。
* 继承时，type 和 interface 是可以换用的。interface 可以继承 type。type 也可以继承 interface。
* 同名interface会自动合并，同名type则会报错。也就是说，TypeScript 不允许使用type多次定义同一个类型。
* interface不能包含属性映射（mapping），type可以。
* this关键字只能用于interface。
* type 可以扩展原始数据类型，interface 不行。
* interface无法表达某些复杂类型（比如交叉类型和联合类型），但是type可以。

```TypeScript

// type继承
type Animal = {
  name: string
}

type Bear = Animal & {
  honey: boolean
}

// interface继承
interface Animal {
  name: string
}

interface Bear extends Animal {
  honey: boolean
}

// interface不支持映射
interface Point {
  x: number;
  y: number;
}

// 正确
type PointCopy1 = {
  [Key in keyof Point]: Point[Key];
};

// 报错
interface PointCopy2 {
  [Key in keyof Point]: Point[Key];
};

// this关键字
// 正确
interface Foo {
  add(num:number): this;
};

// 报错
type Foo = {
  add(num:number): this;
};

class Calculator implements Foo {
  result = 0;
  add(num:number) {
    this.result += num;
    return this;
  }
}

// 继承原始类型
// 正确
type MyStr = string & {
  type: 'new'
};

// 报错
interface MyStr extends string {
  type: 'new'
}

// 类型运算
type A = { /* ... */ };
type B = { /* ... */ };

type AorB = A | B;
type AorBwithName = AorB & {
  name: string
};
```
