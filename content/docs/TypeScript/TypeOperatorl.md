---
title: TypeScript 类型运算符
group: TypeScript
layout: doc
date: 2024-01-18T06:56:00.460Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 类型运算符
---

## keyof 运算符

* keyof 是一个单目运算符，接受一个对象类型作为参数，返回该对象的所有键名组成的联合类型。
* 由于 JavaScript 对象的键名只有三种类型，所以对于任意对象的键名的联合类型就是string|number|symbol
* 对于没有定义键名的类型使用 keyof 运算符，返回never类型，表示不可能有这样类型的键名。
* keyof 返回的类型是string|number|symbol，如果只需要其中的一种类型，可以采用交叉类型的写法。
* 如果对象属性名采用索引形式，keyof 会返回属性名的索引类型。
* keyof T返回的类型是string|number，原因是 JavaScript 属性名为字符串时，包含了属性名为数值的情况，因为数值属性名会自动转为字符串。
* 如果 keyof 运算符用于数组或元组类型，keyof 会返回数组的所有键名，包括数字键名和继承的键名。
* 对于联合类型，keyof 返回成员共有的键名。
* 对于交叉类型，keyof 返回所有键名。
* keyof 取出的是键名组成的联合类型，如果想取出键值组成的联合类型，可以用[]索引

```TypeScript


interface T {
  0: boolean;
  a: string;
  b(): void;
}

type KeyT = keyof T; // 0 | 'a' | 'b'


// string | number | symbol
type KeyT = keyof any;

type KeyT = keyof object;  // never


type Capital<T extends string> = Capitalize<T>;

type MyKeys<Obj extends object> = Capital<keyof Obj>; // 报错

type MyKeys<Obj extends object> = Capital<string & keyof Obj>; // 通过


// 示例一
interface T {
  [prop: number]: number;
}

// number
type KeyT = keyof T;

// 示例二
interface T {
  [prop: string]: number;
}

// string|number number会先转成string
type KeyT = keyof T;

// 数组、元组
type Result = keyof ['a', 'b', 'c'];
// 返回 number | "0" | "1" | "2"
// | "length" | "pop" | "push" | ···



// 联合类型返回的是，共有建
type A = { a: string; z: boolean };
type B = { b: string; z: boolean };

// 返回 'z'
type KeyT = keyof (A | B);


// 交叉类型返回的是，所有建
type A = { a: string; x: boolean };
type B = { b: string; y: number };

// 返回 'a' | 'x' | 'b' | 'y'
type KeyT = keyof (A & B);

// 相当于
keyof (A & B) ≡ keyof A | keyof B


// 取键值的类型
type MyObj = {
  foo: number,
  bar: string,
};

type Keys = keyof MyObj;

type Values = MyObj[Keys]; // number|string
```

### keyof 运算符的用途

* 不用keyof 运算符的问题， 一是无法表示参数key与参数obj之间的关系，二是返回值类型只能写成any。
* 将一个类型的所有属性逐一映射成其他值。
  * 改变类型
  * 去除readonly修饰符
  * 改可选属性为必选属性


```TypeScript

// 如果没有keyof
function prop(
  obj: { [p:string]: any },
  key: string
):any {
  return obj[key];
}
// 更加精准
function prop<Obj, K extends keyof Obj>(
  obj:Obj, key:K
):Obj[K] {
  return obj[key];
}


// 改变类型
type NewProps<Obj> = {
  [Prop in keyof Obj]: boolean;
};

// 用法
type MyObj = { foo: number; };

// 等于 { foo: boolean; }
type NewObj = NewProps<MyObj>;


// 去除readonly修饰符
// -readonly表示去除这些属性的只读特性。
// 对应地，还有+readonly的写法，表示添加只读属性设置。
type Mutable<Obj> = {
  -readonly [Prop in keyof Obj]: Obj[Prop];
};

// 用法
type MyObj = {
  readonly foo: number;
}

// 等于 { foo: number; }
type NewObj = Mutable<MyObj>;


// 可选属性改为必选属性
// -?表示去除可选属性设置
// 对应地，还有+?的写法，表示添加可选属性设置。
type Concrete<Obj> = {
  [Prop in keyof Obj]-?: Obj[Prop];
};

// 用法
type MyObj = {
  foo?: number;
}

// 等于 { foo: number; }
type NewObj = Concrete<MyObj>;
```

## in 运算符

TypeScript 语言的类型运算中，in运算符有不同的用法，用来取出（遍历）联合类型的每一个成员类型。

```TypeScript

type U = 'a'|'b'|'c';

type Foo = {
  [Prop in U]: number;
};
// 等同于
type Foo = {
  a: number,
  b: number,
  c: number
};


```

## 方括号运算符

* 方括号运算符（[]）用于取出对象的键值类型，比如T[K]会返回对象T的属性K的类型
* 方括号的参数如果是联合类型，那么返回的也是联合类型。
* 如果访问不存在的属性，会报错。
* 方括号运算符的参数也可以是属性名的索引类型。
* 这个语法对于数组也适用，可以使用number作为方括号的参数。
* 方括号里面不能有值的运算。

```TypeScript

type Person = {
  age: number;
  name: string;
  alive: boolean;
};

// Age 的类型是 number
type Age = Person['age'];


type Person = {
  age: number;
  name: string;
  alive: boolean;
};

// number|string
type T = Person['age'|'name'];

// number|string|boolean
type A = Person[keyof Person];


type T = Person['notExisted']; // 报错


// 可以是索引类型
type Obj = {
  [key:string]: number,
};

// number
type T = Obj[string];


// MyArray 的类型是 { [key:number]: string }
const MyArray = ['a','b','c'];

// 等同于 (typeof MyArray)[number]
// 返回 string
type Person = typeof MyArray[number];


// 示例一
const key = 'age';
type Age = Person[key]; // 报错

// 示例二
type Age = Person['a' + 'g' + 'e']; // 报错
```

## extends...?: 条件运算符

* 条件运算符extends...?:可以根据当前类型是否符合某种条件，返回不同的类型
* 本质是检测前者是否是后者的子类型
* 如果需要判断的类型是一个联合类型，那么条件运算符会展开这个联合类型。
* 如果不希望联合类型被条件运算符展开，可以把extends两侧的操作数都放在方括号里面。
* 条件运算符还可以嵌套使用。

```TypeScript

T extends U ? X : Y


type T = 1 extends number ? true : false;


interface Animal {
  live(): void;
}
interface Dog extends Animal {
  woof(): void;
}

// number
type T1 = Dog extends Animal ? number : string;

// string
type T2 = RegExp extends Animal ? number : string;


(A|B) extends U ? X : Y

// 等同于

(A extends U ? X : Y) |
(B extends U ? X : Y)


// 示例一
type ToArray<Type> =
  Type extends any ? Type[] : never;

// string[]|number[]
type T = ToArray<string|number>;

// 示例二
type ToArray<Type> =
  [Type] extends [any] ? Type[] : never;

// (string | number)[]
type T = ToArray<string|number>;


type LiteralTypeName<T> =
  T extends undefined ? "undefined" :
  T extends null ? "null" :
  T extends boolean ? "boolean" :
  T extends number ? "number" :
  T extends bigint ? "bigint" :
  T extends string ? "string" :
  never;

// "bigint"
type Result1 = LiteralTypeName<123n>;

// "string" | "number" | "boolean"
type Result2 = LiteralTypeName<true | 1 | 'a'>;

```
## infer 关键字

* infer关键字用来定义泛型里面推断出来的类型参数，而不是外部传入的类型参数
* 通常跟条件运算符一起使用，用在extends关键字后面的父类型之中

```TypeScript

type Flatten<Type> =
  Type extends Array<infer Item> ? Item : Type;

// string
type Str = Flatten<string[]>;

// number
type Num = Flatten<number>;

// 如果不用infer，要多传入一个类型参数
type Flatten<Type, Item> =
  Type extends Array<Item> ? Item : Type;



// 如果类型T是个函数，则返回Promise版本，否则返回T
type ReturnPromise<T> =
  T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : T;



// 提取对象指定键值的类型
type MyType<T> =
  T extends {
    a: infer M,
    b: infer N
  } ? [M, N] : never;

// 用法示例
type T = MyType<{ a: string; b: number }>;
// [string, number]


// 通过字符串模板提取
type Str = 'foo-bar';

type Bar = Str extends `foo-${infer rest}` ? rest : never // 'bar'
```
## is运算符

* is运算符总是用于描述函数的返回值类型
* 写法采用parameterName is Type的形式，即左侧为当前函数的参数名，右侧为某一种类型。它返回一个布尔值，表示左侧参数是否属于右侧的类型。
* is运算符可以用于类型保护。
* is运算符还有一种特殊用法，就是用在类（class）的内部，描述类的方法的返回值。this is T这种写法，只能用来描述方法的返回值类型，而不能用来描述属性的类型。

```TypeScript

function isFish(
  pet: Fish|Bird
):pet is Fish {
  return (pet as Fish).swim !== undefined;
}

type A = { a: string };
type B = { b: string };

function isTypeA(x: A|B): x is A {
  if ('a' in x) return true;
  return false;
}


// 类型保护
function isCat(a:any): a is Cat {
  return a.name === 'kitty';
}

let x:Cat|Dog;

if (isCat(x)) {
  x.meow(); // 正确，因为 x 肯定是 Cat 类型
}


// 在类（class）的内部，描述类的方法的返回值
class Teacher {
  isStudent():this is Student {
    return false;
  }
}

class Student {
  isStudent():this is Student {
    return true;
  }
}
```

## 模板字符串

* 模板字符串可以引用的类型一共6种，分别是 string、number、bigint、boolean、null、undefined。引用这6种以外的类型会报错。
* 如果是一个联合类型，那么它返回的也是一个联合类型，即模板字符串可以展开联合类型。
* 如果模板字符串引用两个联合类型，它会交叉展开这两个类型。

```TypeScript

type World = "world";

// "hello world"
type Greeting = `hello ${World}`;



type Num = 123;
type Obj = { n : 123 };

type T1 = `${Num} received`; // 正确
type T2 = `${Obj} received`; // 报错


// 展开联合类型
type T = 'A'|'B';

// "A_id"|"B_id"
type U = `${T}_id`;


// 交叉展开联合类型
type T = 'A'|'B';

type U = '1'|'2';

// 'A1'|'A2'|'B1'|'B2'
type V = `${T}${U}`;

```
## satisfies 运算符

* satisfies运算符用来检测某个值是否符合指定类型

```TypeScript

// 可以检测出拼写错误
type Colors = "red" | "green" | "blue";
type RGB = [number, number, number];

const palette: Record<Colors, string|RGB> = {
  red: [255, 0, 0],
  green: "#00ff00",
  bleu: [0, 0, 255] // 报错
};

// 但是这么调用也会报错
const greenComponent = palette.green.substring(1, 6); // 报错


// 可以用 satisfies运算符来解决这个问题
type Colors = "red" | "green" | "blue";
type RGB = [number, number, number];

const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  bleu: [0, 0, 255] // 报错
} satisfies Record<Colors, string|RGB>;

const greenComponent = palette.green.substring(1); // 不报错


// satisfies也可以检测属性值
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: [0, 0] // 报错
} satisfies Record<Colors, string|RGB>;

```
