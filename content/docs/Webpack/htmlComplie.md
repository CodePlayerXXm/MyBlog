---
title: Webpack html编译
group: Webpack
layout: doc
date: 2021-1-02T13:54:36+08:00
tags: [Webpack]
sidebar: true
summary:  HtmlWebpackPlugin
---

# css 中的图片引入 url-loader

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
    new MiniCssExtractPlugin({ filename: "./css/[name].min.css" }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./index.html",
      favicon: "./aaa.jpg",
      meta: {
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
      },
      hash: true,
    }),
  ],
};
```
