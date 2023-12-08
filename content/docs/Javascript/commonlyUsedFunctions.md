---
title: 一些常用函数
group: JavaScript
layout: doc
date: 2021-1-02T13:54:36+08:00
tags: [JavaScript]
sidebar: true
summary: 函数式编程中一些常用函数。
---

# 函数式编程中一些常用函数。

## 缓存函数 Memoization

### 定义与作用

<br/>
<img style="display:table;margin:auto" src="/images/commonlyUsedFunctions/commonlyUsedFunctions1.png" />

<br/>
<img style="display:table;margin:auto" src="/images/commonlyUsedFunctions/commonlyUsedFunctions2.png" />

### 代码实现

```javascript
const add = (a, b) => a + b;

let memorize = function(func, hash) {
  let memorize = function(key) {
    let cache = memorize.cache;
    let address = "" + (hash ? hash.apply(this.arguments) : key);
    if (!cache[address]) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memorize.cache = {};
  return memorize;
};
let addFunc = memorize(add);
console.log(addFunc(10, 20)); //30
```

用生成斐波那契数列的函数来测试一下：

```javascript
let count = 0;

let memorize = function(func, hash) {
  let memorize = function(key) {
    let cache = memorize.cache;
    let address = "" + (hash ? hash.apply(this.arguments) : key);
    if (!cache[address]) {
      cache[address] = func.apply(this, arguments);
    }
    return cache[address];
  };
  memorize.cache = {};
  return memorize;
};

let fibonacci = (i) => {
  count++;
  if (i === 0 || i === 1) {
    return 1;
  }
  return fibonacci(i - 1) + fibonacci(i - 2);
};

fibonacci = memorize(fibonacci); //此处赋值一定要用原来的函数名，不然递归自己的时候不会走memorize函数

for (let i = 0; i <= 10; i++) {
  fibonacci(i);
}

console.log(count); //11,不用memorize函数的话，此处输出是453
```

## 柯里函数

### 定义与作用

<br/>
<img style="display:table;margin:auto" src="/images/commonlyUsedFunctions/commonlyUsedFunctions3.png" />

<br/>
<img style="display:table;margin:auto" src="/images/commonlyUsedFunctions/commonlyUsedFunctions4.png" />

<br/>
<img style="display:table;margin:auto" src="/images/commonlyUsedFunctions/commonlyUsedFunctions5.png" />

- 提高函数复用的一种方式。

### 代码实现

```javascript
let add = (x, y, z, a) => x + y + z + a;

let curry = (fn) => {
  let limit = fn.length;
  let judgeCurry = (...args) =>
    args.length >= limit
      ? fn.apply(null, args)
      : (...args2) => judgeCurry.apply(null, args.concat(args2));
  return judgeCurry;
};

let afterCurry = curry(add);
let test = afterCurry(1)(2)(3);

console.log(test(4)); //10
```

## 偏函数

### 定义与作用

<br/>
<img style="display:table;margin:auto" src="/images/commonlyUsedFunctions/commonlyUsedFunctions6.png" />

<br/>
<img style="display:table;margin:auto" src="/images/commonlyUsedFunctions/commonlyUsedFunctions7.png" />

- 其实上面的 curry 函数已经实现了偏函数，写了一个可以用 undefined 占位，传参的偏函数

### 代码实现

```javascript
let add = (x, y, z, a) => x + y + z + a;

let partial = (func, ...args) => {
  for (let i = args.length; i < func.length; i++) {
    args.push(undefined); //补齐，跟func的参数列表对应上
  }
  return (...remainArgs) => {
    let j = 0;
    args.forEach((arg, i) => {
      arg === undefined && (args[i] = remainArgs[j++]);
    }); //当预留参数为undefined参数时，将偏函数赋值的函数参数顺序替换undefined
    return func(...args);
  };
};
let aa = partial(add, 1, undefined, undefined, 2);
console.log(aa(2, 2)); //7
```
