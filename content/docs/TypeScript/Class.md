---
title: TypeScript 的Class
group: TypeScript
layout: doc
date: 2023-12-12T07:40:42.261Z
tags: [TypeScript]
sidebar: true
summary: TypeScript 的Class
---

## 属性的类型

* 对于顶层声明的属性，可以在声明时同时给出类型。否则 TypeScript 会认为x和y的类型都是any。
* 声明时给出初值，可以不写类型，TypeScript 会自行推断属性的类型
* 配置项strictPropertyInitialization，只要打开，就会检查属性是否设置了初值，如果没有就报错。
* 如果类的顶层属性不赋值，就会报错。如果不希望出现报错，可以使用非空断言。

```TypeScript

// 打开 strictPropertyInitialization
class Point {
  x: number; // 报错
  y: number; // 报错
}

// 非空断言
class Point {
  x!: number;
  y!: number;
}

```

## readonly 修饰符

* 属性名前面加上 readonly 修饰符，就表示该属性是只读的。实例对象不能修改这个属性
* 构造方法修改只读属性的值也是可以的。或者说，如果两个地方都设置了只读属性的值，以构造方法为准。在其他方法修改只读属性都会报错。


```TypeScript
class A {
  readonly id = 'foo';
}

const a = new A();
a.id = 'bar'; // 报错


class A {
  readonly id:string = 'foo';

  constructor() {
    this.id = 'bar'; // 正确
  }
}

```
## 方法的类型

* 类的方法就是普通函数，类型声明方式与函数一致。
* 构造方法不能声明返回值类型，否则报错，因为它总是返回实例对象。

```TypeScript

// 省略返回值类型，ts会自己推导
class Point {
  x:number;
  y:number;

  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }

  add(point:Point) {
    return new Point(
      this.x + point.x,
      this.y + point.y
    );
  }
}

// 函数默认值
class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

// 函数重载
class Point {
  constructor(x:number, y:string);
  constructor(s:string);
  constructor(xs:number|string, y?:string) {
    // ...
  }
}

// 构造函数返回类型只能是类的实例
class B {
  constructor():object { // 报错
    // ...
  }
}
```
## 存取器方法

* 如果某个属性只有get方法，没有set方法，那么该属性自动成为只读属性。
* TypeScript 5.1 版之前，set方法的参数类型，必须兼容get方法的返回值类型，否则报错。TypeScript 5.1 版做出了改变，现在两者可以不兼容。
* get方法与set方法的可访问性必须一致，要么都为公开方法，要么都为私有方法。

```TypeScript

class C {
  _name = 'foo';

  get name() {
    return this._name;
  }
}

const c = new C();
c.name = 'bar'; // 报错


// TypeScript 5.1 版之前
class C {
  _name = '';
  get name():string {  // 报错
    return this._name;
  }
  set name(value:number) {
    this._name = String(value);
  }
}

class C {
  _name = '';
  get name():string {
    return this._name;
  }
  set name(value:number|string) {
    this._name = String(value);
  }
}

```

## 属性索引

* 由于类的方法是一种特殊属性（属性值为函数的属性），所以属性索引的类型定义也涵盖了方法。如果一个对象同时定义了属性索引和方法，那么前者必须包含后者的类型。
* 属性的读取器虽然是一个函数方法，但是视同属性，所以属性索引虽然没有涉及方法类型，但是不会报错。

```TypeScript

class MyClass {
  [s:string]: boolean |
    ((s:string) => boolean);

  get(s:string) {
    return this[s] as boolean;
  }
}

class MyClass {
  [s:string]: boolean;
  f() { // 报错
    return true;
  }
}

// 读取器虽然是方法，但是可以不用函数类型
class MyClass {
  [s:string]: boolean;

  get isInstance() {
    return true;
  }
}

```
## 类的 interface 接口
### implements 关键字

* interface 接口或 type 别名，可以用对象的形式，为 class 指定一组检查条件。然后，类使用 implements 关键字，表示当前类满足这些外部类型条件的限制。
* interface 只是指定检查条件，如果不满足这些条件就会报错。它并不能代替 class 自身的类型声明。
* 接口A有一个可选属性y，类B没有声明这个属性，所以可以通过类型检查。但是，如果给B的实例对象的属性y赋值，就会报错。所以，B类还是需要声明可选属性y。
* 类可以定义接口没有声明的方法和属性。
* implements关键字后面，不仅可以是接口，也可以是另一个类。这时，后面的类将被当作接口。
* interface 描述的是类的对外接口，也就是实例的公开属性和公开方法，不能定义私有的属性和方法

```TypeScript

interface Country {
  name:string;
  capital:string;
}
// 或者
type Country = {
  name:string;
  capital:string;
}

class MyCountry implements Country {
  name = '';
  capital = '';
}

// class里不能省略类型声明
interface A {
  get(name:string): boolean;
}

class B implements A {
  get(s) { // s 的类型是 any
    return true;
  }
}

// class里可选的属性也要声明值
interface A {
  x: number;
  y?: number;
}

class B implements A {
  x = 0;
  // y?: number; 要写！
}

const b = new B();
b.y = 10; // 报错

// 可以定义没有声明的方法和属性
interface Point {
  x: number;
  y: number;
}

class MyPoint implements Point {
  x = 1;
  y = 1;
  z:number = 1;
}

// implements class
class Car {
  id:number = 1;
  move():void {};
}

class MyCar implements Car {
  id = 2; // 不可省略
  move():void {};   // 不可省略
}

// 不能定义内部的方法属性
interface Foo {
  private member:{}; // 报错
}
```
### 实现多个接口

 * 类可以实现多个接口（其实是接受多重限制），每个接口之间使用逗号分隔。但是，同时实现多个接口并不是一个好的写法，容易使得代码难以管理。
 * 可以使用两种方法替代。第一种方法是类的继承。第二种方法是接口的继承。
 * 发生多重实现时（即一个接口同时实现多个接口），不同接口不能有互相冲突的属性。

```TypeScript
// 不推荐写法
class Car implements MotorVehicle, Flyable, Swimmable {
  // ...
}

// 通过类的继承
class Car implements MotorVehicle {
}

class SecretCar extends Car implements Flyable, Swimmable {
}

// 接口的继承
interface A {
  a:number;
}

interface B extends A {
  b:number;
}

// 前面例子的推荐写法
interface MotorVehicle {
  // ...
}
interface Flyable {
  // ...
}
interface Swimmable {
  // ...
}

interface SuperCar extends MotoVehicle,Flyable, Swimmable {
  // ...
}

class SecretCar implements SuperCar {
  // ...
}

// 冲突的属性，会报错
interface Flyable {
  foo:number;
}

interface Swimmable {
  foo:string;
}
```

### 类与接口的合并

* TypeScript 不允许两个同名的类，但是如果一个类和一个接口同名，那么接口会被合并进类。
* 合并进类的非空属性（上例的y），如果在赋值之前读取，会返回undefined

```TypeScript
class A {
  x:number = 1;
}

interface A {
  y:number;
}

let a = new A();
a.y = 10;

a.x // 1
a.y // 10

class A {
  x:number = 1;
}

interface A {
  y:number;
}

let a = new A();
a.y // undefined

```

## Class 类型
### 实例类型

* TypeScript 的类本身就是一种类型，但是它代表该类的实例类型，而不是 class 的自身类型。
* 如果类Car有接口MotoVehicle没有的属性和方法，那么只有变量c1可以调用这些属性和方法。

```TypeScript
class Color {
  name:string;

  constructor(name:string) {
    this.name = name;
  }
}

const green:Color = new Color('green');


interface MotorVehicle {
}

class Car implements MotorVehicle {
  a = '123'
}

// 写法一
const c1: Car = new Car();
// 写法二
const c2: MotorVehicle = new Car();

console.log("🚀 ~ file: app.ts:10 ~ c1:", c1.a)
console.log("🚀 ~ file: app.ts:10 ~ c2:", c2.a)

// 实例的类型，而非类的类型
class Point {
  x:number;
  y:number;

  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }
}

// 错误
function createPoint(
  PointClass:Point,
  x: number,
  y: number
) {
  return new PointClass(x, y);
}

```

### 类的自身类型

* 要获得一个类的自身类型，一个简便的方法就是使用 typeof 运算符。
* 类只是构造函数的一种语法糖，本质上是构造函数的另一种写法。所以，类的自身类型可以写成构造函数的形式。
* 构造函数也可以写成对象形式，所以参数PointClass的类型还有另一种写法。
* 可以把构造函数提取出来，单独定义一个接口（interface），这样可以大大提高代码的通用性。

```TypeScript

function createPoint(
  PointClass:typeof Point,
  x:number,
  y:number
):Point {
  return new PointClass(x, y);
}

// 实际上是构造函数
function createPoint(
  PointClass: new (x:number, y:number) => Point,
  x: number,
  y: number
):Point {
  return new PointClass(x, y);
}

// 对象写法
function createPoint(
  PointClass: {
    new (x:number, y:number): Point
  },
  x: number,
  y: number
):Point {
  return new PointClass(x, y);
}

// 抽离interface
interface PointConstructor {
  new(x:number, y:number):Point;
}

function createPoint(
  PointClass: PointConstructor,
  x: number,
  y: number
):Point {
  return new PointClass(x, y);
}
```
### 结构类型原则

* Class 也遵循“结构类型原则”。一个对象只要满足 Class 的实例结构，就跟该 Class 属于同一个类型。
* 如果两个类的实例结构相同，那么这两个类就是兼容的，可以用在对方的使用场合。
* 总之，只要 A 类具有 B 类的结构，哪怕还有额外的属性和方法，TypeScript 也认为 A 兼容 B 的类型。
* 不仅是类，如果某个对象跟某个 class 的实例结构相同，TypeScript 也认为两者的类型相同。
* 由于这种情况，运算符instanceof不适用于判断某个对象是否跟某个 class 属于同一类型。
* 空类不包含任何成员，任何其他类都可以看作与空类结构相同。因此，凡是类型为空类的地方，所有类（包括对象）都可以使用。
* 确定两个类的兼容关系时，只检查实例成员，不考虑静态成员和构造方法。
* 如果类中存在私有成员（private）或保护成员（protected），那么确定兼容关系时，TypeScript 要求私有成员和保护成员来自同一个类，这意味着两个类需要存在继承关系。

```TypeScript
// 类也符合结构体原则
class Foo {
  id!:number;
}

function fn(arg:Foo) {
  // ...
}

const bar = {
  id: 10,
  amount: 100,
};

fn(bar); // 正确

// 实例结构相同，即兼容
class Person {
  name: string;
}

class Customer {
  name: string;
}

// 正确
const cust:Customer = new Person();

// 可以兼容多属性，但是少属性不可以
class Person {
  name: string;
  age: number;
}

class Customer {
  name: string;
}

// 正确
const cust:Customer = new Person();

class Person {
  name: string;
}

class Customer {
  name: string;
  age: number;
}

// 报错
const cust:Customer = new Person();

// 对象也可以
class Person {
  name: string;
}

const obj = { name: 'John' };
const p:Person = obj; // 正确
// 但是不是实例
obj instanceof Person // false

// 空类的话，所有类（包括对象）都可以使用
class Empty {}

function fn(x:Empty) {
  // ...
}

fn({});
fn(window);
fn(fn);

// 不需要考虑静态成员和构造方法
class Point {
  x: number;
  y: number;
  static t: number;
  constructor(x:number) {}
}

class Position {
  x: number;
  y: number;
  z: number;
  constructor(x:string) {}
}

const point:Point = new Position('');

// 如果是类中存在私有成员（private）或保护成员（protected），必须要有继承关系
// 情况一
class A {
  private name = 'a';
}

class B extends A {
}

const a:A = new B();

// 情况二
class A {
  protected name = 'a';
}

class B extends A {
  protected name = 'b';
}

const a:A = new B();

```
## 类的继承

* 子类可以覆盖基类的同名方法。
* 子类的同名方法不能与基类的类型定义相冲突
* 如果基类包括保护成员（protected修饰符），子类可以将该成员的可访问性设置为公开（public修饰符），也可以保持保护成员不变，但是不能改用私有成员（private修饰符）
* extends关键字后面不一定是类名，可以是一个表达式，只要它的类型是构造函数就可以了。
* 对于那些只设置了类型、没有初值的顶层属性，子类的顶层属性只设置了类型，没有设置初始值，会报错。解决方法就是使用declare命令，去声明顶层成员的类型，告诉 TypeScript 这些成员的赋值由基类实现。<br/>
  原因在于 ES2022 标准的 Class Fields 部分，与早期的 TypeScript 实现不一致，导致子类的那些只设置类型、没有设置初值的顶层成员在基类中被赋值后，会在子类被重置为undefined

```TypeScript

class B extends A {
  greet(name?: string) {
    if (name === undefined) {
      super.greet();
    } else {
      console.log(`Hello, ${name}`);
    }
  }
}

// 父子类型同名属性，方法类型不能冲突
class A {
  greet() {
    console.log('Hello, world!');
  }
}

class B extends A {
  // 报错
  greet(name:string) {
    console.log(`Hello, ${name}`);
  }
}

// 父类的protected属性，修改权限
class A {
  protected x: string = '';
  protected y: string = '';
  protected z: string = '';
}

class B extends A {
  // 正确
  public x:string = '';

  // 正确
  protected y:string = '';

  // 报错
  private z: string = '';
}

// 继承的不一定是类也可以是表达式
// 例一
class MyArray extends Array<number> {}

// 例二
class MyError extends Error {}

// 例三
class A {
  greeting() {
    return 'Hello from A';
  }
}
class B {
  greeting() {
    return 'Hello from B';
  }
}

interface Greeter {
  greeting(): string;
}

interface GreeterConstructor {
  new (): Greeter;
}

function getGreeterBase():GreeterConstructor {
  return Math.random() >= 0.5 ? A : B;
}

class Test extends getGreeterBase() {
  sayHello() {
    console.log(this.greeting());
  }
}


// 子类顶层属性初始化问题
interface Animal {
  animalStuff: any;
}

interface Dog extends Animal {
  dogStuff: any;
}

class AnimalHouse {
  resident: Animal;

  constructor(animal:Animal) {
    this.resident = animal;
  }
}

class DogHouse extends AnimalHouse {
  resident: Dog; //报错，没有初始化值

  // declare resident: Dog; 应该这样

  constructor(dog:Dog) {
    super(dog);
  }
}

```
## public

* public修饰符表示这是公开成员，外部可以自由访问。
* 除非为了醒目和代码可读性，public都是省略不写的。

## private

* private修饰符表示私有成员，只能用在当前类的内部，类的实例和子类都不能使用该成员。
* 子类不能定义父类私有成员的同名成员。
* 如果在类的内部，当前类的实例可以获取私有成员。
* private定义的私有成员，并不是真正意义的私有成员
  * 编译成 JavaScript 后，private关键字就被剥离了，这时外部访问该成员就不会报错
  * TypeScript 对于访问private成员没有严格禁止，使用方括号写法（[]）或者in运算符，实例对象就能访问该成员
* ES2022 引入了自己的私有成员写法#propName。因此建议不使用private，改用 ES2022 的写法，获得真正意义的私有成员。
* 单例模式

```TypeScript

// private 访问权限
class A {
  private x:number = 0;
}

const a = new A();
a.x // 报错

class B extends A {
  showX() {
    console.log(this.x); // 报错
  }
}

// 子类不能重新定义
class A {
  private x = 0;
}

class B extends A {
  x = 1; // 报错
}

// 可以通过类内部的方法访问
class A {
  private x = 10;

  f(obj:A) {
    console.log(obj.x);
  }
}

const a = new A();
a.f(a) // 10


// 绕过权限访问的方法
class A {
  private x = 1;
}

const a = new A();
a['x'] // 1

if ('x' in a) { // 正确
  // ...
}

// 真正的写法
class A {
  #x = 1;
}

const a = new A();
a['x'] // 报错

// 单例模式
class Singleton {
  private static instance?: Singleton;

  private constructor() {}

  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}

const s = Singleton.getInstance();
```
## protected

* 只能在类的内部使用该成员，实例无法使用该成员，但是子类内部可以使用。
* 子类不仅可以拿到父类的保护成员，还可以定义同名成员。
* 在类的外部，实例对象不能读取保护成员，但是在类的内部可以。

```TypeScript

// 子类中可以访问，实例不能够
class A {
  protected x = 1;
}

class B extends A {
  getX() {
    return this.x;
  }
}

const a = new A();
const b = new B();

a.x // 报错
b.getX() // 1

// 可以修改父类的保护成员,不能是private
class A {
  protected x = 1;
}

class B extends A {
  x = 2;
}

// 可以用类内部的方法，在外部获取
class A {
  protected x = 1;

  f(obj:A) {
    console.log(obj.x);
  }
}

const a = new A();

a.x // 报错
a.f(a) // 1
```

## 实例属性的简写形式

* 构造方法的参数x前面有public修饰符，这时 TypeScript 就会自动声明一个公开属性x，不必在构造方法里面写任何代码，同时还会设置x的值为构造方法的参数值。注意，这里的public不能省略。
* private、protected、readonly修饰符，都会自动声明对应修饰符的实例属性
* readonly还可以与其他三个可访问性修饰符，一起使用。

```TypeScript


class Point {
  constructor(
    public x:number,
    public y:number
  ) {}
}

const p = new Point(10, 10);
p.x // 10
p.y // 10



class A {
  constructor(
    public a: number,
    protected b: number,
    private c: number,
    readonly d: number
  ) {}
}

// 编译结果
class A {
    a;
    b;
    c;
    d;
    constructor(a, b, c, d) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
    }
}


class A {
  constructor(
    public readonly x:number,
    protected readonly y:number,
    private readonly z:number
  ) {}
}
```

## 静态成员

* 静态成员是只能通过类本身使用的成员，不能通过实例对象使用。
* static关键字前面可以使用 public、private、protected 修饰符。
* 静态私有属性也可以用 ES6 语法的#前缀表示
* public和protected的静态成员可以被继承。

```TypeScript

class MyClass {
  static x = 0;
  static printX() {
    console.log(MyClass.x);
  }
}

MyClass.x // 0
MyClass.printX() // 0

class MyClass {
  private static x = 0;
}

MyClass.x // 报错

class MyClass {
  static #x = 0;
}

// 权限同上属性方法
class A {
  public static x = 1;
  protected static y = 1;
}

class B extends A {
  static getY() {
    return B.y;
  }
}

B.x // 1
B.getY() // 1
```
## 泛型类

* 类也可以写成泛型，使用类型参数
* 静态成员不能使用泛型的类型参数。

``` TypeScript

class Box<Type> {
  contents: Type;

  constructor(value:Type) {
    this.contents = value;
  }
}

const b:Box<string> = new Box('hello!');

class Box<Type> {
  static defaultContents: Type; // 报错
}

```
## 抽象类，抽象成员

* 抽象类不能被实例化，只能当作其他类的模板。
* 抽象类只能当作基类使用，用来在它的基础上定义子类。抽象类可以继承其他抽象类。
* 抽象成员，属性名和方法名有abstract关键字，表示该方法需要子类实现。
  * 抽象成员只能存在于抽象类，不能存在于普通类。
  * 抽象成员不能有具体实现的代码。也就是说，已经实现好的成员前面不能加abstract关键字。
  * 抽象成员前也不能有private修饰符，否则无法在子类中实现该成员。
  * 一个子类最多只能继承一个抽象类。

```TypeScript

abstract class A {
  id = 1;
}

const a = new A(); // 报错


// 抽象类可以继承抽象类
abstract class A {
  foo:number;
}

abstract class B extends A {
  bar:string;
}

// 抽象成员（属性，方法）需要子类实现
abstract class A {
  abstract foo:string;
  bar:string = '';
}

class B extends A {
  foo = 'b';
}
```

## this

* 函数fn()的第一个参数是this，用来声明函数内部的this的类型。
* this参数的类型可以声明为各种对象。
* TypeScript 提供了一个noImplicitThis编译选项。如果打开了这个设置项，如果this的值推断为any类型，就会报错。
* 在类的内部，this本身也可以当作类型使用，表示当前类的实例对象。
* this类型不允许应用于静态成员。
* 方法返回一个布尔值，表示当前的this是否属于某种类型。这时，这些方法的返回值类型可以写成this is Type的形式，其中用到了is运算符。

```TypeScript

class A {
  name = 'A';

  getName(this: A) {
    return this.name;
  }
}

const a = new A();
const b = a.getName;

b() // 报错

// this不止适用类
function foo(
  this: { name: string }
) {
  this.name = 'Jack';
  this.name = 0; // 报错
}

foo.call({ name: 123 }); // 报错

// this可以做类型
class Box {
  contents:string = '';

  set(value:string):this {
    this.contents = value;
    return this;
  }
}

// 静态属性报错
class A {
  static a:this; // 报错
}


class FileSystemObject {
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }

  isDirectory(): this is Directory {
    return this instanceof Directory;
  }

  // ...
}
```
