---
title: 矢量（向量）
group: 数学
layout: doc
date: 2024-04-14T15:04:31.795Z
tags: [数学, 3D数学]
sidebar: true
summary: 矢量（向量）相关的知识
---


## 矢量的表示方法

:::info 行向量
$$
\LARGE \left[ 1, 2, 3 \right]
$$
:::

:::info 列向量
$$
\LARGE \left[\begin{array}{cc} 1 \\ 2 \\ 3 \end{array} \right]
$$
:::

:::info 向量下标表示法
$$
\LARGE  a = \left[\begin{array}{cc} 1 \\ 2 \end{array} \right]
$$
$$
\LARGE  a_1 = a_x = 1,
$$
$$
\LARGE  a_2 = a_y = 2
$$

$$
\LARGE  b = \left[\begin{array}{cc} 1 \\ 2 \\ 3 \end{array} \right]
$$
$$
\LARGE b_1 = b_x = 1,
$$
$$
\LARGE b_2 = b_y = 2,
$$
$$
\LARGE b_3 = b_z = 3
$$

$$
\LARGE  c = \left[\begin{array}{cc} 1 \\ 2 \\ 3 \\ 4 \end{array} \right]
$$
$$
\LARGE  c_1 = c_x = 1,
$$
$$
\LARGE  c_2 = c_y = 2,
$$
$$
\LARGE  c_3 = c_z = 3,
$$
$$
\LARGE  c_4 = c_w = 4
$$

:::

:::info 负向量的转化
$$
\LARGE - \left[\begin{array}{cc} a_1 \\ a_2 \\ a_3 \\ ... \\ a_{n-1} \\ a_n \end{array} \right] = \left[\begin{array}{cc} -a_1 \\ -a_2 \\ -a_3 \\ ... \\ -a_{n-1} \\ -a_n \end{array} \right]
$$
:::

## 标量和矢量乘法

:::info 标量乘以矢量
$$
\LARGE k\begin{bmatrix} a_1\\a_2\\...\\a_{n-1}\\a_{n}\end{bmatrix} = \begin{bmatrix} ka_1\\ka_2\\...\\ka_{n-1}\\ka_{n}\end{bmatrix}
$$
:::

:::info 矢量除以标量
$$
\LARGE \frac{1}{k} \begin{bmatrix} a_1\\a_2\\...\\a_{n-1}\\a_{n}\end{bmatrix} = \begin{bmatrix} \frac{a_1}{k}\\\frac{a_2}{k}\\...\\ \frac{a_{n-1}}{k} \\ \frac{a_n}{k}\end{bmatrix}
$$
:::


## 矢量间的加减法


:::info 矢量间的加法
$$
\LARGE \begin{bmatrix} a_1\\a_2\\...\\a_{n-1}\\a_{n}\end{bmatrix} + \begin{bmatrix} b_1\\b_2\\...\\b_{n-1}\\b_{n}\end{bmatrix} = \begin{bmatrix} a_1 + b_1\\ a_2 + b_2 \\ ...\\ a_{n-1} + b_{n-1} \\ a_{n} + b_{n}\end{bmatrix}
$$
:::

减法可以看作是加上一个负矢量

### 几何解释

<img src="/images/Math/Vector/A.jpg" width="700" />

## 使用点积的几何定义证明余弦定理

余弦定理是平面三角形中一个重要的定理，表述为一个三角形中任意一边的平方等于其他两边平方和减去这两边乘积的两倍再乘以它们夹角的余弦值。用数学公式表示就是：
$$
\LARGE c^2 = a^2 + b^2 - 2ab \cos \theta
$$
其中 $\LARGE a, b, c $ 分别是三角形的三条边，$\LARGE \theta$ 是边 $\LARGE a$ 和边 $\LARGE b$ 所夹的角。下面我们利用向量和点积的几何定义来证明余弦定理。

**定义和定理准备：**
1. 向量的点积定义：对于两个向量 $\LARGE \mathbf{u}$ 和  $\LARGE \mathbf{v}$，它们的点积定义为 $\LARGE \mathbf{u} \cdot \mathbf{v} = |\mathbf{u}| |\mathbf{v}| \cos \theta$，其中 $\LARGE \theta$ 是这两个向量之间的夹角，$\LARGE |\mathbf{u}|$ 和 $\LARGE |\mathbf{v}|$ 分别是这两个向量的模长。

2. 平面上的一个三角形，设三个顶点为 $\LARGE A, B, C$，其中 $\LARGE \overrightarrow{AB}$ 和 $\LARGE \overrightarrow{AC}$ 分别是从点 $\LARGE A$ 指向点 $\LARGE B$ 和 $\LARGE C$ 的向量。

**证明步骤：**
1. 我们考虑向量 $\LARGE \overrightarrow{AB}$ 和 $\LARGE \overrightarrow{AC}$。设边 $\LARGE AB = a$，边 $\LARGE AC = b$，边 $\LARGE BC = c$，并设 $\LARGE \angle BAC = \theta$。

2. 使用向量的点积，我们有：
   $\LARGE \overrightarrow{AB} \cdot \overrightarrow{AC} = |\overrightarrow{AB}| |\overrightarrow{AC}| \cos \theta = ab \cos \theta$

3. 根据向量的差，$\LARGE \overrightarrow{BC} = \overrightarrow{AC} - \overrightarrow{AB}$。计算 $\LARGE \overrightarrow{BC}$ 的模长（即 $\LARGE c$）的平方：
   $\LARGE
   |\overrightarrow{BC}|^2 = (\overrightarrow{AC} - \overrightarrow{AB}) \cdot (\overrightarrow{AC} - \overrightarrow{AB})
   $
   展开上述点积，得到：
   $\LARGE
   |\overrightarrow{BC}|^2 = \overrightarrow{AC} \cdot \overrightarrow{AC} - 2 \overrightarrow{AC} \cdot \overrightarrow{AB} + \overrightarrow{AB} \cdot \overrightarrow{AB}
   $
   根据向量的模长和点积，我们有：
   $\LARGE
   c^2 = b^2 - 2ab \cos \theta + a^2
   $

4. 整理上述公式，得到余弦定理：
   $\LARGE
   c^2 = a^2 + b^2 - 2ab \cos \theta
   $

因此，使用向量和点积的几何定义，我们得到了余弦定理的证明。这种证明方式简洁明了，完全基于向量运算和点积的几何含义。
