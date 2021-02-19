---
sidebar: auto
tag:
  - 技术
  - Webpack
  - 网易云课堂笔记
features:
  - title: Webpack devServer相关配置
    details: devServer
---

# 热更新

webpack5 target 默认不是"web"而是"browserslist",如果由配置 browserslist，这会造成 css 热更新失效。需要手动配置一下 target。
另外需要引入 webpack.HotModuleReplacementPlugin()插件

webpack.config.js

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  //css热更新
  target: "web",
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
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "../" }, //配置css中，文件引用的根路径，这里css都放入了css文件夹，所以要"../"往上找一级
          },
          "css-loader",
          "postcss-loader",
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
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/[name].min.css",
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./index.html",
      favicon: "./aaa.jpg",
      meta: {
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
      },
      hash: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devtool: "eval-cheap-source-map",
  devServer: {
    hot: true,
    hotOnly: true,
    //编译错误。浏览器遮罩层。
    overlay: { errors: true },
    // inline: false,
    // historyApiFallback: true,
    historyApiFallback: {
      //路由跳转
      rewrites: [
        {
          from: /^\/([ -~]+)/,
          to: function(context) {
            return "./" + context.match[1] + ".html";
          },
        },
      ],
    },
    proxy: {
      "/j": {
        target: "https://study.163.com/",
        changeOrigin: true,
        pathRewrite: {
          "^/j/1": "/j/navi/getShopCartCount.json",
        },
      },
    },
  },
};
```

app.js

```javascript
import style from "./test1.scss";
import $ from "jquery";

$.ajax({
  url: "/j/1",
  type: "get",
  success: function(res) {
    console.log(res);
  },
});

var i = 0;

setInterval(() => {
  i++;
  document.querySelector(".foo-baz").innerText = i;
}, 1000);
//js热更新的关键。
if (module.hot) {
  module.hot.accept();
}
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
    "build": "webpack",
    "serve":"webpack serve --open"
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
    "html-webpack-plugin": "^5.1.0",
    "mini-css-extract-plugin": "^1.3.6",
    "node-sass": "^5.0.0",
    "postcss": "^8.2.6",
    "postcss-cssnext": "^3.1.0",
    "postcss-loader": "^5.0.0",
    "sass": "^1.32.7",
    "sass-loader": "^11.0.1",
    "to-string-loader": "^1.1.6",
    "url-loader": "^4.1.1",
    "webpack-dev-server": "^3.11.2"
  },
  "browserslist": [
    "last 2 version",
    "> 1%"
  ]
}

```

# source-map

品质说明(quality)
打包后的代码 - 将所有生成的代码视为一大块代码。你看不到相互分离的模块。

生成后的代码 - 每个模块相互分离，并用模块名称进行注释。可以看到 webpack 生成的代码。示例：你会看到类似 var module**WEBPACK_IMPORTED_MODULE_1** = **webpack_require**(42); module**WEBPACK_IMPORTED_MODULE_1**.a();，而不是 import {test} from "module"; test();。

转换过的代码 - 每个模块相互分离，并用模块名称进行注释。可以看到 webpack 转换前、loader 转译后的代码。示例：你会看到类似 import {test} from "module"; var A = function(\_test) { ... }(test);，而不是 import {test} from "module"; class A extends test {}。

原始源代码 - 每个模块相互分离，并用模块名称进行注释。你会看到转译之前的代码，正如编写它时。这取决于 loader 支持。

无源代码内容 - source map 中不包含源代码内容。浏览器通常会尝试从 web 服务器或文件系统加载源代码。你必须确保正确设置 output.devtoolModuleFilenameTemplate，以匹配源代码的 url。

（仅限行） - source map 被简化为每行一个映射。这通常意味着每个语句只有一个映射（假设你使用这种方式）。这会妨碍你在语句级别上调试执行，也会妨碍你在每行的一些列上设置断点。与压缩后的代码组合后，映射关系是不可能实现的，因为压缩工具通常只会输出一行。

对于开发环境
以下选项非常适合开发环境：

eval - 每个模块都使用 eval() 执行，并且都有 //@ sourceURL。此选项会非常快地构建。主要缺点是，由于会映射到转换后的代码，而不是映射到原始代码（没有从 loader 中获取 source map），所以不能正确的显示行数。

eval-source-map - 每个模块使用 eval() 执行，并且 source map 转换为 DataUrl 后添加到 eval() 中。初始化 source map 时比较慢，但是会在重新构建时提供比较快的速度，并且生成实际的文件。行数能够正确映射，因为会映射到原始代码中。它会生成用于开发环境的最佳品质的 source map。

eval-cheap-source-map - 类似 eval-source-map，每个模块使用 eval() 执行。这是 "cheap(低开销)" 的 source map，因为它没有生成列映射(column mapping)，只是映射行数。它会忽略源自 loader 的 source map，并且仅显示转译后的代码，就像 eval devtool。

eval-cheap-module-source-map - 类似 eval-cheap-source-map，并且，在这种情况下，源自 loader 的 source map 会得到更好的处理结果。然而，loader source map 会被简化为每行一个映射(mapping)。

详见：

<a href="https://webpack.docschina.org/configuration/devtool/#root">https://webpack.docschina.org/configuration/devtool/#root</a>
