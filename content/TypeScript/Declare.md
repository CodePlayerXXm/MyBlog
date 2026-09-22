---
date: 2024-01-11T07:01:31.001Z
tags: [TypeScript]
---

# TypeScript declear

## 简介

declare 关键字用来告诉编译器，某个类型是存在的，可以在当前文件中使用。<br/>

declare 关键字可以描述以下类型。

* 变量（const、let、var 命令声明）
* type 或者 interface 命令声明的类型
* class
* enum
* 函数（function）
* 模块（module）
* 命名空间（namespace）

declare 关键字的重要特点是，它只是通知编译器某个类型是存在的，不用给出具体实现。<br />
declare 只能用来描述已经存在的变量和数据结构，不能用来声明新的变量和数据结构<br/>
declare 语句都不会出现在编译后的文件里面

## declare variable

* declare 关键字没有给出变量的具体类型，那么变量类型就是any
* declare 关键字只用来给出类型描述，是纯的类型代码，不允许设置变量的初始值，即不能涉及值

```Typescript

x = 123; // 报错
declare let x:number;
x = 1;


// any
declare let x;
x = 1;


// 报错
declare let x:number = 1;
```

## declare function

* ~~单独的函数类型声明语句，只能用于declare命令后面~~ （貌似可以了？）
* declare 关键字后面也不能带有函数的具体实现。

```TypeScript

declare function sayHello(
  name:string
):void;

sayHello('张三');


// 报错
declare function sayHello(name:string) {
  return '你好，' + name;
}

```


## declare class


```Typescript

declare class C {
  // 静态成员
  public static s0():string;
  private static s1:string;

  // 属性
  public a:number;
  private b:number;

  // 构造函数
  constructor(arg:number);

  // 方法
  m(x:number, y:number):number;

  // 存取器
  get c():number;
  set c(value:number);

  // 索引签名
  [index:string]:any;
}

```

同样的，declare 后面不能给出 Class 的具体实现或初始值。

## declare module，declare namespace

* 把变量、函数、类组织在一起，可以将 declare 与 module 或 namespace 一起使用。
* declare module 和 declare namespace 里面，加不加 export 关键字都可以。
* 可以为外部模块添加属性和方法时，给出新增部分的类型描述。
* 可以在一个模块中，对另一个模块的接口进行类型扩展。
  * declare module NAME语法里面的模块名NAME，跟 import 和 export 的模块名规则是一样的，且必须跟当前文件加载该模块的语句写法（上例import { A } from './a'）保持一致。
  * 不能创建新的顶层类型。也就是说，只能对a.ts模块中已经存在的类型进行扩展，不允许增加新的顶层类型，比如新定义一个接口B。
  * 不能对默认的default接口进行扩展，只能对 export 命令输出的命名接口进行扩充。这是因为在进行类型扩展时，需要依赖输出的接口名。
* 某些第三方模块，原始作者没有提供接口类型，这时可以在自己的脚本顶部加上下面一行命令。但是，从该模块输入的所有接口都将为any类型。
* declare module 描述的模块名可以使用通配符。

```TypeScript

declare namespace AnimalLib {
  class Animal {
    constructor(name:string);
    eat():void;
    sleep():void;
  }

  type Animals = 'Fish' | 'Dog';
}

// 或者
declare module AnimalLib {
  class Animal {
    constructor(name:string);
    eat(): void;
    sleep(): void;
  }

  type Animals = 'Fish' | 'Dog';
}


declare namespace Foo {
  export var a: boolean;
}

declare module 'io' {
  export function readFile(filename:string):string;
}


import { Foo as Bar } from 'moduleA';

declare module 'moduleA' {
  interface Foo {
    custom: {
      prop1: string;
    }
  }
}


// a.ts
export interface A {
  x: number;
}

// b.ts
import { A } from './a';

declare module './a' {
  interface A {
    y: number;
  }
}

const a:A = { x: 0, y: 0 };


declare module "模块名";

// 例子
declare module "hot-new-module";


declare module 'my-plugin-*' {
  interface PluginOptions {
    enabled: boolean;
    priority: number;
  }

  function initialize(options: PluginOptions): void;
  export = initialize;
}
```

## declare global

*  JavaScript 引擎的原生对象添加属性和方法，可以使用declare global {}语法。
* 第一行的空导出语句export {}，作用是强制编译器将这个脚本当作模块处理。这是因为declare global必须用在模块里面。
* declare global 只能扩充现有对象的类型描述，不能增加新的顶层类型

```TypeScript

export {};

declare global {
  interface String {
    toSmallString(): string;
  }
}

String.prototype.toSmallString = ():string => {
  // 具体实现
  return '';
};



export {};

declare global {
  interface Window {
    myAppConfig:object;
  }
}

const config = window.myAppConfig;
```
## declare enum

```Typescript

declare enum E1 {
  A,
  B,
}

declare enum E2 {
  A = 0,
  B = 1,
}

declare const enum E3 {
  A,
  B,
}

declare const enum E4 {
  A = 0,
  B = 1,
}

```
## declare module 用于类型声明文件

* 可以为每个模块脚本，定义一个.d.ts文件，把该脚本用到的类型定义都放在这个文件里面
* 但更方便的做法是为整个项目，定义一个大的.d.ts文件，在这个文件里面使用declare module定义每个模块脚本的类型。

```TypeScript

// node.d.ts

declare module "url" {
  export interface Url {
    protocol?: string;
    hostname?: string;
    pathname?: string;
  }

  export function parse(
    urlStr: string,
    parseQueryString?,
    slashesDenoteHost?
  ): Url;
}

declare module "path" {
  export function normalize(p: string): string;
  export function join(...paths: any[]): string;
  export var sep: string;
}


// my.ts
/// <reference path="node.d.ts" />

import { Url, parse } from 'url';
import * as path from 'path';

// 使用导入的模块
const myUrl: Url = parse('https://example.com/path');
console.log("🚀 ~ myUrl:", myUrl)
const normalizedPath = path.normalize('/a/b/c/');
console.log("🚀 ~ normalizedPath:", normalizedPath)
const joinedPath = path.join('dir1', 'dir2', 'file.txt');
console.log("🚀 ~ joinedPath:", joinedPath)
console.log(path.sep);  // 输出系统的路径分隔符，如在Unix系统上输出'/'

```
