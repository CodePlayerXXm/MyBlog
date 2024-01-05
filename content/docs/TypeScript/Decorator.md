---
title: TypeScript 的装饰器
group: TypeScript
layout: doc
date: 2024-01-02T02:42:48.422Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的装饰器
---

## 简介

装饰器（Decorator）是一种语法结构，用来在定义时修改类（class）的行为。<br />
在语法上，装饰器有如下几个特征。

* 第一个字符（或者说前缀）是@，后面是一个表达式。

* @后面的表达式，必须是一个函数（或者执行后可以得到一个函数）。

* 这个函数接受所修饰对象的一些相关值作为参数。

* 这个函数要么不返回值，要么返回一个新对象取代所修饰的目标对象。

相比使用子类改变父类，装饰器更加简洁优雅，缺点是不那么直观，功能也受到一些限制。所以，装饰器一般只用来为类添加某种特定行为。<br/>
它们不仅增加了代码的可读性，清晰地表达了意图，而且提供一种方便的手段，增加或修改类的功能。

* @符号后面添加表达式都是可以的，@后面的表达式，最终执行后得到的应该是一个函数。

```TypeScript

// 都是合法的写法
@myFunc
@myFuncFactory(arg1, arg2)

@libraryModule.prop
@someObj.method(123)

@(wrap(dict['prop']))

```

## 装饰器的版本

TypeScript 从早期开始，就支持装饰器。但是，装饰器的语法后来发生了变化。ECMAScript 标准委员会最终通过的语法标准，与 TypeScript 早期使用的语法有很大差异。<br/>

目前，TypeScript 5.0 同时支持两种装饰器语法。标准语法可以直接使用，传统语法需要打开--experimentalDecorators编译参数。

```TypeScript

$ tsc --target ES5 --experimentalDecorators

```

## 装饰器的结构

```TypeScript

type Decorator = (
  value: DecoratedValue,
  <ClassMethodDecoratorContext>context: {
    kind: string;
    name: string | symbol;
    addInitializer?(initializer: () => void): void;
    static?: boolean;
    private?: boolean;
    access: {
      get?(): unknown;
      set?(value: unknown): void;
    };
  }
) => void | ReplacementValue;


```
* value：所装饰的对象
* context：上下文对象，TypeScript 提供一个原生接口
* ClassMethodDecoratorContext，描述这个对象。

ClassMethodDecoratorContext ,根据所装饰对象的不同而不同，其中只有两个属性（kind和name）是必有的，其他都是可选的。

* kind：字符串，表示所装饰对象的类型，可能取以下的值。这表示一共有六种类型的装饰器。
  * 'class'
  * 'method'
  * 'getter'
  * 'setter'
  * 'field'
  * 'accessor'
* name:字符串或者 Symbol 值，所装饰对象的名字，比如类名、属性名等。
* addInitializer()：函数，用来添加类的初始化逻辑。以前，这些逻辑通常放在构造函数里面，对方法进行初始化，现在改成以函数形式传入addInitializer()方法。注意，addInitializer()没有返回值。
* private：布尔值，表示所装饰的对象是否为类的私有成员。
* static：布尔值，表示所装饰的对象是否为类的静态成员。
* access：一个对象，包含了某个值的 get 和 set 方法。

## 类装饰器

类装饰器的类型描述如下。

```TypeScript

type ClassDecorator = (
  value: Function,
  context: {
    kind: 'class';
    name: string | undefined;
    addInitializer(initializer: () => void): void;
  }
) => Function | void;

```
类装饰器接受两个参数：value（当前类本身）和context（上下文对象）。其中，context对象的kind属性固定为字符串class。

```TypeScript

// 类装饰器@Greeter在类User的原型对象上，
// 添加了一个greet()方法，实例就可以直接使用该方法。
function Greeter(value, context) {
  if (context.kind === 'class') {
    value.prototype.greet = function () {
      console.log('你好');
    };
  }
}

@Greeter
class User {}

let u = new User();
u.greet(); // "你好"


// 类装饰器@countInstances返回一个函数，替换了类MyClass的构造方法。
// 新的构造方法实现了实例的计数，每新建一个实例，
// 计数器就会加一，并且对实例添加count属性，表示当前实例的编号。
function countInstances(value:any, context:any) {
  let instanceCount = 0;

  const wrapper = function (...args:any[]) {
    instanceCount++;
    const instance = new value(...args);
    instance.count = instanceCount;
    return instance;
  } as unknown as typeof MyClass;

  // 为了确保新构造方法继承定义在MyClass的原型之上的成员，特别加入。
  // 确保两者的原型对象是一致
  wrapper.prototype = value.prototype; // A
  return wrapper;
}

@countInstances
class MyClass {}

const inst1 = new MyClass();
inst1 instanceof MyClass // true
inst1.count // 1


// 类装饰器@functionCallable返回一个新的构造方法，里面判断new.target是否不为空，
// 如果是的，就表示通过new命令调用，从而报错。
function functionCallable(
  value:any, {kind}:any
):any {
  if (kind === 'class') {
    return function (...args:any) {
      // new.target指向被new调用的构造函数
      if (new.target !== undefined) {
        throw new TypeError('This function can’t be new-invoked');
      }
      return new value(...args);
    }
  }
}

@functionCallable
class Person {
  name:string;
  constructor(name:string) {
    this.name = name;
  }
}

// @ts-ignore
const robin = Person('Robin');
robin.name // 'Robin'


// 类装饰器的上下文对象context的addInitializer()方法，
// 用来定义一个类的初始化函数，在类完全定义结束后执行。
// 类MyComponent定义完成后，会自动执行类装饰器@customElement()给出的初始化函数，
// 该函数会将当前类注册为指定名称（本例为<hello-world>）的自定义 HTML 元素。
function customElement(name: string) {
  return <Input extends new (...args: any) => any>(
    value: Input,
    context: ClassDecoratorContext
  ) => {
    context.addInitializer(function () {
      customElements.define(name, value);
    });
  };
}

@customElement("hello-world")
class MyComponent extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = `<h1>Hello World</h1>`;
  }
}
```

## 方法装饰器

```TypeScript

type ClassMethodDecorator = (
  value: Function,
  context: {
    kind: 'method';
    name: string | symbol;
    static: boolean;
    private: boolean;
    access: { get: () => unknown };
    addInitializer(initializer: () => void): void;
  }
) => Function | void;

```
* static：布尔值，表示是否为静态方法。该属性为只读属性。
* private：布尔值，表示是否为私有方法。该属性为只读属性。
* access：对象，包含了方法的存取器，但是只有get()方法用来取值，没有set()方法进行赋值。
* 其他属性同类装饰器


