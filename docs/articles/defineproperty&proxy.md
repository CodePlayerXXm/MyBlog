---
sidebar: auto
tag:
  - 技术
  - Vue
features:
  - title: Vue2与Vue3中数据响应的实现
    details: defineProperty与proxy在Vue2、3中的使用
---

## Vue2 中 defineProperty 实现数据响应

### Object.defineProperty

defineProperty 这个 API 并不是作为做数据响应而生的，他作用是描述一个对象的某个属性的。他可以设置的属性如下：

```javaScript

Object.defineProperty(obj,key,{
  enumerable: false, //是否可枚举
  configurable: false, //是否可Delete这个属性
  writable: false, //是否可写
  value: 'val' ,//这个属性的值
  get(){},//读取这个属性时，触发的钩子函数
  set(){}//改写这个属性的值时，触发的钩子函数
})

```

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

//数组的监听
//Vue数组的特性，只监听数组的方法：push、pop、shift、unshift
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

### Proxy
