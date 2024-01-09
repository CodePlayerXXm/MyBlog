---
title: TypeScript 的装饰器
group: TypeScript
layout: doc
date: 2024-01-09T08:02:48.498Z
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

一些用法：

```TypeScript
function trace(decoratedMethod) {
  // ...
}

class C {
  @trace
  toString() {
    return 'C';
  }
}

// `@trace` 等同于
// C.prototype.toString = trace(C.prototype.toString);

```
* 如果方法装饰器返回一个新的函数，就会替代所装饰的原始函数。

```TypeScript

function replaceMethod() {
  return function () {
    return `How are you, ${this.name}?`;
  }
}

class Person {
  constructor(name) {
    this.name = name;
  }

  @replaceMethod
  hello() {
    return `Hi ${this.name}!`;
  }
}

const robin = new Person('Robin');

robin.hello() // 'How are you, Robin?'

```

* 在装饰的函数执行时，做一些其他的事情

```TypeScript
class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  @log
  greet() {
    console.log(`Hello, my name is ${this.name}.`);
  }
}

function log(originalMethod:any, context:ClassMethodDecoratorContext) {
  const methodName = String(context.name);

  function replacementMethod(this: any, ...args: any[]) {
    console.log(`LOG: Entering method '${methodName}'.`)
    const result = originalMethod.call(this, ...args);
    console.log(`LOG: Exiting method '${methodName}'.`)
    return result;
  }

  return replacementMethod;
}

const person = new Person('张三');
person.greet()
// "LOG: Entering method 'greet'."
// "Hello, my name is 张三."
// "LOG: Exiting method 'greet'."

```
* 利用方法装饰器，可以将类的方法变成延迟执行。

```TypeScript
function delay(milliseconds: number = 0) {
  return function (value, context) {
    if (context.kind === "method") {
      return function (...args: any[]) {
        setTimeout(() => {
          value.apply(this, args);
        }, milliseconds);
      };
    }
  };
}

class Logger {
  @delay(1000)
  log(msg: string) {
    console.log(`${msg}`);
  }
}

let logger = new Logger();
logger.log("Hello World");

```
* 在构造函数里给方法绑定this

```TypeScript

class Person {
  name: string;
  constructor(name: string) {
    this.name = name;

    // greet() 绑定 this 如果不绑定 this，下面的代码会报错
    this.greet = this.greet.bind(this);
  }

  greet() {
    console.log(`Hello, my name is ${this.name}.`);
  }
}

const g = new Person('张三').greet;
g() // "Hello, my name is 张三." 这行会报错空指针


// 给greet使用这个装饰器，可以不在构造函数里绑定this
function bound(
  originalMethod:any, context:ClassMethodDecoratorContext
) {
  const methodName = context.name;
  if (context.private) {
    throw new Error(`不能绑定私有方法 ${methodName as string}`);
  }
  context.addInitializer(function () {
    this[methodName] = this[methodName].bind(this);
  });
}

```

* 通过addInitializer给类添加一个Set收集想要收集的属性或者方法

```TypeScript

function collect(
  value,
  {name, addInitializer}
) {
  addInitializer(function () {
    if (!this.collectedMethodKeys) {
      this.collectedMethodKeys = new Set();
    }
    this.collectedMethodKeys.add(name);
  });
}

class C {
  @collect
  toString() {}

  @collect
  [Symbol.iterator]() {}
}

const inst = new C();
inst.collectedMethodKeys // new Set(['toString', Symbol.iterator])

```

## 属性装饰器

```TypeScript

type ClassFieldDecorator = (
  value: undefined,
  context: {
    kind: 'field';
    name: string | symbol;
    static: boolean;
    private: boolean;
    access: { get: () => unknown, set: (value: unknown) => void };
    addInitializer(initializer: () => void): void;
  }
) => (initialValue: unknown) => unknown | void;

```

* 装饰器的第一个参数value的类型是undefined，装饰器不能从value获取所装饰属性的值。第二个参数context对象的kind属性的值为字符串field，而不是“property”或“attribute”
* 属性装饰器要么不返回值，要么返回一个函数，该函数会自动执行，用来对所装饰属性进行初始化。该函数的参数是所装饰属性的初始值，该函数的返回值是该属性的最终值。
* 属性装饰器的返回值函数，可以用来更改属性的初始值。
* 属性装饰器的上下文对象context的access属性，提供所装饰属性的存取器，请看下面的例子。

```TypeScript

function logged(value, context) {
  const { kind, name } = context;
  if (kind === 'field') {
    return function (initialValue) {
      console.log(`initializing ${name} with value ${initialValue}`);
      return initialValue;
    };
  }
}

class Color {
  @logged name = 'green';
}

const color = new Color();
// "initializing name with value green"



function twice() {
  return initialValue => initialValue * 2;
}

class C {
  @twice
  field = 3;
}

const inst = new C();
inst.field // 6



let acc;

function exposeAccess(
  value, {access}
) {
  acc = access;
}

class Color {
  @exposeAccess
  name = 'green'
}

const green = new Color();
green.name // 'green'

acc.get(green) // 'green'

acc.set(green, 'red');
green.name // 'red'
```
## getter 装饰器，setter 装饰器

```TypeScript

type ClassGetterDecorator = (
  value: Function,
  context: {
    kind: 'getter';
    name: string | symbol;
    static: boolean;
    private: boolean;
    access: { get: () => unknown };
    addInitializer(initializer: () => void): void;
  }
) => Function | void;

type ClassSetterDecorator = (
  value: Function,
  context: {
    kind: 'setter';
    name: string | symbol;
    static: boolean;
    private: boolean;
    access: { set: (value: unknown) => void };
    addInitializer(initializer: () => void): void;
  }
) => Function | void;

```

* 这两个装饰器要么不返回值，要么返回一个函数，取代原来的取值器或存值器。


```TypeScript

class C {
  @lazy
  get value() {
    console.log('正在计算……');
    return '开销大的计算结果';
  }
}

function lazy(
  value:any,
  {kind, name}:any
) {
  if (kind === 'getter') {
    return function (this:any) {
      const result = value.call(this);
      Object.defineProperty(
        this, name,
        {
          value: result,
          writable: false,
        }
      );
      return result;
    };
  }
  return;
}

const inst = new C();
inst.value
// 正在计算……
// '开销大的计算结果'
inst.value
// '开销大的计算结果'

```

## accessor 装饰器

* accessor修饰符等同于为公开属性x自动生成取值器和存值器，它们作用于私有属性x。

```TypeScript

class C {
  accessor x = 1;
}
// 等同于
class C {
  #x = 1;

  get x() {
    return this.#x;
  }

  set x(val) {
    this.#x = val;
  }
}



class C {
  static accessor x = 1;
  accessor #y = 2;
}

```
accessor 装饰器的类型

```TypeScript

type ClassAutoAccessorDecorator = (
  value: {
    get: () => unknown;
    set: (value: unknown) => void;
  },
  context: {
    kind: "accessor";
    name: string | symbol;
    access: { get(): unknown, set(value: unknown): void };
    static: boolean;
    private: boolean;
    addInitializer(initializer: () => void): void;
  }
) => {
  get?: () => unknown;
  set?: (value: unknown) => void;
  init?: (initialValue: unknown) => unknown;
} | void;


```

## 装饰器的执行顺序


```TypeScript

function d(str:string) {
  console.log(`评估 @d(): ${str}`);
  return (
    value:any, context:any
  ) => console.log(`应用 @d(): ${str}`);
}

function log(str:string) {
  console.log(str);
  return str;
}

@d('类装饰器')
class T {
  @d('静态属性装饰器')
  static staticField = log('静态属性值');

  @d('原型方法')
  [log('计算方法名')]() {}

  @d('实例属性')
  instanceField = log('实例属性值');

  @d('静态方法装饰器')
  static fn(){}
}

```

执行结果：

```TypeScript

评估 @d(): 类装饰器
评估 @d(): 静态属性装饰器
评估 @d(): 原型方法
计算方法名
评估 @d(): 实例属性
评估 @d(): 静态方法装饰器
应用 @d(): 静态方法装饰器
应用 @d(): 原型方法
应用 @d(): 静态属性装饰器
应用 @d(): 实例属性
应用 @d(): 类装饰器
静态属性值

```

* 装饰器评估：这一步计算装饰器的值，首先是类装饰器，然后是类内部的装饰器，按照它们出现的顺序。

如果属性名或方法名是计算值（本例是“计算方法名”），则它们在对应的装饰器评估之后，也会进行自身的评估。

* 装饰器应用：实际执行装饰器函数，将它们与对应的方法和属性进行结合。

静态方法装饰器首先应用，然后是原型方法的装饰器和静态属性装饰器，接下来是实例属性装饰器，最后是类装饰器。

* “实例属性值”在类初始化的阶段并不执行，直到类实例化时才会执行。

如果一个方法或属性有多个装饰器，则内层的装饰器先执行，外层的装饰器后执行

```TypeScript

class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  @bound
  @log
  greet() {
    console.log(`Hello, my name is ${this.name}.`);
  }
}

```
