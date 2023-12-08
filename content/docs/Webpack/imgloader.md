---
title: Webpack 图片等资源的处理
group: Webpack
layout: doc
date: 2021-1-02T13:54:36+08:00
tags: [Webpack]
sidebar: true
summary:  url-loader img-loader
---

如果打完包之后图片的路径错误，调试各个 loader 的 publicPath 可以修正。

webpack.config.js

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  target: "web",
  entry: {
    index: "./app.js",
    // index: ["babel-polyfill", "/app.js"],
  },
  output: {
    filename: "[name].[hash:8].bundle.js", //name是entry的键明——index
    // publicPath: "../", //css,js（head标签内）等引入的资源的统一的路径
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../", //把css里的图片等资源url加上../
            },
          },
          {
            loader: "css-loader",
            options: {
              // url: false,
            },
          },

          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "[name].[hash:8].[ext]",
              outputPath: "assets/img", //打包后的图片放在哪
              // publicPath: "assets/img", //图片文件名前的统一路径，加了之后无论是css还是HTML里都会加
              limit: 5000, //设置图片转base64的阈值
            },
          },
          {
            loader: "img-loader",
            options: {
              plugins: [
                require("imagemin-gifsicle")({
                  optimizationLevel: 1, //1-3越大压缩越厉害
                }),
                require("imagemin-mozjpeg")({
                  quality: 80, //1-100越小压缩越厉害
                }),
                require("imagemin-pngquant")({
                  speed: 2, //1-11越小压缩越厉害
                }),
              ],
            },
          },
        ],
      },
      {
        test: /\.html$/i,
        use: {
          loader: "html-loader",
        },
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
      favicon: "./assets/img/aaa.jpg",
      meta: {
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
      },
      hash: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devtool: "eval-cheap-module-source-map",
  devServer: {
    hot: true,
    hotOnly: true, //只要热更新，不要living loading（自动刷新浏览器）；
    overlay: { errors: true },
    // inline: false,
    // historyApiFallback: true,
    historyApiFallback: {
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
