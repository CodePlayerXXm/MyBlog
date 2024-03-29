---
title: Webpack 全局、局部，js-loader
group: Webpack
layout: doc
date: 2021-1-02T13:54:36+08:00
tags: [Webpack]
sidebar: true
summary:  全局、局部与js-loader配置
---

# 全局 Webpack 与局部 Webpack

## 全局 Webpack

<br/>

<img src="/images/Webpack/overall.png"/>

全局 Webpack 打包，直接命令行里 webpack 指令。

## 局部 Webpack

<br/>

<img src="/images/Webpack/part.png" />

局部 Webpack 打包，package.json 里添加 scripts 里添加 build 值为 webpack，会优先局部 webpack 打包。或者命令行里 npx webpack 指令.

# js-loader

## babel-preset

编译 js 至低版本，一般是 es5，兼容低版本浏览器。
<br/>

<img src="/images/Webpack/preset1.png" />
<br/>

<img src="/images/Webpack/preset2.png" />

## polyfill, transform-runtime

babel-polyfill, 全局垫片对象，重些所有 es6 的 api。会污染全局环境，适合写项目。
babel-transform-runtime, 局部垫片对象，只会把用的 api 打进包里，适合写框架。

## 其他 js 语法糖或者超集（vue-loader,ts-loader）

<br/>

<img src="/images/Webpack/jsOtherLoader.png" />

# 代码部分

## webpack.config.js

```javascript
module.exports = {
  entry: {
    index: "./app.js",
    // index: ["babel-polyfill", "/app.js"], //polyfill编译js
  },
  output: {
    filename: "[name].[hash:8].js", //name是entry的键明——index
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
};
```

## .babelrc

```javascript
{
  "presets": [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ">1%",
        },
      },
    ],
  ],
  "plugins":[
    ["@babel/transform-runtime"]//babel-transform-runtime 编译js
  ]
},
```

## tsconfig.json

```javascript
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es5"
  },
  "exclude": ["./node_modules"]
}
```

## package.json

```javascript
{
  "name": "js-loader",
  "version": "1.0.0",
  "description": "learn webpack jsloader",
  "main": "app.js",
  "dependencies": {
    "@babel/plugin-transform-runtime": "^7.12.17",
    "@babel/runtime": "^7.12.18",
    "babel-loader": "^8.2.2"
  },
  "devDependencies": {
    "@babel/preset-env": "^7.12.11",
    "babel-polyfill": "^6.26.0",
    "ts-loader": "^8.0.14",
    "typescript": "^4.1.3"
  },
  "scripts": {
    "test": "test",
    "build": "webpack"
  },
  "author": "Constable",
  "license": "ISC"
}
```

- 注意带不带@
