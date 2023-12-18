---
title: TypeScript 的对象类型
group: TypeScript
layout: doc
date: 2023-12-14T02:20:59.534Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的对象类型。
---

## 简介

* 对象声明的类型，对象赋值时，就不能缺少指定的属性，也不能有多余的属性。
* 不可删除属性，但是可以修改属性对应的值
* 对象类型可以使用方括号读取属性的类型。
* TypeScript 不区分对象自身的属性和继承的属性，一律视为对象的属性

```TypeScript

type User = {
  name: string,
  age: number
};
type Name = User['name']; // string


interface MyInterface {
  toString(): string; // 继承的属性
  prop: number; // 自身的属性
}

const obj:MyInterface = { // 正确
  prop: 123,
};

```
## 可选属性

* 可选属性等同于允许赋值为undefined，下面两种写法是等效的。
* TypeScript 提供编译设置ExactOptionalPropertyTypes，只要同时打开这个设置和strictNullChecks，可选属性就不能设为undefined。
* 可选属性，取值之前要判断一下是不是undefined。
* 可选属性与允许设为undefined的必选属性是不等价的。undefined的必须属性要显示的赋值undefined

```TypeScript

type User = {
  firstName: string;
  lastName?: string;
};

// 等同于
type User = {
  firstName: string;
  lastName?: string|undefined;
};

// 赋值undefined不会报错
const obj: {
  x: number;
  y?: number;
} = { x: 1, y: undefined };

// 判断可选属性是否是undefined
// 写法一
let firstName = (user.firstName === undefined)
  ? 'Foo' : user.firstName;
let lastName = (user.lastName === undefined)
  ? 'Bar' : user.lastName;

// 写法二
let firstName = user.firstName ?? 'Foo';
let lastName = user.lastName ?? 'Bar';

// 打开 ExactOptionsPropertyTypes 和 strictNullChecks
const obj: {
  x: number;
  y?: number;
} = { x: 1, y: undefined }; // 报错

//必须的undefined属性要显示的赋值undefined
type A = { x:number, y?:number };
type B = { x:number, y:number|undefined };

const ObjA:A = { x: 1 }; // 正确
const ObjB:B = { x: 1 }; // 报错 {x:1,y:undefined}}

```

## 只读属性

* 如果属性值是一个对象，readonly修饰符并不禁止修改该对象的属性，只是禁止完全替换掉该对象。
* 如果一个对象有两个引用，即两个变量对应同一个对象，其中一个变量是可写的，另一个变量是只读的，那么从可写变量修改属性，会影响到只读变量。
* 如果希望属性值是只读的，除了声明时加上readonly关键字，还有一种方法，就是在赋值时，在对象后面加上只读断言as const。

```TypeScript
// readonly 是对象
interface Home {
  readonly resident: {
    name: string;
    age: number
  };
}

const h:Home = {
  resident: {
    name: 'Vicky',
    age: 42
  }
};

h.resident.age = 32; // 正确
h.resident = {
  name: 'Kate',
  age: 23
} // 报错

// readonly 对象两个引用
interface Person {
  name: string;
  age: number;
}

interface ReadonlyPerson {
  readonly name: string;
  readonly age: number;
}

let w:Person = {
  name: 'Vicky',
  age: 42,
};

let r:ReadonlyPerson = w;

w.age += 1;
r.age // 43

// 初始化时 as const 不能修改对应属性的值
const myUser = {
  name: "Sabrina",
} as const;

myUser.name = "Cynthia"; // 报错

// 如果有类型且不是readonly，则as const不生效
const myUser:{ name: string } = {
  name: "Sabrina",
} as const;

myUser.name = "Cynthia"; // 正确
```
## 属性名的索引类型

* 对象可以同时有多种类型的属性名索引，比如同时有数值索引和字符串索引。但是，数值索引不能与字符串索引发生冲突，必须服从后者，这是因为在 JavaScript 语言内部，所有的数值属性名都会自动转为字符串属性名。
* 同样地，可以既声明属性名索引，也声明具体的单个属性名。如果单个属性名不符合属性名索引的范围，两者发生冲突，就会报错。
* 属性名的数值索引不宜用来声明数组，因为采用这种方式声明数组，就不能使用各种数组方法以及length属性，因为类型里面没有定义这些东西。

```TypeScript
type MyType = {
  [x: number]: boolean; // 报错
  [x: string]: string;
}

type MyType = {
  foo: boolean; // 报错
  [x: string]: string;
}

type MyArr = {
  [n:number]: number;
};

const arr:MyArr = [1, 2, 3];
arr.length // 报错

```
## 解构赋值

```TypeScript
const {id, name, price}:{
  id: string;
  name: string;
  price: number
} = product;
```
## 结构类型原则

 * 只要对象 B 满足 对象 A 的结构特征，TypeScript 就认为对象 B 兼容对象 A 的类型，这称为“结构类型”原则（structural typing）。
 * 根据“结构类型”原则，TypeScript 检查某个值是否符合指定类型时，并不是检查这个值的类型名（即“名义类型”），而是检查这个值的结构是否符合要求（即“结构类型”）。<br/>
TypeScript 之所以这样设计，是为了符合 JavaScript 的行为。JavaScript 并不关心对象是否严格相似，只要某个对象具有所要求的属性，就可以正确运行。<br/>
如果类型 B 可以赋值给类型 A，TypeScript 就认为 B 是 A 的子类型（subtyping），A 是 B 的父类型。子类型满足父类型的所有结构特征，同时还具有自己的特征。凡是可以使用父类型的地方，都可以使用子类型，即子类型兼容父类型。

```TypeScript

type A = {
  x: number;
};

type B = {
  x: number;
  y: number;
};

const B = {
  x: 1,
  y: 1
};

const A:A = B; // 正确

```

函数getSum()要求传入参数的类型是myObj，但是实际上所有与myObj兼容的对象都可以传入。这会导致const v = obj[n]这一行报错，原因是obj[n]取出的属性值不一定是数值（number），使得变量v的类型被推断为any。如果项目设置为不允许变量类型推断为any，代码就会报错

```TypeScript

type myObj = {
  x: number,
  y: number,
};

function getSum(obj:myObj) {
  let sum = 0;

  for (const n of Object.keys(obj)) {
    const v = obj[n]; // 报错
    sum += Math.abs(v);
  }

  return sum;
}

// 正确的写法
type MyObj = {
  x: number,
  y: number,
};

function getSum(obj:MyObj) {
  return Math.abs(obj.x) + Math.abs(obj.y);
}
```
## 严格字面量检查

 * 如果对象使用字面量表示，会触发 TypeScript 的严格字面量检查（strict object literal checking）。与结构类型相反
 * 可以用as Type规避这条规则
 * 如果允许字面量有多余属性，可以像下面这样在类型里面定义一个通用属性。
 * 字面量对象传入函数也会触发这条规则

```TypeScript

const point:{
  x:number;
  y:number;
} = {
  x: 1,
  y: 1,
  z: 1 // 报错
};

type Options = {
  title:string;
  darkMode?:boolean;
};

const obj:Options = {
  title: '我的网页',
  darkmode: true, // 报错
};

// as Type规避
const obj:Options = {
  title: '我的网页',
  darkmode: true,
} as Options;

// 通用属性
let x: {
  foo: number,
  [x: string]: any
};

x = { foo: 1, baz: 2 };  // Ok

// 函数参数
interface Point {
  x: number;
  y: number;
}

function computeDistance(point: Point) { /*...*/ }

computeDistance({ x: 1, y: 2, z: 3 }); // 报错
computeDistance({x: 1, y: 2}); // 正确

```
## 最小可选属性规则

* 根据“结构类型”原则，如果一个对象的所有属性都是可选的，那么其他对象跟它都是结构类似的。<br/>
  类型Options的所有属性都是可选的，所以它可以是一个空对象，也就意味着任意对象都满足Options的结构。
* 如果某个类型的所有属性都是可选的，那么该类型的对象必须至少存在一个可选属性，不能所有可选属性都不存在。这就叫做“最小可选属性规则”。

```TypeScript

type Options = {
  a?:number;
  b?:number;
  c?:number;
};

const opts = { d: 123 };

const obj:Options = opts; // 报错

```
报错原因是，如果某个类型的所有属性都是可选的，那么该类型的对象必须至少存在一个可选属性，不能所有可选属性都不存在。这就叫做“最小可选属性规则”。<br/>

如果想规避这条规则，要么在类型里面增加一条索引属性（[propName: string]: someType），要么使用类型断言（opts as Options）。

## 空对象

* 空对象是 TypeScript 的一种特殊值，也是一种特殊类型。修改其属性的值会报错
* 如果确实需要分步声明，一个比较好的方法是，使用扩展运算符（...）合成一个新对象。
* 空对象作为类型，其实是Object类型的简写形式。
* 各种类型的值（除了null和undefined）都可以赋值给空对象类型，跟Object类型的行为是一样的。
* 因为Object可以接受各种类型的值，而空对象是Object类型的简写，所以它不会有严格字面量检查，赋值时总是允许多余的属性，只是不能读取这些属性。

```TypeScript

const obj = {};
obj.prop = 123; // 报错

const pt0 = {};
const pt1 = { x: 3 };
const pt2 = { y: 4 };

const pt = {
  ...pt0, ...pt1, ...pt2
};


let d:{};
// 等同于
// let d:Object;

d = {};
d = { x: 1 };
d = 'hello';
d = 2;


interface Empty { }
const b:Empty = {myProp: 1, anotherProp: 2}; // 正确
b.myProp // 报错

// 如果想强制使用没有任何属性的对象，可以采用下面的写法。
interface WithoutProperties {
  [key: string]: never;
}

// 报错
const a:WithoutProperties = { prop: 1 };

```
