---
title: TypeScript 的泛型
group: TypeScript
layout: doc
date: 2023-12-22T06:35:53.938Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的泛型
---


## 泛型的写法

泛型主要用在四个场合：函数、接口、类和别名。

### 函数泛型

* function关键字定义的泛型函数，类型参数放在尖括号中，写在函数名后面。
* 变量形式定义的函数

```TypeScript

function id<T>(arg:T):T {
  return arg;
}


// 写法一
let myId:<T>(arg:T) => T = id;

// 写法二
let myId:{ <T>(arg:T): T } = id;

```

### 接口泛型

* 类型参数定义在整个接口，类型参数定义在整个接口，接口内部的所有属性和方法都可以使用该类型参数。
* 类型参数定义在某个方法之中，其他属性和方法不能使用该类型参数

```TypeScript

interface Box<Type> {
  contents: Type;
}

let box:Box<string>;

// 类型定义在整个接口
interface Comparator<T> {
  compareTo(value:T): number;
}

class Rectangle implements Comparator<Rectangle> {

  compareTo(value:Rectangle): number {
    // ...
  }
}

// 类型定义在方法上
interface Fn {
  <Type>(arg:Type): Type;
}

function id<Type>(arg:Type): Type {
  return arg;
}

let myId:Fn = id;

```
### 类的泛型写法

* 继承的泛型类，类型参数放在尖括号中，写在类名后面。
* 泛型也可以用在类表达式。
* JavaScript 的类本质上是一个构造函数，因此也可以把泛型类写成构造函数。
* 泛型类描述的是类的实例，不包括静态属性和静态方法

```TypeScript

class A<T> {
  value: T;
}

class B extends A<any> {
}

// 类表达式写法
const Container = class<T> {
  constructor(private readonly data:T) {}
};

const a = new Container<boolean>(true);
const b = new Container<number>(0);

// 属性和方法后面的感叹号是非空断言，告诉 TypeScript 它们都是非空的，后面会赋值。
class C<NumType> {
  value!: NumType;
  add!: (x: NumType, y: NumType) => NumType;
}

let foo = new C<number>();

foo.value = 0;
foo.add = function (x, y) {
  return x + y;
};

// 构造函数写法
// 定义一个类
class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

// 定义一个类型别名，表示Person类的构造函数
type MyClass<T> = new (...args: any[]) => T;

// 定义createInstance函数
function createInstance<T>(
  AnyClass: MyClass<T>,
  ...args: any[]
): T {
  return new AnyClass(...args);
}

// 使用createInstance函数创建一个Person实例
const person1 = createInstance(Person, "张三", 25);
console.log(person1); // 输出：Person { name: '张三', age: 25 }

const person2 = createInstance(Person, "李四", 30);
console.log(person2); // 输出：Person { name: '李四', age: 30 }

// 静态属性跟方法不能引用泛型
class C<T> {
  static data: T;  // 报错
  constructor(public value:T) {}
}

```

### 类型别名的泛型写法

```TypeScript

type Nullable<T> = T | undefined | null;


type Tree<T> = {
  value: T;
  left: Tree<T> | null;
  right: Tree<T> | null;
};

```

## 类型参数的默认值

* 一旦类型参数有默认值，就表示它是可选参数。如果有多个类型参数，可选参数必须在必选参数之后。

```TypeScript

<T = boolean, U> // 错误

<T, U = boolean> // 正确

```

## 数组的泛型

* 数组类型的另一种写法number[]、string[]，只是Array&lt;number&gt;、Array&lt;string&gt;的简写形式。
* 其他的TypeScript 内部数据结构，比如Map、Set和Promise，其实也是泛型接口，完整的写法是Map&lt;K, V&gt;、Set&lt;T&gt;和Promise&lt;T&gt;。 TypeScript 默认还提供一个ReadonlyArray&lt;T&gt;接口，表示只读数组。

```TypeScript

function doStuff(
  values:ReadonlyArray<string>
) {
  values.push('hello!');  // 报错
}

```

## 类型参数的约束条件

* 通过参数extends来约束参数
* 类型参数可以同时设置约束条件和默认值，前提是默认值必须满足约束条件。
* 如果有多个类型参数，一个类型参数的约束条件，可以引用其他参数。但是，约束条件不能引用类型参数自身。

```TypeScript
// 类型参数 Type 有一个隐藏的约束条件：它必须存在length属性。如果不满足这个条件，就会报错。
function comp<Type>(a:Type, b:Type) {
  if (a.length >= b.length) {
    return a;
  }
  return b;
}

// T extends { length: number }就是约束条件
function comp<T extends { length: number }>(
  a: T,
  b: T
) {
  if (a.length >= b.length) {
    return a;
  }
  return b;
}

// 同时设置约束条件和默认值
type Fn<A extends string, B extends string = 'world'>
  =  [A, B];

type Result = Fn<'hello'> // ["hello", "world"]


// 约束条件不能引用类型参数自身。
<T, U extends T>
// 或者
<T extends U, U>

<T extends T>               // 报错
<T extends U, U extends T>  // 报错

```

## 泛型使用注意点

* 少用泛型
* 参数越少越好
* 类型参数需要出现两次。也就是说，只有当类型参数用到两次或两次以上，才是泛型的适用场合。
* 泛型可以嵌套。

```TypeScript

// 可以省略参数 Fn
function filter<T, Fn extends (arg: T) => boolean>(arr: T[], func: Fn): T[] {
  return arr.filter(func);
}


function filter<T>( arr: T[],func: (arg: T) => boolean): T[] {
  return arr.filter(func);
}

// 类型参数没有出现两次，可以不用泛型
function greet<Str extends string>(s:Str) {
  console.log('Hello, ' + s);
}

function greet(s:string) {
  console.log('Hello, ' + s);
}


type OrNull<Type> = Type|null;

type OneOrMany<Type> = Type|Type[];

type OneOrManyOrNull<Type> = OrNull<OneOrMany<Type>>; // Type | Type[] | null

```
