---
title: TypeScript d.ts 类型声明文件
group: TypeScript
layout: doc
date: 2024-01-15T07:16:46.499Z
tags: [TypeScript]
sidebar: true
summary: TypeScript d.ts 类型声明文件
---

## 简介

&emsp;&emsp;单独使用的模块，会提供单独的类型声明文件（declaration file），把本模块的外部接口的所有类型都写在这个文件里面。
便于模块使用者了解接口，也便于编译器检查使用者的用法是否正确。<br/>

&emsp;&emsp;类型声明文件里面只有类型代码，没有具体的代码实现。它的文件名一般为[模块名].d.ts的形式，其中的d表示 declaration（声明）。

* 模块输出在类型声明文件中，可使用export default表示或export = 表示。
* 类型声明文件可以包括在项目的 tsconfig.json 文件里面

```TypeScript
// 写法一
declare const pi: number;
export default pi;

// 写法二
declare const pi: number;
export= pi;

```

```Json

{
  "compilerOptions": {},
  "files": [
    "src/index.ts",
    "typings/moment.d.ts"
  ]
}

```

## 类型声明文件的来源

* TypeScript 编译器自动生成
* TypeScript 内置类型文件
* 外部模块的类型声明文件，需要自己安装

## 自动生成

tsconfig.json中配置

```Json

{
  "compilerOptions": {
    "declaration": true
  }
}
```
tsc指令中

```Shell

$ tsc --declaration
```
## 内置声明文件

安装TypeScript时自带一些内置的类型声明文件——内置的全局对象（JavaScript 语言接口和运行环境 API）的类型声明。<br/>

位于 TypeScript 语言安装目录的lib文件夹内。

* lib.d.ts
* lib.dom.d.ts
* lib.es2015.d.ts
* lib.es2016.d.ts
* lib.es2017.d.ts
* lib.es2018.d.ts
* lib.es2019.d.ts
* lib.es2020.d.ts
* lib.es5.d.ts
* lib.es6.d.ts

TypeScript 编译器会自动根据编译目标target的值，加载对应的内置声明文件，<br/>

也可以使用编译选项lib，指定加载哪些内置声明文件。<br/>

编译选项noLib会禁止加载任何内置声明文件。


```Json
{
  "compilerOptions": {
    "lib": ["dom", "es2021"]
  }
}

```

## 外部类型声明文件

项目中使用了外部的某个第三方代码库，那么就需要这个库的类型声明文件

* 这个库自带了类型声明文件。使用这个库可能需要单独加载它的类型声明文件。
* 这个库没有自带，但是可以找到社区制作的类型声明文件。
  * 一般是@types/XXX， npm install -D @types/XXX即可。@types/jquery这个库就安装到项目的node_modules/@types/jquery目录，里面的index.d.ts文件就是 jQuery 的类型声明文件。
  * 如果类型声明文件不是index.d.ts，那么就需要在package.json的types或typings字段，指定类型声明文件的文件名。
  * TypeScript 会自动加载node_modules/@types目录下的模块，但可以使用编译选项typeRoots改变这种行为。
  * 默认情况下，TypeScript 会自动加载typeRoots目录里的所有模块，编译选项types可以指定加载哪些模块。
* 找不到类型声明文件，需要自己写
* 有时实在没有第三方库的类型声明文件，又很难完整给出该库的类型描述，这时你可以告诉 TypeScript 相关对象的类型是any

```Json

// TypeScript 不再去node_modules/@types目录，
// 而是去跟当前tsconfig.json同级的typings和vendor/types子目录，
// 加载类型模块了。
{
  "compilerOptions": {
    "typeRoots": ["./typings", "./vendor/types"]
  }
}


// 默认情况下，TypeScript 会自动加载typeRoots目录里的所有模块，
// 编译选项types可以指定加载哪些模块
{
  "compilerOptions": {
    "types" : ["jquery"]
  }
}
```

告诉 TypeScript 相关对象的类型是any

```TypeScript

declare var $:any

// 或者
declare type JQuery = any;
declare var $:JQuery;


declare module '模块名';

```

## declare 关键字

<a href="./Declare.html">详见declare篇</a>


## 模块发布

* 发布的模块包含自己的类型声明文件，可以在 package.json 文件里面添加types或typings，指明类型声明文件的位置。
* 如果类型声明文件名为index.d.ts，且在项目的根目录中，那就不需要在package.json里面注明了。
* 有时，类型声明文件会单独发布成一个 npm 模块，这时用户就必须同时加载该模块。

```Json

{
  "name": "awesome",
  "author": "Vandelay Industries",
  "version": "1.0.0",
  "main": "./lib/main.js",
  "types": "./lib/main.d.ts"
}

```
```Json

{
  "name": "browserify-typescript-extension",
  "author": "Vandelay Industries",
  "version": "1.0.0",
  "main": "./lib/main.js",
  "types": "./lib/main.d.ts",
  "dependencies": {
    "browserify": "latest",
    "@types/browserify": "latest",
    "typescript": "next"
  }
}

```

## 三斜杠命令

* 如果类型声明文件的内容非常多，可以拆分成多个文件，然后入口文件使用三斜杠命令，加载其他拆分后的文件。
* 只能用在文件的头部，如果用在其他地方，会被当作普通的注释
* 在三斜线命令之前只允许使用单行注释、多行注释和其他三斜线命令，否则三斜杠命令也会被当作普通的注释。
* 除了拆分类型声明文件，三斜杠命令也可以用于普通脚本加载类型声明文件。

三斜杠命令主要包含三个参数，代表三种不同的命令。

* path
* types
* lib

### /// &lt;reference path="" /&gt;

* path参数必须指向一个存在的文件，若文件不存在会报错。
* path参数不允许指向当前文件。
* 默认情况下，每个三斜杠命令引入的脚本，都会编译成单独的 JS 文件
* 如果希望编译后只产出一个合并文件，可以使用编译选项outFile
* outFile编译选项不支持合并 CommonJS 模块和 ES 模块，只有当编译参数module的值设为 None、System 或 AMD 时，才能编译成一个文件。
* 如果打开了编译参数noResolve，则忽略三斜杠指令。将其当作一般的注释，原样保留在编译产物中。

```TypeScript

// 当前脚本依赖于./lib.ts，里面是add()的定义。
// 编译当前脚本时，还会同时编译./lib.ts。
// 编译产物会有两个 JS 文件，一个当前脚本，另一个就是./lib.js
/// <reference path="./lib.ts" />

let count = add(1, 2);

```

### /// &lt;reference type="" /&gt;

* types 参数用来告诉编译器当前脚本依赖某个 DefinitelyTyped 类型库，通常安装在node_modules/@types目录。
* 这个命令只在你自己手写类型声明文件（.d.ts文件）时，才有必要用到
* 普通的.ts脚本文件,可以使用tsconfig.json文件的types属性指定依赖的类型库。

### /// &lt;reference lib="" /&gt;

* 该命令允许脚本文件显式包含内置 lib 库，等同于在tsconfig.json文件里面使用lib属性指定 lib 库。
* 库文件并不是固定的，会随着 TypeScript 版本的升级而更新

```TypeScript

/// <reference lib="es2017.string" />

```
