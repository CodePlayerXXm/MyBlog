---
title: TypeScript 的Enum
group: TypeScript
layout: doc
date: 2024-01-02T02:42:48.422Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的Enum
---

## 简介

* 调用 Enum 的某个成员，与调用对象属性的写法一样，可以使用点运算符，也可以使用方括号运算符。
* Enum 结构本身也是一种类型。
* Enum 结构的特别之处在于，它既是一种类型，也是一个值。编译后会变成 JavaScript 对象，留在代码中。
* Enum 结构比较适合的场景是，成员的值不重要，名字更重要，从而增加代码的可读性和可维护性。
* TypeScript 5.0 之前，Enum 有一个 Bug，就是 Enum 类型的变量可以赋值为任何数值。
* Enum 结构编译后是一个对象，所以不能有与它同名的变量（包括对象、函数、类等）。
* Enum 结构可以被对象的as const断言替代。

```TypeScript

let c = Color.Green; // 1
// 等同于
let c = Color['Green']; // 1


let c:Color = Color.Green; // 正确
let c:number = Color.Green; // 正确


// 编译前
enum Color {
  Red,     // 0
  Green,   // 1
  Blue     // 2
}
// 编译后
let Color = {
  Red: 0,
  Green: 1,
  Blue: 2
};


enum Operator {
  ADD,
  DIV,
  MUL,
  SUB
}
function compute(
  op:Operator,
  a:number,
  b:number
) {
  switch (op) {
    case Operator.ADD:
      return a + b;
    case Operator.DIV:
      return a / b;
    case Operator.MUL:
      return a * b;
    case Operator.SUB:
      return a - b;
    default:
      throw new Error('wrong operator');
  }
}
compute(Operator.ADD, 1, 3) // 4


enum Bool {
  No,
  Yes
}
function foo(noYes:Bool) {
  // ...
}
foo(33);  // TypeScript 5.0 之前不报错


enum Color {
  Red,
  Green,
  Blue
}
const Color = 'red'; // 报错


enum Foo {
  A,
  B,
  C,
}
const Bar = {
  A: 0,
  B: 1,
  C: 2,
} as const;
if (x === Foo.A) {}
// 等同于
if (x === Bar.A) {}
```
## Enum 成员的值

* Enum 成员默认不必赋值，系统会从零开始逐一递增，也可以为 Enum 成员显式赋值。
* 成员的值可以是任意数值，但不能是大整数（Bigint）。
* 成员的值甚至可以相同。
* 如果只设定第一个成员的值，后面成员的值就会从这个值开始递增。
* Enum 成员的值也可以使用计算式。
* Enum 成员值都是只读的，不能重新赋值。
* 通常会在 enum 关键字前面加上const修饰，表示这是常量，不能再次赋值。
* 加上const还有一个好处，就是编译为 JavaScript 代码后，代码中 Enum 成员会被替换成对应的值，这样能提高性能表现。
* 如果希望加上const关键词后，运行时还能访问 Enum 结构（即编译后依然将 Enum 转成对象），需要在编译时打开preserveConstEnums编译选项。

```TypeScript

enum Color {
  Red,
  Green,
  Blue
}

// 等同于
enum Color {
  Red = 0,
  Green = 1,
  Blue = 2
}


enum Color {
  Red = 90,
  Green = 0.5,
  Blue = 7n // 报错
}


enum Color {
  Red = 0,
  Green = 0,
  Blue = 0
}


enum Color {
  Red = 7,
  Green,  // 8
  Blue   // 9
}

// 或者
enum Color {
  Red, // 0
  Green = 7,
  Blue // 8
}


enum Permission {
  UserRead     = 1 << 8,
  UserWrite    = 1 << 7,
  UserExecute  = 1 << 6,
  GroupRead    = 1 << 5,
  GroupWrite   = 1 << 4,
  GroupExecute = 1 << 3,
  AllRead      = 1 << 2,
  AllWrite     = 1 << 1,
  AllExecute   = 1 << 0,
}

enum Bool {
  No = 123,
  Yes = Math.random(),
}


enum Color {
  Red,
  Green,
  Blue
}

Color.Red = 4; // 报错


const enum Color {
  Red,
  Green,
  Blue
}

const enum Color {
  Red,
  Green,
  Blue
}

const x = Color.Red;
const y = Color.Green;
const z = Color.Blue;

// 编译后
const x = 0 /* Color.Red */;
const y = 1 /* Color.Green */;
const z = 2 /* Color.Blue */;
```
## 同名 Enum 的合并

* 多个同名的 Enum 结构会自动合并。
* Enum 结构合并时，只允许其中一个的首成员省略初始值，否则报错。
* 同名 Enum 合并时，不能有同名成员，否则报错。
* 同名 Enum 合并的另一个限制是，所有定义必须同为 const 枚举或者非 const 枚举，不允许混合使用。

```TypeScript

enum Foo {
  A,
}

enum Foo {
  B = 1,
}

enum Foo {
  C = 2,
}

// 等同于
enum Foo {
  A,
  B = 1，
  C = 2
}


enum Foo {
  A,
}

enum Foo {
  B, // 报错
}


enum Foo {
  A,
  B
}

enum Foo {
  B = 1, // 报错
  C
}


// 正确
enum E {
  A,
}
enum E {
  B = 1,
}

// 正确
const enum E {
  A,
}
const enum E {
  B = 1,
}

// 报错
enum E {
  A,
}
const enum E {
  B = 1,
}
```
## 字符串 Enum

* 字符串枚举的所有成员值，都必须显式设置。如果没有设置，成员值默认为数值，且位置必须在字符串成员之前。
* 成员可以是字符串和数值混合赋值。Enum 成员不允许使用其他值
* 变量类型如果是字符串 Enum，就不能再赋值为字符串，这跟数值 Enum 不一样。
* 如果函数的参数类型是字符串 Enum，传参时就不能直接传入字符串，而要传入 Enum 成员。
* 字符串 Enum 可以使用联合类型（union）代替。
* 字符串 Enum 的成员值，不能使用表达式赋值。

```TypeScript

enum Foo {
  A, // 0
  B = 'hello',
  C // 报错
}


enum Enum {
  One = 'One',
  Two = 'Two',
  Three = 3,
  Four = 4,
}


enum MyEnum {
  One = 'One',
  Two = 'Two',
}

let s = MyEnum.One;
s = 'One'; // 报错


enum MyEnum {
  One = 'One',
  Two = 'Two',
}

function f(arg:MyEnum) {
  return 'arg is ' + arg;
}

f('One') // 报错


const enum MediaTypes {
  JSON = 'application/json',
  XML = 'application/xml',
}

const url = 'localhost';

fetch(url, {
  headers: {
    Accept: MediaTypes.JSON,
  },
}).then(response => {
  // ...
});


function move(
  where:'Up'|'Down'|'Left'|'Right'
) {
  // ...
 }


enum MyEnum {
  A = 'one',
  B = ['T', 'w', 'o'].join('') // 报错
}
```

## keyof 运算符

* keyof 运算符可以取出 Enum 结构的所有成员名，作为联合类型返回。
* 这里的typeof是必需的，否则keyof MyEnum相当于keyof string。
* 如果要返回 Enum 所有的成员值，可以使用in运算符。

```TypeScript
enum MyEnum {
  A = 'a',
  B = 'b'
}

// 'A'|'B'
type Foo = keyof typeof MyEnum;

// number | typeof Symbol.iterator | "toString" | "charAt" | "charCodeAt" | ...
type Foo = keyof MyEnum;


enum MyEnum {
  A = 'a',
  B = 'b'
}

// { a: any, b: any }
type Foo = { [key in MyEnum]: any };
```

## 反向映射

* 数值 Enum 存在反向映射，即可以通过成员值获得成员名。
* 字符串 Enum 不存在反向映射，编译后只有一组赋值。

```TypeScript
enum Weekdays {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday
}
console.log(Weekdays[3]) // Wednesday


// 编译后
var Weekdays;
(function (Weekdays) {
    Weekdays[Weekdays["Monday"] = 1] = "Monday";
    Weekdays[Weekdays["Tuesday"] = 2] = "Tuesday";
    Weekdays[Weekdays["Wednesday"] = 3] = "Wednesday";
    Weekdays[Weekdays["Thursday"] = 4] = "Thursday";
    Weekdays[Weekdays["Friday"] = 5] = "Friday";
    Weekdays[Weekdays["Saturday"] = 6] = "Saturday";
    Weekdays[Weekdays["Sunday"] = 7] = "Sunday";
})(Weekdays || (Weekdays = {}));

// 其中一项
Weekdays[
  Weekdays["Monday"] = 1
] = "Monday";

// 相当于
Weekdays["Monday"] = 1;
Weekdays[1] = "Monday";


enum MyEnum {
  A = 'a',
  B = 'b'
}

// 编译后
var MyEnum;
(function (MyEnum) {
    MyEnum["A"] = "a";
    MyEnum["B"] = "b";
})(MyEnum || (MyEnum = {}));
```
