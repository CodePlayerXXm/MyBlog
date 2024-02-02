---
title: TypeScript 类型工具
group: TypeScript
layout: doc
date: 2024-01-18T06:56:00.460Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 类型工具
---

## Awaited&lt;T&gt;

* Awaited&lt;T&gt;用来取出 Promise 的返回值类型，适合用在描述then()方法和 await 命令的参数类型。
* 也可以返回多重 Promise 的返回值类型
* 如果它的类型参数不是 Promise 类型，那么就会原样返回。

```TypeScript

// string
type A = Awaited<Promise<string>>;


// 多重Promise
// number
type B = Awaited<Promise<Promise<number>>>;


// 如果不是 Promise 类型，那么就原样返回
// number | boolean
type C = Awaited<boolean | Promise<number>>;

```
## ConstructorParameters&lt;T&gt;

ConstructorParameters&lt;Type&gt;提取构造方法Type的参数类型，组成一个元组类型返回。

* 如果参数类型不是构造方法，就会报错。
* any类型和never类型是两个特殊值，分别返回unknown[]和never。

```TypeScript

type T1 = ConstructorParameters<
  new (x: string, y: number) => object
>; // [x: string, y: number]

type T2 = ConstructorParameters<
  new (x?: string) => object
>; // [x?: string | undefined]


type T1 = ConstructorParameters<
  ErrorConstructor
>; // [message?: string]

type T2 = ConstructorParameters<
  FunctionConstructor
>; // string[]

type T3 = ConstructorParameters<
  RegExpConstructor
>; // [pattern:string|RegExp, flags?:string]


type T1 = ConstructorParameters<string>; // 报错
type T2 = ConstructorParameters<Function>; // 报错


type T1 = ConstructorParameters<any>;  // unknown[]
type T2 = ConstructorParameters<never>; // never


type ConstructorParameters<
  T extends abstract new (...args: any) => any
> = T extends abstract new (...args: infer P)
  => any ? P : never
```

## Exclude&lt;UnionType, ExcludedMembers&gt;

Exclude&lt;UnionType, ExcludedMembers&gt;用来从联合类型UnionType里面，删除某些类型ExcludedMembers，组成一个新的类型返回。

```TypeScript

type T1 = Exclude<'a'|'b'|'c', 'a'>; // 'b'|'c'
type T2 = Exclude<'a'|'b'|'c', 'a'|'b'>; // 'c'
type T3 = Exclude<string|(() => void), Function>; // string
type T4 = Exclude<string | string[], any[]>; // string
type T5 = Exclude<(() => void) | null, Function>; // null
type T6 = Exclude<200 | 400, 200 | 201>; // 400
type T7 = Exclude<number, boolean>; // number

// 实现
type Exclude<T, U> = T extends U ? never : T;
```

extends 传入联合类型会展开，在T1相当于 'a' ,'b', 'c'都会走一遍 extends的判断，然后因为U传入的是'a'，所以当前面的遍历走到'a'时，extends判断返回的就是never,最后结果就是never| 'b' | 'c'，
又因为never是任何类型的子类型，所以在联合类型中会被消掉，从而达到了删除某些类型的效果。

## Extract&lt;UnionType, ExtractedMembers&gt;

Extract<UnionType, Union>用来从联合类型UnionType之中，提取指定类型Union，组成一个新类型返回。它与Exclude<T, U>正好相反。

```TypeScript

type T1 = Extract<'a'|'b'|'c', 'a'>; // 'a'
type T2 = Extract<'a'|'b'|'c', 'a'|'b'>; // 'a'|'b'
type T3 = Extract<'a'|'b'|'c', 'a'|'d'>; // 'a'
type T4 = Extract<string | string[], any[]>; // string[]
type T5 = Extract<(() => void) | null, Function>; // () => void
type T6 = Extract<200 | 400, 200 | 201>; // 200

```
* 如果参数类型Union不包含在联合类型UnionType之中，则返回never类型。

```TypeScript

type T = Extract<string|number, boolean>; // never

// 实现
type Extract<T, U> = T extends U ? T : never;

```

## InstanceType&lt;Type&gt;

InstanceType&lt;TType&gt;T提取构造函数的返回值的类型（即实例类型），参数Type是一个构造函数，等同于构造函数的ReturnType&lt;TType&gt;T。

```TypeScript

type A = InstanceType<ErrorConstructor>; // Error
type B = InstanceType<FunctionConstructor>; // Function
type C = InstanceType<RegExpConstructor>; // RegExp


// 由于 Class 作为类型，代表实例类型。要获取它的构造方法，必须把它当成值，然后用typeof运算符获取它的构造方法类型。
class C {
  x = 0;
  y = 0;
}

type T = InstanceType<typeof C>; // C


type T1 = InstanceType<string>; // 报错
type T2 = InstanceType<Function>; // 报错


type T1 = InstanceType<any>; // any
type T2 = InstanceType<never>; // never


// 实现
type InstanceType<
  T extends abstract new (...args:any) => any
> = T extends abstract new (...args: any) => infer R ? R :
  any;
```

## NonNullable&lt;Type&gt;

删除类型中的null和undefined，组成一个新的类型返回。

```TypeScript

// string|number
type T1 = NonNullable<string|number|undefined>;

// string[]
type T2 = NonNullable<string[]|null|undefined>;

type T3 = NonNullable<boolean>; // boolean
type T4 = NonNullable<number|null>; // number
type T5 = NonNullable<string|undefined>; // string
type T6 = NonNullable<null|undefined>; // never

```

T & {}等同于求T & Object的交叉类型。由于 TypeScript 的非空值都属于Object的子类型，所以会返回自身；而null和undefined不属于Object，会返回never类型。

```TypeScript

type NonNullable<T> = T & {}

```

## Omit&lt;Type, Keys&gt;

从类型中删除指定的key

```TypeScript

interface A {
  x: number;
  y: number;
}

type T1 = Omit<A, 'x'>;       // { y: number }
type T2 = Omit<A, 'y'>;       // { x: number }
type T3 = Omit<A, 'x' | 'y'>; // { }


// 键名Keys可以是对象类型Type中不存在的属性，但必须兼容string|number|symbol。
interface A {
  x: number;
  y: number;
}

type T = Omit<A, 'z'>; // { x: number; y: number }

type Omit<T, K extends keyof any>
  = Pick<T, Exclude<keyof T, K>>;

```

## OmitThisParameter&lt;Type&gt;

OmitThisParameter<Type>从函数类型中移除 this 参数。

```TypeScript

function toHex(this: Number) {
  return this.toString(16);
}

type T = OmitThisParameter<typeof toHex>; // () => string

```

如果函数没有 this 参数，则返回原始函数类型。

```TypeScript

type OmitThisParameter<T> =
  unknown extends ThisParameterType<T> ? T :
  T extends (...args: infer A) => infer R ?
  (...args: A) => R : T;

```
## Parameters&lt;Type&gt;

Parameters<Type>从函数类型Type里面提取参数类型，组成一个元组返回。

```TypeScript

type T1 = Parameters<() => string>; // []

type T2 = Parameters<(s:string) => void>; // [s:string]

type T3 = Parameters<<T>(arg: T) => T>;    // [arg: unknown]

type T4 = Parameters<
  (x:{ a: number; b: string }) => void
>; // [x: { a: number, b: string }]

type T5 = Parameters<
  (a:number, b:number) => number
>; // [a:number, b:number]


// 报错
type T1 = Parameters<string>;
// 报错
type T2 = Parameters<Function>;


type T1 = Parameters<any>; // unknown[]
type T2 = Parameters<never>; // never

```

Parameters<Type>主要用于从外部模块提供的函数类型中，获取参数类型。


```TypeScript

interface SecretName {
  first: string;
  last: string;
}

interface SecretSanta {
  name: SecretName;
  gift: string;
}

export function getGift(
  name: SecretName,
  gift: string
): SecretSanta {
 // ...
}

type ParaT = Parameters<typeof getGift>[0]; // SecretName

type ReturnT = ReturnType<typeof getGift>; // SecretSanta


// 实现
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P)
  => any ? P : never
```

## Partial&lt;Type&gt;

Partial<Type>返回一个新类型，将参数类型Type的所有属性变为可选属性。


```TypeScript

interface A {
  x: number;
  y: number;
}

type T = Partial<A>; // { x?: number; y?: number; }


// 实现
type Partial<T> = {
  [P in keyof T]?: T[P];
};

```
## Pick&lt;Type，Keys&gt;

```TypeScript

interface A {
  x: number;
  y: number;
}

type T1 = Pick<A, 'x'>; // { x: number }
type T2 = Pick<A, 'y'>; // { y: number }
type T3 = Pick<A, 'x'|'y'>;  // { x: number; y: number }


// 没有传入的key会报错
interface A {
  x: number;
  y: number;
}

type T = Pick<A, 'z'>; // 报错

// 实现
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

```

## Readonly&lt;Type&gt;

Readonly&lt;Type&gt;返回一个新类型，将参数类型Type的所有属性变为只读属性。

```TypeScript

interface A {
  x: number;
  y?: number;
}

// { readonly x: number; readonly y?: number; }
type T = Readonly<A>;


type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 全部属性变为可变
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
```

## Record&lt;Keys, Type&gt;

给一个对象的键，值指定类型

```TypeScript

// { a: number }
type T = Record<'a', number>;

// 都可是联合类型
// { a: number, b: number }
type T = Record<'a'|'b', number>;
// { a: number|string }
type T = Record<'a', number|string>;

type Record<K extends string|number|symbol, T>
  = { [P in K]: T; }
```

## Required&lt;Type&gt;

Required<Type>返回一个新类型，将参数类型Type的所有属性变为必选属性。它与Partial<Type>的作用正好相反。

```TypeScript

interface A {
  x?: number;
  y: number;
}

type T = Required<A>; // { x: number; y: number; }


type Required<T> = {
  [P in keyof T]-?: T[P];
};

```

## ReadonlyArray&lt;Type&gt;

ReadonlyArray<Type>用来生成一个只读数组类型，类型参数Type表示数组成员的类型。

```TypeScript

const values: ReadonlyArray<string>
  = ['a', 'b', 'c'];

values[0] = 'x'; // 报错
values.push('x'); // 报错
values.pop(); // 报错
values.splice(1, 1); // 报错


// 实现
interface ReadonlyArray<T> {
  readonly length: number;

  readonly [n: number]: T;

  // ...
}
```

## ReturnType&lt;Type&gt;

ReturnType<Type>提取函数类型Type的返回值类型，作为一个新类型返回。

```TypeScript

type T1 = ReturnType<() => string>; // string
type T2 = ReturnType<() => {
  a: string; b: number
}>; // { a: string; b: number }
type T3 = ReturnType<(s:string) => void>; // void
type T4 = ReturnType<() => () => any[]>; // () => any[]
type T5 = ReturnType<typeof Math.random>; // number
type T6 = ReturnType<typeof Array.isArray>; // boolean

```

如果参数类型是泛型函数，返回值取决于泛型类型。如果泛型不带有限制条件，就会返回unknown。


```TypeScript

type T1 = ReturnType<<T>() => T>; // unknown
type T2 = ReturnType<
  <T extends U, U extends number[]>() => T
>; // number[]

// 不是函数会报错
type T1 = ReturnType<boolean>; // 报错
type T2 = ReturnType<Function>; // 报错


type T1 = ReturnType<any>; // any
type T2 = ReturnType<never>; // never


// 实现
type ReturnType<
  T extends (...args: any) => any
> =
  T extends (...args: any) => infer R ? R : any;
```

## ThisParameterType&lt;Type&gt;

ThisParameterType<Type>提取函数类型中this参数的类型。

```TypeScript

function toHex(this:number) {
  return this.toString(16);
}

type T = ThisParameterType<typeof toHex>; // number


// 实现
type ThisParameterType<T> =
  T extends (
    this: infer U,
    ...args: never
  ) => any ? U : unknown;

```

## ThisType&lt;Type&gt;

ThisType&lt;Type&gt;不返回类型，只用来跟其他类型组成交叉类型，用来提示 TypeScript 其他类型里面的this的类型。

```TypeScript

interface HelperThisValue {
  logError: (error:string) => void;
}

let helperFunctions:
  { [name: string]: Function } &
  ThisType<HelperThisValue>
= {
  hello: function() {
    this.logError("Error: Something wrong!"); // 正确
    this.update(); // 报错
  }
}

```

注意，使用这个类型工具时，必须打开noImplicitThis设置。


```TypeScript

let obj: ThisType<{ x: number }> &
  { getX: () => number };

obj = {
  getX() {
    return this.x + this.y; // 报错  ThisType<{ x: number }> 中没有y属性
  },
};


// 实现
interface ThisType<T> { }
```

## Uppercase&lt;StringType&gt;

```TypeScript

type A = 'hello';

// "HELLO"
type B = Uppercase<A>;

```

## Lowercase&lt;StringType&gt;

```TypeScript

type A = 'HELLO';

// "hello"
type B = Lowercase<A>;

```
## Capitalize&lt;StringType&gt;

```TypeScript

type A = 'hello';

// "Hello"
type B = Capitalize<A>;

```
## Uncapitalize&lt;StringType&gt;

```TypeScript

type A = 'HELLO';

// "hELLO"
type B = Uncapitalize<A>;

```
