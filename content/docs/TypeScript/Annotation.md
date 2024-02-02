---
title: TypeScript 的注释指令
group: TypeScript
layout: doc
date: 2024-02-02T09:49:23.403Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的注释指令
---

## // @ts-nocheck

不对这个脚本进行类型检查

## // @ts-check

强制检查这个脚本，不论是否启用了checkJs编译选项。

## // @ts-ignore

不对下一行代码进行类型检查

## // @ts-expect-error

// @ts-expect-error主要用在测试用例，当下一行有类型错误时，它会压制 TypeScript 的报错信息（即不显示报错信息），把错误留给代码自己处理。

```TypeScript

function doStuff(abc: string, xyz: string) {
  assert(typeof abc === "string");
  assert(typeof xyz === "string");
  // do some stuff
}

expect(() => {
  // @ts-expect-error
  doStuff(123, 456);
}).toThrow();

```

如果下一行没有类型错误，// @ts-expect-error则会显示一行提示。

```TypeScript

// @ts-expect-error
console.log(1 + 1);
// 输出 Unused '@ts-expect-error' directive.

```
## JSDoc

* JSDoc 注释必须以/**开始，其中星号（*）的数量必须为两个。若使用其他形式的多行注释，则 JSDoc 会忽略该条注释。
* JSDoc 注释必须与它描述的代码处于相邻的位置，并且注释在上，代码在下。

```TypeScript

/**
 * @param {string} somebody
 */
function sayHello(somebody) {
  console.log('Hello ' + somebody);
}

```
### @typedef

@typedef命令创建自定义类型，等同于 TypeScript 里面的类型别名。

```TypeScript

/**
 * @typedef {(number | string)} NumberLike
 */


type NumberLike = string | number;

```

### @type


```TypeScript

/**
 * @type {string}
 */
let a;

// 在@type命令中可以使用由@typedef命令创建的类型。
/**
 * @typedef {(number | string)} NumberLike
 */

/**
 * @type {NumberLike}
 */
let a = 0;


// 在@type命令中允许使用 TypeScript 类型及其语法。
/**@type {true | false} */
let a;

/** @type {number[]} */
let b;

/** @type {Array<number>} */
let c;

/** @type {{ readonly x: number, y?: string }} */
let d;

/** @type {(s: string, b: boolean) => number} */
let e;

```

### @param

```TypeScript

/**
 * @param {string}  x
 */
function foo(x) {}


// 可选属性 []
/**
 * @param {string}  [x]
 */
function foo(x) {}


// 方括号里面，还可以指定参数默认值。
/**
 * @param {string} [x="bar"]
 */
function foo(x) {}
```

### @return，@returns


```TypeScript

/**
 * @return {boolean}
 */
function foo() {
  return true;
}

/**
 * @returns {number}
 */
function bar() {
  return 0;
}

```
### @extends 和类型修饰符

定义继承的基类

```TypeScript

/**
 * @extends {Base}
 */
class Derived extends Base {
}

```

@public、@protected、@private分别指定类的公开成员、保护成员和私有成员。

@readonly指定只读成员。

```TypeScript

class Base {
  /**
   * @public
   * @readonly
   */
  x = 0;

  /**
   *  @protected
   */
  y = 0;
}

```
