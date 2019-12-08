---
sidebar: auto
tag:
  - 技术
  - Vue
features:
  - title: Vue2与Vue3中数据响应的实现
    details: defineProperty与proxy在Vue2、3中的使用
---
# defineProperty与proxy在Vue2、3中的使用

## Vue2 中 defineProperty 实现数据响应

### Object.defineProperty

defineProperty 这个 API 并不是作为做数据响应而生的，他作用是描述一个对象的某个属性的。他可以设置的属性如下：

```javascript

Object.defineProperty(obj,key,{
  enumerable: false, //是否可枚举
  configurable: false, //是否可Delete这个属性
  writable: false, //是否可写
  value: 'val' ,//这个属性的值
  get(){},//读取这个属性时，触发的钩子函数
  set(){}//改写这个属性的值时，触发的钩子函数
})

```
### 数据监听实现

其中 get 与 set 钩子函数被发现可以用来做数据响应，Vue2 中实现大体如下：

```javascript
function Vue() {
  this.$data = { a: 1 };
  this.el = document.getElementById("app");
  this.virtualDom = "";
  this.observe(this.$data);
  this.render();
}

Vue.prototype.observe = function(obj) {
  var self = this;
  var value;
  for (var key in obj) {
    value = obj[key];
    if (typeof value === object) {
      this.observe(value);
    } else {
      Object.defineProperty(obj, key, {
        get() {
          // 真正的源码内,此处会进行依赖收集，
          // 依赖收集是指确定这个对象是在哪个组件中，
          // 更新时只修改这个组件中的对象
          return value;
        },
        set(newVal) {
          value = newVal;
          self.render();
        }
      });
    }
  }
};

Vue.prototype.redner = function() {
  this.virtualdom = "this is " + this.$data.a;
  this.el.innerHTML = this.virtualdom;
};

```
### 数组的监听实现

数组监听实现是深拷贝了数组的原型上的方法，利用装饰者模式重写这几个方法

```javaScript
//数组的监听
//Vue数组的特性，数组的数据响应只能用方法：push、pop、shift、unshift
var arrayProto = Array.prototype
var arrayOb = Object.create(arraypro)
var funcArr = ['push','pop','shift','unshift']
//装饰者模式
funcArr.forEach(method=>{
  arrayOb[method] =function(){
    var ret = arrayProto[method].apply(this,arguments);
    Dep.notify()
    return ret
  }
})

```
## Vue3 中 Proxy 实现数据响应

### Proxy与defineProperty的不同

Proxy与defineProperty作用类似。只是用法稍有不同：

```javascript

var obj1 = {a:1,b:2};
var obj2 = new Proxy(obj1,{
  get(target,key,receiver){
    console.log(target,key,receiver)
    return Reflect.get(target,key)
  },
  set(target,key,value,receiver){
    console.log(target,key,value,receiver)
    return Reflect.set(target,key,value)
  }
}) 

//控制台打印
obj2.a // {a:1,b:2},"a",Proxy{a:1,b:2}
obj2.a = 3 // {a:1,b:2},"a", 3, Proxy{a:1,b:2}

```
Proxy相对于defineProperty的优势，有三点:
 + 不污染原对象，需要赋值给一个新的对象
 + 监听整个对象不需要遍历这个对象上的属性
 + 配合Reflect，更优雅的API，不需要在外层声明一个value变量，接收新的值


```javascript

Vue.prototype.observe = function(obj) {
  var self = this;
  this.$data = new Proxy(this.$data{
    get(target,key){
      return Reflect.get(target,key)
    },
    set(target,key,value){
      return Reflect.set(target,key,value)
      self.render();
    }
  }
};

```

用proxy重写observe。

### proxy其他的用法

proxy还可以用做类型检验

```javascript

//策略模式
var validate = {
  name(value){
    if(value === "string"){
      return true
    }
    return false
  },
  age(value){
    if(value === "number"){
      return true
    }
    return false
  }
}

function Person(name,age){
  this.name = name
  this.age = age
  return new Proxy(this,{
    get(target,key){
      return Reflect.get(target,key)
    },
    set(target,key,value){
      if(validate[key](value)){
        return Reflect.set(target,key,value)
      }else{
        throw new Error(key + '传入不正确')
      }
    }
  })
}
var someone = new Person()
someone.name = 123
```