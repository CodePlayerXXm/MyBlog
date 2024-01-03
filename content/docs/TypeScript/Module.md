---
title: TypeScript 模块
group: TypeScript
layout: doc
date: 2024-01-03T07:02:59.757Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 模块
---

## 简介

* 如果一个文件不包含 export 语句，但是希望把它当作一个模块（即内部变量对外不可见），可以在脚本头部添加一行语句 export {}。
* TypeScript 模块除了支持所有 ES 模块的语法，特别之处在于允许输出和输入类型。
* TypeScript 允许加载模块时，省略模块文件的后缀名，它会自动定位，将./a定位到./a.ts
* 编译时，可以两个脚本同时编译。也可以只编译b.ts，因为它是入口脚本，tsc 会自动编译它依赖的所有脚本。

## import type 语句

* 导入type关键字可以加在{}里面，也可以在外面
* 支持导入默认类型
* 导出也同第一条
* 如果类作为type导出，只能作为类型，不能实例化

```TypeScript

// a.ts
export interface A {
  foo: string;
}
export let a = 123;
// b.ts
import { A, a } from './a';

// 强调A是类型
import { type A, a } from './a';

// 正确
import type { A } from './a';
// 报错
import type { a } from './a';


// 支持引入默认类型
import type DefaultType from 'moduleA';
import type * as TypeNS from 'moduleA';


// 对应导出也有两种方式
type A = 'a';
type B = 'b';
// 方法一
export {type A, type B};
// 方法二
export type {A, B};

// 强调类A是作为类型
class Point {
  x: number;
  y: number;
}
export type { Point };

import type { Point } from './module';
const p:Point = { x: 0, y: 0 };
const pp = new Point(); // 报错
```
## importsNotUsedAsValues 编译设置

TypeScript 提供了importsNotUsedAsValues编译设置项，有三个可能的值。

* remove：这是默认值，自动删除输入类型的 import 语句。
* preserve：保留输入类型的 import 语句。
* error：保留输入类型的 import 语句（与preserve相同），但是必须写成import type的形式，否则报错。

```TypeScript
import { TypeA } from './a';

// remove的编译结果会将该语句删掉。

// preserve的编译结果会保留该语句，但会删掉其中涉及类型的部分。
import './a';

// error的编译结果与preserve相同，
// 但在编译过程中会报错，因为它要求输入类型的import语句必须写成import type 的形式。
// 原始语句改成下面的形式，就不会报错。
import type { TypeA } from './a';

```
## CommonJS 模块

CommonJS 是 Node.js 的专用模块格式，与 ES 模块格式不兼容。

### import = 语句

* TypeScript 使用import =语句输入 CommonJS 模块。
* 除了使用import =语句，TypeScript 还允许使用import * as [接口名] from "模块文件"输入 CommonJS 模块。

```TypeScript

import fs = require('fs');
const code = fs.readFileSync('hello.ts', 'utf8');

import * as fs from 'fs';
// 等同于
import fs = require('fs');

```

### export = 语句

* TypeScript 使用export =语句，输出 CommonJS 模块的对象，等同于 CommonJS 的module.exports对象。
* export =语句输出的对象，只能使用import =语句加载。

```TypeScript

let obj = { foo: 123 };
export = obj;

import obj = require('./a');
console.log(obj.foo); // 123

```

## 模块定位

* TypeScript 确定模块的具体位置，用到的算法就叫做“模块定位”。
* 编译参数moduleResolution，用来指定具体使用哪一种定位算法。常用的算法有两种：Classic和Node。
* 如果没有指定moduleResolution，它的默认值与编译参数module有关。
* module设为commonjs时（项目脚本采用 CommonJS 模块格式），moduleResolution的默认值为Node，即采用 Node.js 的模块定位算法。
* 其他情况下（module设为 es2015、 esnext、amd, system, umd 等等），就采用Classic定位算法。

### 相对模块，非相对模块

* 相对模块指的是路径以/、./、../开头的模块。下面 import 语句加载的模块，都是相对模块。

```TypeScript

import Entry from "./components/Entry";
import { DefaultHeaders } from "../constants/http";
import "/mod";

```
* 非相对模块指的是不带有路径信息的模块。下面 import 语句加载的模块，都是非相对模块。

```TypeScript
import * as $ from "jquery";
import { Component } from "@angular/core";

```

### Classic 模块定位算法

 Classic 方法以当前脚本的路径作为“基准路径”，计算相对模块的位置。比如，脚本a.ts里面有一行代码import { b } from "./b"，那么 TypeScript 就会在a.ts所在的目录，查找b.ts和b.d.ts。<br/>

至于非相对模块，也是以当前脚本的路径作为起点，一层层查找上级目录。比如，脚本a.ts里面有一行代码import { b } from "b"，那么就会依次在每一级上层目录里面，查找b.ts和b.d.ts。


### Node 方法

Node 方法就是模拟 Node.js 的模块加载方法，也就是require()的实现方法。<br/>

相对模块依然是以当前脚本的路径作为“基准路径”。比如，脚本文件a.ts里面有一行代码let x = require("./b");，TypeScript 按照以下顺序查找。

* 当前目录是否包含b.ts、b.tsx、b.d.ts。如果不存在就执行下一步。
* 当前目录是否存在子目录b，该子目录里面的package.json文件是否有types字段指定了模块入口文件。如果不存在就执行下一步。
* 当前目录的子目录b是否包含index.ts、index.tsx、index.d.ts。如果不存在就报错。

非相对模块则是以当前脚本的路径作为起点，逐级向上层目录查找是否存在子目录node_modules。<br/>
比如，脚本文件a.js有一行let x = require("b");，TypeScript 按照以下顺序进行查找。

* 当前目录的子目录node_modules是否包含b.ts、b.tsx、b.d.ts。
* 当前目录的子目录node_modules，是否存在文件package.json，该文件的types字段是否指定了入口文件，如果是的就加载该文件。
* 当前目录的子目录node_modules里面，是否包含子目录@types，在该目录中查找文件b.d.ts。
* 当前目录的子目录node_modules里面，是否包含子目录b，在该目录中查找index.ts、index.tsx、index.d.ts。
* 进入上一层目录，重复上面4步，直到找到为止。

### 路径映射

TypeScript 允许开发者在tsconfig.json文件里面，手动指定脚本模块的路径。

* baseUrl字段可以手动指定脚本模块的基准目录。

```TypeScript

{
  "compilerOptions": {
    "baseUrl": "."
  }
}

```
* paths字段指定非相对路径的模块与实际脚本的映射。

```TypeScript

{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "jquery": ["node_modules/jquery/dist/jquery"]
    }
  }
}

```
上面示例中，加载模块jquery时，实际加载的脚本是node_modules/jquery/dist/jquery，它的位置要根据baseUrl字段计算得到。<br/>

注意，上例的jquery属性的值是一个数组，可以指定多个路径。如果第一个脚本路径不存在，那么就加载第二个路径，以此类推。<br/>

* rootDirs字段指定模块定位时必须查找的其他目录。

```TypeScript

{
  "compilerOptions": {
    "rootDirs": ["src/zh", "src/de", "src/#{locale}"]
  }
}

```
上面示例中，rootDirs指定了模块定位时，需要查找的不同的国际化目录。

### tsc 的--traceResolution参数

由于模块定位的过程很复杂，tsc 命令有一个--traceResolution参数，能够在编译时在命令行显示模块定位的每一步。

```shell

$ tsc --traceResolution

```

上面示例中，traceResolution会输出模块定位的判断过程。


### tsc 的--noResolve参数

tsc 命令的--noResolve参数，表示模块定位时，只考虑在命令行传入的模块。<br/>

举例来说，app.ts包含如下两行代码。

```TypeScript

import * as A from "moduleA";
import * as B from "moduleB";

```
使用下面的命令进行编译。

```shell

$ tsc app.ts moduleA.ts --noResolve

```
上面命令使用--noResolve参数，因此可以定位到moduleA.ts，因为它从命令行传入了；无法定位到moduleB，因为它没有传入，因此会报错。
