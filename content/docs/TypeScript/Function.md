---
title: TypeScript 的函数类型
group: TypeScript
layout: doc
date: 2023-12-12T07:40:42.261Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的函数类型。
---

## 简介

函数没有返回值时，可以省略返回值类型，如：

 ```TypeScript
function hello(txt:string) {
  console.log('hello ' + txt);
}
```

有时候处于文档的目的，或者为防止不小心改掉返回的值，还是会写上返回的值

```TypeScript
// 写法一
const hello = function (txt:string) {
  console.log('hello ' + txt);
}

// 写法二
const hello:
  (txt:string) => void
= function (txt) {
  console.log('hello ' + txt);
};
```
写法二 箭头函数不可省略括号，函数类型里面的参数名与实际参数名，可以不一致。如：

```TypeScript
let f:(x:number) => number;

f = function (y:number) {
  return y;
};
```

如果函数的类型定义很冗长，或者多个函数使用同一种类型，写法二用起来就很麻烦。因此，往往用type命令为函数类型定义一个别名，便于指定给其他变量。

```TypeScript
type MyFunc = (txt:string) => void;

const hello:MyFunc = function (txt) {
  console.log('hello ' + txt);
};
```

函数的实际参数个数，可以少于类型指定的参数个数，但是不能多于，即 TypeScript 允许省略参数。

```TypeScript
let myFunc:
  (a:number, b:number) => number;

myFunc = (a:number) => a; // 正确

myFunc = (
  a:number, b:number, c:number
) => a + b + c; // 报错
```

同理，函数x只有一个参数，函数y有两个参数，x可以赋值给y，反过来就不行。

```TypeScript
let x = (a:number) => 0;
let y = (b:number, s:string) => 0;

y = x; // 正确
x = y; // 报错
```

如果想要套用另外一个函数的类型，可以用typeof

```TypeScript
let add:{
  (x:number, y:number):number
};

add = function (x, y) {
  return x + y;
};
```

函數还可以用对象的写法

```Typescript
{
  (参数列表): 返回值
}
```
此写法适合函数上还有属性的情况

```Typescript

function f(x:number) {
  console.log(x);
}

f.version = '1.0';

let foo: {
  (x:number): void;
  version: string
} = f;
```
## 箭头函数

值与类型混合时，函数返回值要写在括号的后面

```TypeScript{4}

const repeat = (
  str:string,
  times:number
):string => str.repeat(times);

```
单纯表示类型时，函数返回值要写在剪头的后面

```TypeScript{2}

function greet(
  fn:(a:string) => void
):void {
  fn('world');
}
```

回调函数一般是类型与值混合的情况

```TypeScript
type Person = { name: string };

const people = ['alice', 'bob', 'jan'].map(
  (name):Person => ({name})
);
```
## 可选参数

可选参数就是在参数后面加上?, 表示该参数的类型实际上是原始类型|undefined,传入undefined也没有报错

```TypeScript

function f(x?:number) {
  return x;
}

f(undefined) // 正确

```
但是，反过来就不成立，类型显式设为undefined的参数，就不能省略

```TypeScript
function f(x:number|undefined) {
  return x;
}

f() // 报错
```

* 可选参数只能写在尾部。
* 如果前部的参数可能为空，只能用显式注明该参数类型可能为undefined。
* 函数体内部用到可选参数时，需要判断该参数是否为undefined。

```TypeScript


let myFunc:
  (a?:number, b:number) => number; // 报错

let myFunc:
  (
    a:number|undefined,
    b:number
  ) => number;

let myFunc:
  (a:number, b?:number) => number;

myFunc = function (x, y) {
  if (y === undefined) {
    return x;
  }
  return x + y;
}

```

## 参数默认值

有默认值，可以省略类型，自己推断出来

```TypeScript

function createPoint(
  x:number = 0,
  y:number = 0
):[number, number] {
  return [x, y];
}

function createPoint(
  x = 0, y = 0
) {
  return [x, y];
}
```

* 可选参数与默认值不能同时使用。
* 设有默认值的参数，如果传入undefined，也会触发默认值。
* 具有默认值的参数如果不位于参数列表的末尾，调用时不能省略，如果要触发默认值，必须显式传入undefined。

```TypeScript

// 报错
function f(x?: number = 0) {
  // ...
}

function f(x = 456) {
  return x;
}

f2(undefined) // 456

function add(
  x:number = 0,
  y:number
) {
  return x + y;
}

add(1) // 报错
add(undefined, 1) // 正确
```
## 参数解构

可以结合类型别名（type 命令）一起使用，代码会看起来简洁一些。

```TypeScript
function f(
  [x, y]: [number, number]
) {
  // ...
}

function sum(
  { a, b, c }: {
     a: number;
     b: number;
     c: number
  }
) {
  console.log(a + b + c);
}

type ABC = { a:number; b:number; c:number };

function sum({ a, b, c }:ABC) {
  console.log(a + b + c);
}
```
## rest参数

rest可以是数组或者元组，元组需要声明每一个剩余参数的类型。如果元组里面的参数是可选的，则要使用可选参数。

```TypeScript

// rest 参数为数组
function joinNumbers(...nums:number[]) {
  // ...
}

// rest 参数为元组
function f(...args:[boolean, number]) {
  // ...
}

// 可选参数，要用个?标记
function f(
  ...args: [boolean, string?]
) {}

```

rest可以嵌套，也可以与解构一起使用

```TypeScript

function f(...args:[boolean, ...string[]]) {
  // ...
}

function repeat(
  ...[str, times]: [string, number]
):string {
  return str.repeat(times);
}

// 等同于
function repeat(
  str: string,
  times: number
):string {
  return str.repeat(times);
}


```
## readonly 只读参数

如果函数内部不能修改某个参数，可以在函数定义时，在参数类型前面加上readonly关键字，表示这是只读参数。

```TypeScript
function arraySum(
  arr:readonly number[]
) {
  // ...
  arr[0] = 0; // 报错
}
```
## void类型

如果声明返回void 返回值就会报错。如果没有配置strictNullChecks，返回null 或者undefined都不会报错，反之返回null则会报错。

```TypeScript
function f():void {
  return 123; // 报错
}

function f():void {
  return undefined; // 正确
}

function f():void {
  return null; // 正确
}

// 打开编译选项 strictNullChecks

function f():void {
  return undefined; // 正确
}

function f():void {
  return null; // 报错
}
```
如果变量、对象方法、函数参数（箭头函数）是一个返回值为 void 类型的函数，那么并不代表不能赋值为有返回值的函数。恰恰相反，该变量、对象方法和函数参数可以接受返回任意值的函数，这时并不会报错。

```TypeScript
type voidFunc = () => void;

// 没有报错
const f:voidFunc = () => {
  return 123;
};
```

这是因为，这时 TypeScript 认为，这里的 void 类型只是表示该函数的返回值没有利用价值，或者说不应该使用该函数的返回值。只要不用到这里的返回值，就不会报错。

这样设计是有现实意义的。举例来说，数组方法Array.prototype.forEach(fn)的参数fn是一个函数，而且这个函数应该没有返回值，即返回值类型是void。

但是，实际应用中，很多时候传入的函数是有返回值，但是它的返回值不重要，或者不产生作用。

```TypeScript

const src = [1, 2, 3];
const ret = [];

src.forEach(el => ret.push(el));

```
上面示例中，push()有返回值，表示插入新元素后数组的长度。但是，对于forEach()方法来说，这个返回值是没有作用的，根本用不到，所以 TypeScript 不会报错。<br/>

如果后面使用了这个函数的返回值，就违反了约定，则会报错。

```TypeScript

type voidFunc = () => void;

const f:voidFunc = () => {
  return 123;
};

f() * 2 // 报错

```
这种情况仅限于变量、对象方法和函数参数，函数字面量如果声明了返回值是 void 类型，还是不能有返回值。

```TypeScript
function f():void {
  return true; // 报错
}

const f3 = function ():void {
  return true; // 报错
};
```

函数的运行结果如果是抛出错误，也允许将返回值写成void。

```TypeScript

function throwErr():void {
  throw new Error('something wrong');
}
```

## never 类型

* throw new Error 函数返回类型应该是never, return 返回一个 Error 对象，返回值就不是 never 类型。
* 无限执行的函数。
```TypeScript

function fail(msg:string):never {
  throw new Error(msg);
}

function fail():Error {
  return new Error("Something failed");
}

const sing = function():never {
  while (true) {
    console.log('sing');
  }
};

```
never类型不同于void类型。前者表示函数没有执行结束，不可能有返回值；后者表示函数正常执行结束，但是不返回值，或者说返回undefined

```TypeScript
// 正确
function sing():void {
  console.log('sing');
}

// 报错
function sing():never {
  console.log('sing');
}
```
函数sing()虽然没有return语句，但实际上是省略了return undefined这行语句，真实的返回值是undefined。所以，它的返回值类型要写成void，而不是never，写成never会报错。

如果程序中调用了一个返回值类型为never的函数，那么就意味着程序会在该函数的调用位置终止，永远不会继续执行后续的代码

```TypeScript
function neverReturns():never {
  throw new Error();
}

function f(
  x:string|undefined
) {
  if (x === undefined) {
    neverReturns();
  }

  x; // 推断为 string
}
```
一个函数如果某些条件下有正常返回值，另一些条件下抛出错误，这时它的返回值类型可以省略never。

```TypeScript

function sometimesThrow():number {
  if (Math.random() > 0.5) {
    return 100;
  }

  throw new Error('Something went wrong');
}

const result = sometimesThrow();
```
上面示例中，函数sometimesThrow()的返回值其实是number|never，但是一般都写成number，包括最后一行的变量result的类型，也是被推断为number。<br/

原因是前面章节提到过，never是 TypeScript 的唯一一个底层类型，所有其他类型都包括了never。从集合论的角度看，number|never等同于number。这也提示我们，函数的返回值无论是什么类型，都可能包含了抛出错误的情况。

## 局部类型

```TypeScript
function hello(txt:string) {
  type message = string;
  let newTxt:message = 'hello ' + txt;
  return newTxt;
}

const newTxt:message = hello('world'); // 报错

```
上面示例中，类型message是在函数hello()内部定义的，只能在函数内部使用。在函数外部使用，就会报错。

## 函数重载

 **函数可以接受不同类型或不同个数的参数，并且根据参数的不同，会有不同的函数行为。这种根据参数类型不同，执行不同逻辑的行为，称为函数重载（function overload）。**

```TypeScript

function reverse(str:string):string;
function reverse(arr:any[]):any[];
function reverse(
  stringOrArray:string|any[]
):string|any[] {
  if (typeof stringOrArray === 'string')
    return stringOrArray.split('').reverse().join('');
  else
    return stringOrArray.slice().reverse();
}

reverse('abc') // 'cba'
reverse([1, 2, 3]) // [3, 2, 1]

```
有一些编程语言允许不同的函数参数，对应不同的函数实现。但是，JavaScript 函数只能有一个实现，必须在这个实现当中，处理不同的参数。因此，函数体内部就需要判断参数的类型及个数，并根据判断结果执行不同的操作。

```TypeScript
function add(
  x:number,
  y:number
):number;
function add(
  x:any[],
  y:any[]
):any[];
function add(
  x:number|any[],
  y:number|any[]
):number|any[] {
  if (typeof x === 'number' && typeof y === 'number') {
    return x + y;
  } else if (Array.isArray(x) && Array.isArray(y)) {
    return [...x, ...y];
  }

  throw new Error('wrong parameters');
}
```
上面示例中，函数add()内部使用if代码块，分别处理参数的两种情况。<br/>

注意，重载的各个类型描述与函数的具体实现之间，不能有其他代码，否则报错。<br/>

另外，虽然函数的具体实现里面，有完整的类型声明。但是，函数实际调用的类型，以前面的类型声明为准。比如，上例的函数实现，参数类型和返回值类型都是number|any[]，但不意味着参数类型为number时返回值类型为any[]。<br/>

* 函数重载的每个类型声明之间，以及类型声明与函数实现的类型之间，不能有冲突。
* 重载声明的排序很重要，因为 TypeScript 是按照顺序进行检查的，一旦发现符合某个类型声明，就不再往下检查了，所以类型最宽的声明应该放在最后面，防止覆盖其他类型声明。

```TypeScript
// 报错
function fn(x:boolean):void;
function fn(x:string):void;
function fn(x:number|string) {
  console.log(x);
}

function f(x:any):number;
function f(x:string): 0|1;
function f(x:any):any {
  // ...
}

const a:0|1 = f('hi'); // 报错

```

上面声明中，第一行类型声明x:any范围最宽，导致函数f()的调用都会匹配这行声明，无法匹配第二行类型声明，所以最后一行调用就报错了，因为等号两侧类型不匹配，左侧类型是0|1，右侧类型是number。这个函数重载的正确顺序是，第二行类型声明放到第一行的位置。

* 对象也可以使用重载
* 函数重载一般是用来描述参数与返回值之间的对应关系
* 函数重载是一个复杂的类型声明方式，一般的来说，如果可以优先使用联合类型来表示函数的类型

```TypeScript
//对象的函数重载
class StringBuilder {
  #data = '';

  add(num:number): this;
  add(bool:boolean): this;
  add(str:string): this;
  add(value:any): this {
    this.#data += String(value);
    return this;
  }

  toString() {
    return this.#data;
  }
}

function createElement(
  tag:'a'
):HTMLAnchorElement;
function createElement(
  tag:'canvas'
):HTMLCanvasElement;
function createElement(
  tag:'table'
):HTMLTableElement;
function createElement(
  tag:string
):HTMLElement {
  // ...
}

//上面的函数的类型，对象的写法
type CreateElement = {
  (tag:'a'): HTMLAnchorElement;
  (tag:'canvas'): HTMLCanvasElement;
  (tag:'table'): HTMLTableElement;
  (tag:string): HTMLElement;
}


// 写法一
function len(s:string):number;
function len(arr:any[]):number;
function len(x:any):number {
  return x.length;
}

// 写法二 联合类型的写法比较简单
function len(x:any[]|string):number {
  return x.length;
}

```
## 构造函数

* 构造函数的类型写法，就是在参数列表前面加上new命令
* 某些函数既是构造函数，又可以当作普通函数使用，比如Date()。这时，类型声明可以写成下面这样。

```TypeScript
class Animal {
  numLegs:number = 4;
}

type AnimalConstructor = new () => Animal;

function create(c:AnimalConstructor):Animal {
  return new c();
}

const a = create(Animal);


// 对象的写法 Date
type F = {
  new (s:string): object;
  (n?:number): number;
}

```
