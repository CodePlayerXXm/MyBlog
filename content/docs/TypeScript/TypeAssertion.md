---
title: TypeScript 的类型断言
group: TypeScript
layout: doc
date: 2024-01-02T07:47:33.768Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的类型断言
---

## 简介

TypeScript 提供了“类型断言”这样一种手段，允许开发者在代码中“断言”某个值的类型，告诉编译器此处的值是什么类型。TypeScript 一旦发现存在类型断言，就不再对该值进行类型推断，而是直接采用断言给出的类型。

这种做法的实质是，允许开发者在某个位置“绕过”编译器的类型推断，让本来通不过类型检查的代码能够通过，避免编译器报错。这样虽然削弱了 TypeScript 类型系统的严格性，但是为开发者带来了方便，毕竟开发者比编译器更了解自己的代码。

* 可以用<>或者as，推荐用as因为JSX 语法冲突
* 类型断言不应滥用，因为它改变了 TypeScript 的类型检查，很可能埋下错误的隐患。
* 类型断言的一大用处是，指定 unknown 类型的变量的具体类型。
* 另外，类型断言也适合指定联合类型的值的具体类型。

```Typescript

// 语法一
let bar:T = <T>foo;
// 语法二
let bar:T = foo as T;

// 第一种断言将类型改成与等号左边一致
// 第二种断言使得等号右边的类型是左边类型的子类型，子类型可以赋值给父类型，同时因为存在类型断言，就没有严格字面量检查了，所以不报错。
// 报错
const p:{ x: number } = { x: 0, y: 0 };
// 正确
const p0:{ x: number } =
  { x: 0, y: 0 } as { x: number };
// 正确
const p1:{ x: number } =
  { x: 0, y: 0 } as { x: number; y: number };


// 配合()使用
const username = document.getElementById('username');
if (username) {
  (username as HTMLInputElement).value; // 正确
}


const data:object = {
  a: 1,
  b: 2,
  c: 3
};
data.length; // 报错
(data as Array<string>).length; // 正确


const value:unknown = 'Hello World';
const s1:string = value; // 报错
const s2:string = value as string; // 正确


const s1:number|string = 'hello';
const s2:number = s1 as number;
```

## 类型断言的条件

expr是实际的值，T是类型断言，它们必须满足下面的条件：expr是T的子类型，或者T是expr的子类型。
也就是说，类型断言要求实际的类型与断言的类型兼容，实际类型可以断言为一个更加宽泛的类型（父类型），也可以断言为一个更加精确的类型（子类型），但不能断言为一个完全无关的类型。但是，如果真的要断言成一个完全无关的类型，也是可以做到的。那就是连续进行两次类型断言，先断言成 unknown 类型或 any 类型，然后再断言为目标类型。因为any类型和unknown类型是所有其他类型的父类型，所以可以作为两种完全无关的类型的中介。

```Typescript

const n = 1;
const m:string = n as string; // 报错

// 转成完全不相干的类型
const n = 1;
const m:string = n as unknown as string; // 正确

```

## as const 断言

* 如果没有声明变量类型，let 命令声明的变量，会被类型推断为 TypeScript 内置的基本类型之一；const 命令声明的变量，则被推断为值类型常量。
* 另一种解决方法是使用类型断言。TypeScript 提供了一种特殊的类型断言as const，用于告诉编译器，推断类型时，可以将这个值推断为常量，即把 let 变量断言为 const 变量，从而把内置的基本类型变更为值类型。
* 使用了as const断言以后，let 变量就不能再改变值了。
* as const断言只能用于字面量，不能用于变量。另外，as const也不能用于表达式。
* as const也可以写成前置的形式。
* as const断言可以用于整个对象，也可以用于对象的单个属性，这时它的类型缩小效果是不一样的。
* 数组字面量使用as const断言后，类型推断就变成了只读元组。所以很适合用于函数的 rest 参数。
* Enum 成员也可以使用as const断言。

```Typescript

// 类型推断为基本类型 string
let s1 = 'JavaScript';
// 类型推断为字符串 “JavaScript”
const s2 = 'JavaScript';


let s = 'JavaScript';
type Lang =
  |'JavaScript'
  |'TypeScript'
  |'Python';
function setLang(language:Lang) {
  /* ... */
}
setLang(s); // 报错
let s = 'JavaScript' as const;
setLang(s);  // 正确


// 不能再修改值
let s = 'JavaScript' as const;
s = 'Python'; // 报错


// 只能用于字面量，不能用于变量
let s = 'JavaScript';
setLang(s as const); // 报错
let s1 = 'JavaScript';
let s2 = s1 as const; // 报错


// 也不能用于表达式。
let s = ('Java' + 'Script') as const; // 报错、


// 后置形式
expr as const
// 前置形式
<const>expr


const v1 = {
  x: 1,
  y: 2,
}; // 类型是 { x: number; y: number; }

const v2 = {
  x: 1 as const,
  y: 2,
}; // 类型是 { x: 1; y: number; }

const v3 = {
  x: 1,
  y: 2,
} as const; // 类型是 { readonly x: 1; readonly y: 2; }


// a1 的类型推断为 number[]
const a1 = [1, 2, 3];
// a2 的类型推断为 readonly [1, 2, 3]
const a2 = [1, 2, 3] as const;
// 用展开的形式传入函数很合适
function add(x:number, y:number) {
  return x + y;
}

const nums = [1, 2];
const total = add(...nums); // 报错

const nums = [1, 2] as const;
const total = add(...nums); // 正确


enum Foo {
  X,
  Y,
}

let e1 = Foo.X;            // Foo
e1 = Foo.Y
let e2 = Foo.X as const;   // Foo.X
e2 = Foo.Y //报错

```

## 非空断言

* TypeScript 提供了非空断言，保证这些变量不会为空，写法是在变量名后面加上感叹号!
* 也可以在返回值的函数后面用！
* 非空断言会造成安全隐患，只有在确定一个表达式的值不为空时才能使用
* TypeScript 有一个编译设置，要求类的属性必须初始化（即有初始值），如果不对属性赋值就会报错。这时就可以使用非空断言，表示这两个属性肯定会有值，这样就不会报错了。
* 非空断言只有在打开编译选项strictNullChecks时才有意义。如果不打开这个选项，编译器就不会检查某个变量是否可能为undefined或null。

```TypeScript

function f(x?:number|null) {
  validateNumber(x); // 自定义函数，确保 x 是数值
  console.log(x!.toFixed());
}

function validateNumber(e?:number|null) {
  if (typeof e !== 'number')
    throw new Error('Not a number');
}


const root = document.getElementById('root');

// 报错
root.addEventListener('click', e => {
  /* ... */
});

const root = document.getElementById('root')!; //正确


// 非空断言会造成安全隐患，只有在确定一个表达式的值不为空时才能使用。比较保险的做法还是手动检查一下是否为空。
const root = document.getElementById('root');
if (root === null) {
  throw new Error('Unable to find DOM element #root');
}
root.addEventListener('click', e => {
  /* ... */
});


// 初始化类的属性
class Point {
  x:number; // 报错
  y:number; // 报错

  constructor(x:number, y:number) {
    // ...
  }
}

class Point {
  x!:number; // 正确
  y!:number; // 正确

  constructor(x:number, y:number) {
    // ...
  }
}
```
## 断言函数

* 新写法 函数返回值类型写成asserts value is T
* 断言函数的asserts语句等同于void类型，所以如果返回除了undefined和null以外的值，都会报错。
* 如果要断言参数非空，可以使用工具类型NonNullable<T>
* 断言函数与类型保护函数（type guard）是两种不同的函数。它们的区别是，断言函数不返回值，而类型保护函数总是返回一个布尔值。
* 如果要断言某个参数保证为真（即不等于false、undefined和null），TypeScript 提供了断言函数的一种简写形式。

```Typescript

function isString(value:unknown):asserts value is string {
  if (typeof value !== 'string')
    throw new Error('Not a string');
}


// 真正的检查是需要开发者自己部署的。而且，如果内部的检查与断言不一致，TypeScript 也不会报错。
function isString(value:unknown):asserts value is string {
  if (typeof value !== 'number')
    throw new Error('Not a number');
}


// 不能返回非void类型
function isString(value:unknown):asserts value is string {
  if (typeof value !== 'string')
    throw new Error('Not a string');
  return true; // 报错
}


// 工具类型
function assertIsDefined<T>(
  value:T
):asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`${value} is not defined`)
  }
}


// 写法一
const assertIsNumber = (
  value:unknown
):asserts value is number => {
  if (typeof value !== 'number')
    throw Error('Not a number');
};

// 写法二
type AssertIsNumber =
  (value:unknown) => asserts value is number;

const assertIsNumber:AssertIsNumber = (value) => {
  if (typeof value !== 'number')
    throw Error('Not a number');
};


// 类型保护函数
function isString(
  value:unknown
):value is string {
  return typeof value === 'string';
}


// 断言某个参数保证为真（即不等于false、undefined和null）简写方式
function assert(x:unknown):asserts x {
  if (!x) {
    throw new Error(`${x} should be a truthy value.`);
  }
}


// 断言函数的简写形式，通常用来检查某个操作是否成功
type Person = {
  name: string;
  email?: string;
};

function loadPerson(): Person | null {
  return null;
}

let person = loadPerson();

function assert(
  condition: unknown,
  message: string
):asserts condition {
  if (!condition) throw new Error(message);
}

// Error: Person is not defined
assert(person, 'Person is not defined');
console.log(person.name);
```
