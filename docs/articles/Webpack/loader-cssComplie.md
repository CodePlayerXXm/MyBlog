---
sidebar: auto
tag:
  - 技术
  - Webpack
  - 网易云课堂笔记
features:
  - title: Webpack css编译
    details: style-loader css-loader
---

# css 编译

注意 loader 之间的加载顺序，自后向前加载。先 css-loader（解析 css）,再 style-loader（插入 css）。

## style-loader

设置 css 插入 HTML 的方式、位置等配置。配置项如下：

| Name       | Type               | Default   | Description                                                       |
| ---------- | ------------------ | --------- | ----------------------------------------------------------------- |
| injectType | {String}           | styleTag  | Allows to setup how styles will be injected into the DOM          |
| attributes | {Object}           | {}        | options: { attributes: { id: 'id' } } 给 style 标签价格 id 的属性 |
| insert     | {String\|Function} | head      | Inserts tag at the given position into the DOM                    |
| base       | {Number}           | true      | Sets module ID base (DLLPlugin)                                   |
| esModule   | {Boolean}          | true      | Use ES modules syntax                                             |
| modules    | {Object}           | undefined | Configuration CSS Modules                                         |

### injectType

style 标签的插入方式。可选值如下

- styleTag **默认插入<style></style>**
- singletonStyleTag **多个 css 合并为一个插入<style></style>**
- lazyStyleTag **调用 style.use()方法后才插入，style.unuse()方法卸载<style></style>**
- lazySingletonStyleTag **合并多个 css,调用 style.use()方法后才插入<style></style>**
- linkTag **<link>标签的方式引入，需要配合 file-loader**

#### lazyStyleTag

**webpack.config.js**

```json
module.exports = {
  entry: {
    index: "./app.js",
  },
  output: {
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "lazyStyleTag",
            },
          },
          {
            loader: "css-loader",
          },
        ],
      },
    ],
  },
};
```

**app.js**

```javascript
//  lazyStyleTag
import style from "./test1.css";
import style2 from "./test2.css";

//两秒后加载css
setTimeout(() => {
  style.use();
  style2.use();
}, 2000);

//四秒后卸载css
setTimeout(() => {
  style.unuse();
  style2.unuse();
}, 4000);
```

### insert

style 标签的插入位置。String 直接指定 DOM,Function 毕竟细致的指定位置。

#### String

**webpack.config.js**

```json
module.exports = {
  entry: {
    index: "./app.js",
  },
  output: {
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
            options: {
              insert: "body",// 插入在body之后，DOM选择器。
            },
          },
          {
            loader: "css-loader",
          },
        ],
      },
    ],
  },
};
```

#### Function

```json
module.exports = {
  entry: {
    index: "./app.js",
  },
  output: {
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
            options: {
              insert: function insertAtTop(element) {// element 被插入的style标签
                //拿到head标签
                var parent = document.querySelector("head");
                //声明一个变量，上一次被插入的style标签，挂在window对象上。
                var lastInsertedElement =
                  window._lastElementInsertedByStyleLoader;
                //上一次插入的style标签不存在，即第一次插入。插入到heade标签的顶部
                if (!lastInsertedElement) {
                  parent.insertBefore(element, parent.firstChild);
                  //上一次插入的style标签后面还有兄弟元素，插入到兄弟元素之前。即上一次插入的style标签的后面。
                } else if (lastInsertedElement.nextSibling) {
                  parent.insertBefore(element, lastInsertedElement.nextSibling);
                  //上一次插入的style标签后面没有兄弟元素。插入到父元素的最后。
                } else {
                  parent.appendChild(element);
                }
                //给上一次插入的style标签赋值
                window._lastElementInsertedByStyleLoader = element;
              },
            },

          },
          {
            loader: "css-loader",
          },
        ],
      },
    ],
  },
};
```

### base

使用 webpack dll 配置时,解决 css 的冲突问题。（base:数值越高，优先级越高？）

<https://segmentfault.com/a/1190000020485804> ，这篇文章讲的 webpack dll 配置不错。

### esModule

是否使用 ES 模块语法，默认是 true。可以设置为 false，启用 commonJs 模块语法。

- 使用 ES 模块是有益的，例如在模块串联和 Tree-shaking 的情况下

### modules

启用 css 的模块化

#### namedExport

导出样式的 class 名，默认是 hash 值，需要配合 css-loader 使用（详见 css-loader）

Type: Boolean Default: false

- 样式名转换为驼峰命名
- 不能使用 javascript 保留字
- css-loader,style-loader 都要配置

styles.css

```css
.foo-baz {
  color: red;
}
.bar {
  color: blue;
}
```

index.js

```javascript
import { fooBaz, bar } from "./styles.css";

console.log(fooBaz, bar);
```

webpack.config.js

```json
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              esModule: true,
              modules: {
                namedExport: true,
              },
            },
          },
          {
            loader: 'css-loader',
            options: {
              esModule: true,
              modules: {
                namedExport: true,
              },
            },
          },
        ],
      },
    ],
  },
};
```

## css-loader

| Name          | Type                      | Default          | Description                                                            |
| ------------- | ------------------------- | ---------------- | ---------------------------------------------------------------------- |
| url           | {Boolean\|Function}       | true             | Enables/Disables url/image-set functions handling                      |
| import        | {Boolean\|Function}       | true             | Enables/Disables @import at-rules handling                             |
| modules       | {Boolean\|String\|Object} | {auto: true}     | Enables/Disables CSS Modules and their configuration                   |
| sourceMap     | {Boolean}                 | compiler.devtool | Enables/Disables generation of source maps                             |
| importLoaders | {Number}                  | 0                | Enables/Disables or setups number of loaders applied before CSS loader |
| esModule      | {Boolean}                 | true             | Use ES modules syntax                                                  |

# url

type:Boolean | Function, default: true

css 中对于 url 引入的解析。绝对路径不会解析。

```javascript
url(image.png) => require('./image.png')
url('image.png') => require('./image.png')
url(./image.png) => require('./image.png')
url('./image.png') => require('./image.png')
url('http://dontwritehorriblecode.com/2112.png') => require('http://dontwritehorriblecode.com/2112.png')
image-set(url('image2x.png') 1x, url('image1x.png') 2x) => require('./image1x.png') and require('./image2x.png')

```

要从 node_modules 路径（包括 resolve.modules）导入资源，并为别名添加〜前缀。

```javascript
url(~module/image.png) => require('module/image.png')
url('~module/image.png') => require('module/image.png')
url(~aliasDirectory/image.png) => require('otherDirectory/image.png')
```

如果是 function：

webpack.config.js

```javascript
module.exports = {
  entry: {
    index: "./app.js",
    // index: ["babel-polyfill", "/app.js"],
  },
  output: {
    filename: "[name].bundle.js", //name是entry的键明——index
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              // url: true,//默认
              url: (url, resourcePath) => {
                // url ./aaa.jpg
                // resourcePath E:\code\practice\webpack\css-loader\test2.css
                // url ./html.jpg
                // resourcePath E:\code\practice\webpack\css-loader\test1.css
                console.log("url", url);
                console.log("resourcePath", resourcePath);
                if (url.includes("html.jpg")) {
                  return false;
                }
                return true;
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
};
```

app.js

```javascript
import style from "./test1.css";
import "./test2.css";

console.log(style);
```

test1.css

```css
body {
  background: url("./html.jpg");
}
```

test2.css

```css
#div {
  width: 100px;
  height: 100px;
  background: url("./aaa.jpg") no-repeat;
  background-size: contain;
}
```

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        /* 没有解析 */
        background: url("./html.jpg");
      }
    </style>
    <style>
      #div {
        width: 100px;
        height: 100px;
        /* file-loader的解析 */
        background: url(file:///E:/code/practice/webpack/css-loader/dist/99eb52b3eadf25b8a4ad1a002402f3e2.jpg)
          no-repeat;
        background-size: contain;
      }

      .foo-baz {
        color: red;
      }

      .bar {
        color: blue;
      }
    </style>
  </head>

  <body>
    <div id="div"></div>

    <script src="./dist/index.bundle.js"></script>
  </body>
</html>
```

详细见：<a style="text-decoration: underline;" href="https://webpack.docschina.org/loaders/css-loader/">css-loader 文档</a>

## 预编译语言

### 所需的 loader

less:
less
less-loader

sass:
node-sass
sass-loader

以 sass 为例：

```javascript
module.exports = {
  entry: {
    index: "./app.js",
    // index: ["babel-polyfill", "/app.js"],
  },
  output: {
    filename: "[name].bundle.js", //name是entry的键明——index
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "styleTag",
            },
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
};
```

## 提取 css 文件 link 引入

### 版本差异问题：

webpack4 及之后的版本，官方推荐 MiniCssExtractPlugin 插件

之前的 extract-text-webpack-plugin 插件。

extract-text-webpack-plugin:

```javascript
var extractTextCss = require("extract-text-webpack-plugin");
module.exports = {
  entry: {
    index: "./app.js",
    // index: ["babel-polyfill", "/app.js"],
  },
  output: {
    filename: "[name].bundle.js", //name是entry的键明——index
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractTextCss.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
            },
            {
              loader: "sass-loader",
            },
          ],
        }),
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    new extractTextCss({
      filename: "[name].min.css",
    }),
  ],
};
```

MiniCssExtractPlugin

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    index: "./app.js",
    // index: ["babel-polyfill", "/app.js"],
  },
  output: {
    filename: "[name].bundle.js", //name是entry的键明——index
    publicPath: "./",
  },
  plugins: [new MiniCssExtractPlugin({ filename: "./css/[name].min.css" })],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "../" }, //配置css中，文件引用的根路径，这里css都放入了css文件夹，所以要"../"往上找一级
          },
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
};
```

## postcss ,css 自动加厂牌前缀，以及下一代 css 的支持等功能

安装 postcss postcss-loader

安装 autoprefixer postcss-cssnext

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    index: "./app.js",
    // index: ["babel-polyfill", "/app.js"],
  },
  output: {
    filename: "[name].bundle.js", //name是entry的键明——index
    publicPath: "./",
  },
  plugins: [new MiniCssExtractPlugin({ filename: "./css/[name].min.css" })],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "../" }, //配置css中，文件引用的根路径，这里css都放入了css文件夹，所以要"../"往上找一级
          },
          "css-loader",
          "postcss-loader", //预处理cssloader之后，css-loader之前
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
};
```

package.json

```javascript
{
  "name": "css-loader",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "css-loader": "^5.0.1",
    "style-loader": "^2.0.0",
    "webpack": "^5.22.0",
    "webpack-cli": "^4.5.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.2.4",
    "file-loader": "^6.2.0",
    "mini-css-extract-plugin": "^1.3.6",
    "node-sass": "^5.0.0",
    "postcss": "^8.2.6",
    "postcss-cssnext": "^3.1.0",
    "postcss-loader": "^5.0.0",
    "sass": "^1.32.7",
    "sass-loader": "^11.0.1",
    "to-string-loader": "^1.1.6",
    "url-loader": "^4.1.1"
  },
  //全局配置浏览器的兼容目标
  "browserslist":[
    ">1%" , "last 2 versions"
  ]
}

```

postcss.config.js

```javascript
module.exports = {
  plugins: [require("autoprefixer"), require("postcss-cssnext")],
};
```
