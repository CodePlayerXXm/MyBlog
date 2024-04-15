---
title: 笛卡尔坐标系
group: 数学
layout: doc
date: 2024-04-14T15:04:31.795Z
tags: [数学, 3D数学]
sidebar: true
summary: 一些三维笛卡尔坐标系相关的知识
---

## 二维坐标系

<img src='/images/Math/CartesianCoordinateSystem/A.jpg' />

二维坐标系共有8种表现形式，但都可以通过翻转，镜像翻转使他们相等，但是在三位坐标系中不是这样。

## 三维坐标系

## 左右手空间坐标系

三维空间坐标系，可以用左右手两个不同类型来分类。拇指-> +x，食指-> +y，中指-> +z。

<img src='/images/Math/CartesianCoordinateSystem/B.jpg' />

左右手坐标系，共有48种形式，左右分别24种。

## 正负向旋转的约定

<img src='/images/Math/CartesianCoordinateSystem/C.jpg' />


|  从哪个方向看向原点   | 正向旋转<br/>左手：顺时针方向<br/>右手：逆时针方向  | 负向旋转<br/>左手：逆时针方向<br/>右手：顺时针方向 |
|  ----  | ----  | ---- |
| +x  | +y -> +z -> -y -> -z -> +y | +y -> -z -> -y -> +z -> +y |
| +y  | +z -> +x -> -z -> -x -> +z | +z -> -x -> -z -> +x -> +z |
| +z  | +x -> +y -> -x -> -y -> +x | +x -> -y -> -x -> +y -> +x |

## 书中约定

以+x为东，+y为上，+z为北。

<img src='/images/Math/CartesianCoordinateSystem/D.jpg' />
