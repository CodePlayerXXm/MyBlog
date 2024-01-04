---
title: TypeScript namespace
group: TypeScript
layout: doc
date: 2024-01-04T02:34:55.378Z
tags: [TypeScript]
sidebar: true
summary: TypeScript namespace
---

namespace 是一种将相关代码组织在一起的方式，中文译为“命名空间”。

它出现在 ES 模块诞生之前，作为 TypeScript 自己的模块格式而发明的。但是，自从有了 ES 模块，官方已经不推荐使用 namespace 了。

# 基本用法

* namespace 用来建立一个容器，内部的所有变量和函数，都必须在这个容器里面使用。
* 如果要在命名空间以外使用内部成员，就必须为该成员加上export前缀，表示对外输出该成员。
* namespace 会变成一个值，保留在编译后的代码中。这一点要小心，它不是纯的类型代码。
* namespace 内部还可以使用import命令输入外部成员，相当于为外部成员起别名。别名能够简化代码。import命令也可以在 namespace 外部，指定别名。
* namespace 可以嵌套。
* namespace 不仅可以包含实义代码，还可以包括类型代码。
* 如果 namespace 代码放在一个单独的文件里，那么引入这个文件需要使用三斜杠的语法

namespace 与模块的作用是一致的，都是把相关代码组织在一起，对外输出接口。区别是一个文件只能有一个模块，但可以有多个 namespace。由于模块可以取代 namespace，而且是 JavaScript 的标准语法，还不需要编译转换，所以建议总是使用模块，替代 namespace。

```TypeScript

namespace Utils {
  function isString(value:any) {
    return typeof value === 'string';
  }

  // 正确
  isString('yes');
}

Utils.isString('no'); // 报错


// 外部调用要export
namespace Utility {
  export function log(msg:string) {
    console.log(msg);
  }
  export function error(msg:string) {
    console.error(msg);
  }
}

Utility.log('Call me');
Utility.error('maybe!');


// 编译后是个对象
var Utility;

(function (Utility) {
  function log(msg) {
    console.log(msg);
  }
  Utility.log = log;
  function error(msg) {
    console.error(msg);
  }
  Utility.error = error;
})(Utility || (Utility = {}));


// import 其他 namespace
namespace Utils {
  export function isString(value:any) {
    return typeof value === 'string';
  }
}

namespace App {
  import isString = Utils.isString;

  isString('yes');
  // 等同于
  Utils.isString('yes');
}


// import 也可以在外部调用
namespace Shapes {
  export namespace Polygons {
    export class Triangle {}
    export class Square {}
  }
}

import polygons = Shapes.Polygons;

// 等同于 new Shapes.Polygons.Square()
let sq = new polygons.Square();


// namespace嵌套
namespace Utils {
  export namespace Messaging {
    export function log(msg:string) {
      console.log(msg);
    }
  }
}

Utils.Messaging.log('hello') // "hello"


// namespace 包括类型代码。
namespace N {
  export interface MyInterface{}
  export class MyClass{}
}


// 三斜杠引入单独文件里的namespace
/// <reference path = "SomeFileName.ts" />
```

## namespace 的输出

* namespace 本身也可以使用export命令输出，供其他文件使用。
* 其他脚本文件使用import命令，加载这个命名空间。
* 不过，更好的方法还是建议使用模块，采用模块的输出和输入。


```TypeScript

// export 导出
// shapes.ts
export namespace Shapes {
  export class Triangle {
    // ...
  }
  export class Square {
    // ...
  }
}

// import 导入
// 写法一
import { Shapes } from './shapes';
let t = new Shapes.Triangle();

// 写法二
import * as shapes from "./shapes";
let t = new shapes.Shapes.Triangle();

// 建议使用模块，采用模块的输出和输入
// shapes.ts
export class Triangle {
  /* ... */
}
export class Square {
  /* ... */
}

// shapeConsumer.ts
import * as shapes from "./shapes";
let t = new shapes.Triangle();
```

## namespace 的合并

* 多个同名的 namespace 会自动合并，这一点跟 interface 一样。<br/>

这样做的目的是，如果同名的命名空间分布在不同的文件中，TypeScript 最终会将它们合并在一起。这样就比较方便扩展别人的代码。

* 合并命名空间时，命名空间中的非export的成员不会被合并，但是它们只能在各自的命名空间中使用。

* 命名空间还可以跟同名函数合并，但是要求同名函数必须在命名空间之前声明。这样做是为了确保先创建出一个函数对象，然后同名的命名空间就相当于给这个函数对象添加额外的属性。

* 命名空间也能与同名 class 合并，同样要求class 必须在命名空间之前声明，原因同上。

* 命名空间还能与同名 Enum 合并。注意，Enum 成员与命名空间导出成员不允许同名。

```TypeScript

namespace Animals {
  export class Cat {}
}
namespace Animals {
  export interface Legged {
    numberOfLegs: number;
  }
  export class Dog {}
}

// 等同于
namespace Animals {
  export interface Legged {
    numberOfLegs: number;
  }
  export class Cat {}
  export class Dog {}
}


// 没有export的成员不会合并
namespace N {
  const a = 0;

  export function foo() {
    console.log(a);  // 正确
  }
}

namespace N {
  export function bar() {
    foo(); // 正确
    console.log(a);  // 报错
  }
}


// 与同名函数合并
function f() {
  return f.version;
}

namespace f {
  export const version = '1.0';
}

f()   // '1.0'
f.version // '1.0'


// 与同名class合并
class C {
  foo = 1;
}

namespace C {
  export const bar = 2;
}

C.bar // 2


// 与同名 Enum 合并。
enum E {
  A,
  B,
  C,
}

namespace E {
  export function foo() {
    console.log(E.C);
  }
}

E.foo() // 2


// Enum 成员与命名空间导出成员不允许同名
enum E {
  A, // 报错
  B,
}

namespace E {
  export function A() {} // 报错
}
```
