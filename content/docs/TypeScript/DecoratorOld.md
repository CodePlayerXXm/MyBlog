---
title: TypeScript 的装饰器(旧)
group: TypeScript
layout: doc
date: 2024-01-10T09:40:08.586Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的装饰器(旧)
---

## experimentalDecorators 编译选项

* 使用装饰器的旧语法，需要打开--experimentalDecorators编译选项。

* 译选项--emitDecoratorMetadata，用来产生一些装饰器的元数据，供其他工具或某些模块（比如 reflect-metadata ）使用

```shell

$ tsc --target ES5 --experimentalDecorators

```

```TypeScript

{
  "compilerOptions": {
    "target": "ES6",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}

```

## 装饰器的种类

一共5种

* 类装饰器（Class Decorators）：用于类。
* 属性装饰器（Property Decorators）：用于属性。
* 方法装饰器（Method Decorators）：用于方法。
* 存取器装饰器（Accessor Decorators）：用于类的 set 或 get 方法。
* 参数装饰器（Parameter Decorators）：用于方法的参数。

一个示例：

```TypeScript

@ClassDecorator() // （A）
class A {

  @PropertyDecorator() // （B）
  name: string;

  @MethodDecorator() //（C）
  fly(
    @ParameterDecorator() // （D）
    meters: number
  ) {
    // code
  }

  @AccessorDecorator() // （E）
  get egg() {
    // code
  }
  set egg(e) {
    // code
  }
}

```

A 是类装饰器，B 是属性装饰器，C 是方法装饰器，D 是参数装饰器，E 是存取器装饰器。

* 构造方法没有方法装饰器，只有参数装饰器。类装饰器其实就是在装饰构造方法。
* 装饰器只能用于类，要么应用于类的整体，要么应用于类的内部成员，不能用于独立的函数。

```TypeScript

function Decorator() {
  console.log('In Decorator');
}

@Decorator // 报错
function decorated() {
  console.log('in decorated');
}

```

## 类装饰器

* 类装饰器有唯一参数，就是构造方法，可以在装饰器内部，对构造方法进行各种改造。如果类装饰器有返回值，就会替换掉原来的构造方法。

```TypeScript

// 类型参数TFunction必须是函数，实际上就是构造方法。
// 类装饰器的返回值，要么是返回处理后的原始构造方法，要么返回一个新的构造方法。
type ClassDecorator = <TFunction extends Function>
  (target: TFunction) => TFunction | void;

```

* 类不需要新建实例，装饰器也会执行。装饰器会在代码加载阶段执行，而不是在运行时执行，而且只会执行一次。
* TypeScript 装饰器本质就是编译时执行的函数。
* 高阶函数，返回一个函数作为装饰器，可以传入参数。调用装饰器的时候，先执行一次工厂函数。
* @后面要么是一个函数名，要么是函数表达式
* 类装饰器可以没有返回值，如果有返回值，就会替代所装饰的类的构造函数，所以装饰器通常返回一个新的类，对原有的类进行修改或扩展。

```TypeScript

function f(target:any) {
  console.log('apply decorator')
  return target;
}

@f
class A {}
// 输出：apply decorator


@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t:string) {
    this.title = t;
  }
}

function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}


// 高阶函数返回函数
function factory(info:string) {
  console.log('received: ', info);
  return function (target:any) {
    console.log('apply decorator');
    return target;
  }
}

@factory('log something')
class A {}


// 可以使表达式
@((constructor: Function) => {
  console.log('log something');
})
class InlineDecoratorExample {
  // ...
}


// 返回一个新的类
function decorator(target:any) {
  return class extends target {
    value = 123;
  };
}

@decorator
class Foo {
  value = 456;
}

const foo = new Foo();
console.log(foo.value); // 123



type Constructor = {
  new(...args: any[]): {}
};

function decorator<T extends Constructor> (
  target: T
) {
  return class extends target {
    value = 123;
  };
}


@decorator
class A {}

// 等同于
class A {}
A = decorator(A) || A;
```
## 方法装饰器

方法装饰器的类型

```TypeScript

type MethodDecorator = <T>(
  target: Object,
  propertyKey: string|symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

```
* target：（对于类的静态方法）类的构造函数，或者（对于类的实例方法）类的原型。
* propertyKey：所装饰方法的方法名，类型为string|symbol。
* descriptor：所装饰方法的描述对象。

方法装饰器的返回值（如果有的话），就是修改后的该方法的描述对象，可以覆盖原始方法的描述对象。

```TypeScript

function logger(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log('params: ', ...args);
    const result = original.call(this, ...args);
    console.log('result: ', result);
    return result;
  }
}

class C {
  @logger
  add(x: number, y: number) {
    return x + y;
  }
}

(new C()).add(1, 2)
// params:  1 2
// result:  3


```

## 属性装饰器

```TypeScript

type PropertyDecorator =
  (
    target: Object,
    propertyKey: string|symbol
  ) => void;

```

* target：（对于实例属性）类的原型对象（prototype），或者（对于静态属性）类的构造函数。
* propertyKey：所装饰属性的属性名，注意类型有可能是字符串，也有可能是 Symbol 值。

属性装饰器不需要返回值，如果有的话，也会被忽略。

```TypeScript

function ValidRange(min:number, max:number) {
  return (target:Object, key:string) => {
    Object.defineProperty(target, key, {
      set: function(v:number) {
        if (v < min || v > max) {
          throw new Error(`Not allowed value ${v}`);
        }
      }
    });
  }
}

// 输出 Installing ValidRange on year
class Student {
  @ValidRange(1920, 2020)
  year!: number;
}

const stud = new Student();

// 报错 Not allowed value 2022
stud.year = 2022;

```

属性装饰器的第一个参数，对于实例属性是类的原型对象，而不是实例对象（即不是this对象）。<br/>
这是因为装饰器执行时，类还没有新建实例，所以实例对象不存在。<br/>
由于拿不到this，所以属性装饰器无法获得实例属性的值。<br/>
这也是它没有在参数里面提供属性描述对象的原因。

```TypeScript

// target是类的原型对象，不是实例对象，所以拿不到name属性
// 也就是说target.name是不存在的，所以拿到的是undefined
function logProperty(target: Object, member: string) {
  const prop = Object.getOwnPropertyDescriptor(target, member);
  console.log(`Property ${member} ${prop}`);
}

class PropertyExample {
  @logProperty
  name:string = 'Foo';
}
// 输出 Property name undefined

```

* 属性装饰器不仅无法获得实例属性的值，也不能初始化或修改实例属性，而且它的返回值也会被忽略。因此，它的作用很有限。
* 不过，如果属性装饰器设置了当前属性的存取器（getter/setter），然后在构造函数里面就可以对实例属性进行读写


```TypeScript

// 属性装饰器@Min通过设置存取器，拿到了实例属性的值。
function Min(limit:number) {
  return function(
    target: Object,
    propertyKey: string
  ) {
    console.log("🚀 ~ Min ~ propertyKey:", propertyKey)
    let value: string;

    const getter = function() {
      return value;
    };

    const setter = function(newVal:string) {
      if(newVal.length < limit) {
        throw new Error(`Your password should be bigger than ${limit}`);
      }
      else {
        value = newVal;
      }
    };
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter
    });
  }
}

class User {
  username: string;

  @Min(8)
  password: string;

  constructor(username: string, password: string){
    this.username = username;
    this.password = password;
  }
}

const u = new User('Foo', 'pass');
// 报错 Your password should be bigger than 8


```

## 存取器装饰器

```TypeScript

type AccessorDecorator = <T>(
  target: Object,
  propertyKey: string|symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

```

* target：（对于静态属性的存取器）类的构造函数，或者（对于实例属性的存取器）类的原型。
* propertyKey：存取器的属性名。
* descriptor：存取器的属性描述对象。

其他特性：

* 存取器装饰器的返回值（如果有的话），会作为该属性新的描述对象。
* TypeScript 不允许对同一个属性的存取器（getter 和 setter）使用同一个装饰器，也就是说只能装饰两个存取器里面的一个，且必须是排在前面的那一个，否则报错。
* 装饰器之所以不能同时用于同一个属性的存值器和取值器，原因是装饰器可以从属性描述对象上面，同时拿到取值器和存值器，因此只调用一次就够了。

```TypeScript

function validator(
  target: Object,
  propertyKey: string,
  descriptor: PropertyDescriptor
){
  const originalGet = descriptor.get;
  const originalSet = descriptor.set;

  if (originalSet) {
    descriptor.set = function (val) {
      if (val > 100) {
        throw new Error(`Invalid value for ${propertyKey}`);
      }
      originalSet.call(this, val);
    };
  }
}

class C {
  #foo!: number;

  @validator
  set foo(v) {
    this.#foo = v;
  }

  get foo() {
    return this.#foo;
  }
}

const c = new C();
c.foo = 150;
// 报错


// 报错
class Person {
  #name:string;

  @Decorator
  set name(n:string) {
    this.#name = n;
  }

  @Decorator // 报错
  get name() {
    return this.#name;
  }
}

```

## 参数装饰器

```TypeScript

type ParameterDecorator = (
  target: Object,
  propertyKey: string|symbol,
  parameterIndex: number
) => void;

```

* target：（对于静态方法）类的构造函数，或者（对于类的实例方法）类的原型对象。
* propertyKey：所装饰的方法的名字，类型为string|symbol。
* parameterIndex：当前参数在方法的参数序列的位置（从0开始）。

特性：

* 该装饰器不需要返回值，如果有的话会被忽略。
* 如果给多个参数添加装饰器，后面的参数会先输出
* 参数装饰器主要用于输出信息，没有办法修改类的行为

## 装饰器的执行顺序

装饰器只会执行一次，就是在代码解析时执行，哪怕根本没有调用类新建实例，也会执行，而且从此就不再执行了。

执行装饰器时，按照如下顺序执行。

* 实例相关的装饰器。
* 静态相关的装饰器。
* 构造方法的参数装饰器。
* 类装饰器。

```TypeScript
function f(key:string):any {
  return function () {
    console.log('执行：', key);
  };
}

@f('类装饰器')
class C {
  @f('静态方法')
  static method() {}

  @f('实例方法')
  method() {}

  constructor(@f('构造方法参数') foo:any) {}
}


// 执行： 实例方法
// 执行： 静态方法
// 执行： 构造方法参数
// 执行： 类装饰器

```

同一级装饰器的执行顺序，是按照它们的代码顺序。但是，参数装饰器的执行总是早于方法装饰器。

```TypeScript
function f(key:string):any {
  return function () {
    console.log('执行：', key);
  };
}

class C {
  @f('方法1')
  m1(@f('参数1') foo:any) {}

  @f('属性1')
  p1: number;

  @f('方法2')
  m2(@f('参数2') foo:any) {}

  @f('属性2')
  p2: number;
}

// 执行： 参数1
// 执行： 方法1
// 执行： 属性1
// 执行： 参数2
// 执行： 方法2
// 执行： 属性2

```

* 同一个方法或属性有多个装饰器，那么装饰器将顺序加载、逆序执行。
* 同一个方法有多个参数，那么参数也是顺序加载、逆序执行。
```TypeScript

function f(key:string):any {
  console.log('加载：', key);
  return function () {
    console.log('执行：', key);
  };
}

class C {
  @f('A')
  @f('B')
  @f('C')
  m1() {}
}
// 加载： A
// 加载： B
// 加载： C
// 执行： C
// 执行： B
// 执行： A


function f(key:string):any {
  console.log('加载：', key);
  return function () {
    console.log('执行：', key);
  };
}

class C {
  method(
    @f('A') a:any,
    @f('B') b:any,
    @f('C') c:any,
  ) {}
}
// 加载： A
// 加载： B
// 加载： C
// 执行： C
// 执行： B
// 执行： A
```


## 为什么装饰器不能用于函数

JavaScript 的函数不管在代码的什么位置，都会提升到代码顶部。

```TypeScript

let counter = 0;

let add = function (target:any) {
  counter++;
};

@add
function foo() {
  //...
}


// 因为函数提升 add 还没有定义就调用了，从而报错
@add // 报错
function foo() {
  //...
}

let counter = 0;
let add = function (target:any) {
  counter++;
};
```

如果一定要装饰函数，可以采用高阶函数的形式直接执行，没必要写成装饰器。


## 多个装饰器的合成

```TypeScript

@f @g x

// 或者
@f
@g
x


```

多个装饰器的效果，类似于函数的合成，按照从里到外的顺序执行。对于上例来说，就是执行f(g(x))。<br/>
如果f和g是表达式，那么需要先从外到里求值。
