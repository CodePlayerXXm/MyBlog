---
sidebar: auto
tag:
  - 技术
  - TypeScript
features:
  - title: TypeScript 基础类型、变量声明
    details: TypeScript 简化官网的中文文档
---

# 基础类型

## 布尔、数字、字符串

```typescript
//布尔
let isDone: boolean = false;
//数字
let decLiteral: number = 6;
let hexLiteral: number = 0xf00d;
let binaryLiteral: number = 0b1010;
let octalLiteral: number = 0o744;
//字符串
let name: string = "bob";
```

## 数组

```typescript
//第一种写法
let list: number[] = [1, 2, 3]; //数字
//第二种写法
let list: Array<number> = [1, 2, 3];
```

## 元组

元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同。 比如，你可以定义一对值分别为 string 和 number 类型的元组。

````typescript
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ["hello", 10]; // OK
// Initialize it incorrectly
x = [10, "hello"]; // Error```

console.log(x[0].substr(1)); // OK
console.log(x[1].substr(1)); // Error, 'number' does not have 'substr'

x[3] = "world"; // OK, 字符串可以赋值给(string | number)类型
console.log(x[5].toString()); // OK, 'string' 和 'number' 都有 toString
x[6] = true; // Error, 布尔不是(string | number)类型
````

## 枚举

enum 类型是对 JavaScript 标准数据类型的一个补充。 像 C#等其它语言一样，使用枚举类型可以为一组数值赋予友好的名字。

```typescript
enum Color {
  Red,
  Green,
  Blue,
}
let c: Color = Color.Green;
// 下表从1开始
enum Color {
  Red = 1,
  Green,
  Blue,
}
let c: Color = Color.Green; //2
// 全部手动赋值
enum Color {
  Red = 1,
  Green = 2,
  Blue = 4,
}
let c: Color = Color.Blue; //4
// 反向映射
enum Color {
  Red = 1,
  Green,
  Blue,
}
let colorName: string = Color[2];
console.log(colorName); // 显示'Green'因为上面代码里它的值是2
```

## Any

有时候，我们会想要为那些在编程阶段还不清楚类型的变量指定一个类型。 这些值可能来自于动态的内容，比如来自用户输入或第三方代码库。 这种情况下，我们不希望类型检查器对这些值进行检查而是直接让它们通过编译阶段的检查。 那么我们可以使用 any 类型来标记这些变量：

```typescript
let notSure: any = 4;
notSure = "maybe a string instead";
notSure = false; // okay, definitely a boolean

let prettySure: Object = 4;
prettySure.toFixed(); // Error: Property 'toFixed' doesn't exist on type 'Object'.

let list: any[] = [1, true, "free"];
list[1] = 100;
```

在对现有代码进行改写的时候，any 类型是十分有用的，它允许你在编译时可选择地包含或移除类型检查。 你可能认为 Object 有相似的作用，就像它在其它语言中那样。 但是 Object 类型的变量只是允许你给它赋任意值 - 但是却不能够在它上面调用任意的方法，即便它真的有这些方法：

````typescript
let notSure: any = 4;
notSure.ifItExists(); // okay, ifItExists might exist at runtime
notSure.toFixed(); // okay, toFixed exists (but the compiler doesn't check)

let prettySure: Object = 4;
prettySure.toFixed(); // Error: Property 'toFixed' doesn't exist on type 'Object'.```
````

当你只知道一部分数据的类型时，any 类型也是有用的。 比如，你有一个数组，它包含了不同的类型的数据：

```typescript
let list: any[] = [1, true, "free"];

list[1] = 100;
```

## Void

某种程度上来说，void 类型像是与 any 类型相反，它表示没有任何类型。 当一个函数没有返回值时，你通常会见到其返回值类型是 void

```typescript
function warnUser(): void {
  console.log("This is my warning message");
}
```

声明一个 void 类型的变量没有什么大用，因为你只能为它赋予 undefined 和 null：

```typescript
let unusable: void = undefined;
```

## Null 和 Undefined

TypeScript 里，undefined 和 null 两者各自有自己的类型分别叫做 undefined 和 null。 和 void 相似，它们的本身的类型用处不是很大：

```typescript
// Not much else we can assign to these variables!
let u: undefined = undefined;
let n: null = null;
```

然而，当你指定了--strictNullChecks 标记，null 和 undefined 只能赋值给 void 和它们各自。 这能避免 很多常见的问题。 也许在某处你想传入一个 string 或 null 或 undefined，你可以使用联合类型 string | null | undefined。 再次说明，稍后我们会介绍联合类型。

## Never

never 类型表示的是那些永不存在的值的类型。 例如， never 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型； 变量也可能是 never 类型，当它们被永不为真的类型保护所约束时。

never 类型是任何类型的子类型，也可以赋值给任何类型；然而，没有类型是 never 的子类型或可以赋值给 never 类型（除了 never 本身之外）。 即使 any 也不可以赋值给 never。

下面是一些返回 never 类型的函数：

```typescript
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
  throw new Error(message);
}

// 推断的返回值类型为never
function fail() {
  return error("Something failed");
}

// 返回never的函数必须存在无法达到的终点
function infiniteLoop(): never {
  while (true) {}
}
```

## Object

object 表示非原始类型，也就是除 number，string，boolean，symbol，null 或 undefined 之外的类型。

使用 object 类型，就可以更好的表示像 Object.create 这样的 API。例如：

```typescript
declare function create(o: object | null): void;

create({ prop: 0 }); // OK
create(null); // OK

create(42); // Error
create("string"); // Error
create(false); // Error
create(undefined); // Error
```

\*\* 感觉这个例子并没有什么卵用

## 类型断言

有时候你会遇到这样的情况，你会比 TypeScript 更了解某个值的详细信息。 通常这会发生在你清楚地知道一个实体具有比它现有类型更确切的类型。

通过类型断言这种方式可以告诉编译器，“相信我，我知道自己在干什么”。 类型断言好比其它语言里的类型转换，但是不进行特殊的数据检查和解构。 它没有运行时的影响，只是在编译阶段起作用。 TypeScript 会假设你，程序员，已经进行了必须的检查。

类型断言有两种形式。

```typescript
// 其一是“尖括号”语法：
let someValue: any = "this is a string";

let strLength: number = (<string>someValue).length;

// as语法：
let someValue: any = "this is a string";

let strLength: number = (someValue as string).length;
```

两种形式是等价的。 至于使用哪个大多数情况下是凭个人喜好；然而，当你在 TypeScript 里使用 JSX 时，只有 as 语法断言是被允许的。

# 变量声明

官网中文文档，大部分讲的都是 es6 的东西，ts 的不同之处主要如下：

## 解构

### 解构数组

```typescript
//第一个方括号是解构，第二个是类型
function f([first, second]: [number, number]) {
  console.log(first);
  console.log(second);
}
f(input);
```

### 解构对象

```typescript
// 重命名属性
let { a: newName1, b: newName2 } = o;
// 指定类型
let { a, b }: { a: string; b: number } = o;
// 设置属性b的默认值
function keepWholeObject(wholeObject: { a: string; b?: number }) {
  let { a, b = 1001 } = wholeObject;
}
```

## 函数的声明

```typescript
type C = { a: string; b?: number };
function f({ a, b }: C): void {
  // ...
}
//带默认值
function f({ a = "", b = 0 } = {}): void {
  // ...

  console.log(a); //""
  console.log(b); //0
}
f();
//规定必须带有哪些属性且规定默认值
function f({ a, b = 0 } = { a: "" }): void {
  // ...
}
f({ a: "yes" }); // ok, default b = 0
f(); // ok, default to {a: ""}, which then defaults b = 0
f({}); // error, 'a' is required if you supply an argument
```

## 展开符...

对象展开还有其它一些意想不到的限制。 首先，它仅包含对象 自身的可枚举属性。 大体上是说当你展开一个对象实例时，你会丢失其方法：

```typescript
class C {
  p = 12;
  m() {}
}
let c = new C();
let clone = { ...c };
clone.p; // ok
clone.m(); // error!
```

其次，TypeScript 编译器不允许展开泛型函数上的类型参数。 这个特性会在 TypeScript 的未来版本中考虑实现。
