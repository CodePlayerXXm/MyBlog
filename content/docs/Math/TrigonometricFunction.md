---
title: 三角函数与其他
group: 数学
layout: doc
date: 2024-04-18T14:42:54.668Z
tags: [数学, 3D数学]
sidebar: true
summary: 三角函数和一些其他的基础知识
---

## 求知和求积的表示法

<br/>

### 求和


::: info
$$
\LARGE\sum_{i=1}^{6} = a1 + a2 + a3 + a4 + a5 + a6
$$
:::


i=几表示从几开始累加，西格玛符右侧还可以添加表达式如：

::: info
$$
\Large\sum_{i=1}^{6}(2i) =  2\cdot a1 + 2\cdot a2 + 2\cdot a3 + 2\cdot a4 + 2\cdot a5 + 2\cdot  a6
$$
:::

则表示每次累加前乘以2.


### 求积

::: info
$$
\LARGE\prod_{i=1}^{6} = a1 \cdot a2 \cdot a3 \cdot a4 \cdot a5 \cdot a6
$$
:::

同求和

##  区间符号


::: info 闭区间
$$
\LARGE[a,b] \Rightarrow a<= x <= b
$$
:::

也叫包含区间。也可以表示为二维空间的一个点

::: info 开区间
$$
\LARGE(a,b) \Rightarrow a < x < b
$$
:::

也叫排除区间。也可以表示二维空间的一个向量

::: info 半开区间
$$
\LARGE(a,b] \Rightarrow a < x <= b
$$

$$
\LARGE[a,b) \Rightarrow a <= x < b
$$
:::

如果某个端点是无限的，可以认为这个端点是开放的。如所有的非负数集合

::: info
$$
\LARGE[0, \infty)
$$
:::

## 三角函数

在单位圆中，$\Huge\theta$ 为坐标点与原点连线和+x的夹角，有以下关系



::: info
$$
\LARGE\sin\theta = x  ,  \LARGE\cos\theta = y
$$

$$
\LARGE\sec\theta = \LARGE \tfrac{1}{\cos\theta}  ,  \LARGE \csc\theta = \LARGE  \tfrac{1}{\sin\theta}
$$

$$
\LARGE\tan\theta = \LARGE\tfrac{\sin\theta}{\cos\theta}  ,  \LARGE\cot\theta = \LARGE\tfrac{1}{\tan\theta} = \LARGE\tfrac{\cos\theta}{\sin\theta}
$$
:::


如果不是单位圆，则有以下关系

::: info
$$
\LARGE\cos\theta = \LARGE\tfrac{x}{r}  ,  \LARGE\sin\theta = \LARGE\tfrac{y}{r}
$$

$$
\LARGE\sec\theta = \LARGE\tfrac{r}{x}  ,  \LARGE\csc\theta = \LARGE\tfrac{r}{y}
$$

$$
\LARGE\tan\theta = \LARGE\tfrac{y}{x}  ,  \LARGE\cot\theta = \LARGE\tfrac{x}{y}
$$
:::

### 一些公式

根据上面的公式简单带入一下，可得

:::info 与对称性相关的恒等式
$$
\LARGE\sin(-\theta) = \LARGE-\sin\theta  ,  \LARGE\cos(-\theta) = \LARGE\cos\theta
$$

$$
\LARGE\sin(\tfrac{\pi}{2}-\theta) = \LARGE\cos\theta  ,  \LARGE\cos(\tfrac{\pi}{2}-\theta) = \LARGE\sin\theta
$$

$$
\LARGE\tan(-\theta) = \LARGE-\tan\theta  ,  \LARGE\tan(\tfrac{\pi}{2}-\theta) = \LARGE\cot\theta
$$
:::

勾股定理也叫

:::info 毕达哥拉斯定理
$$
\LARGE a^2 + b^2 = c^2
$$
:::

:::info 毕达哥拉斯恒等式
$$
\LARGE \sin^2\theta + \cos^2\theta = 1
$$
$$
\LARGE 1 + \tan^2\theta = \sec^2\theta
$$
$$
\LARGE 1 + \cot^2\theta = \csc^2\theta
$$
:::

用勾股定理带入一下可得


:::info 证明 $\sin^2\theta + \cos^2\theta = 1$
$$
\LARGE\sin^2\theta = \LARGE\tfrac{a^2}{c^2}
$$
$$
\LARGE\cos^2\theta = \LARGE\tfrac{b^2}{c^2}
$$
$$
\LARGE\tfrac{a^2}{c^2} + \LARGE\tfrac{b^2}{c^2} = 1
$$
$$
\LARGE\tfrac{c^2}{c^2} = 1
$$
:::

其他同理

:::info 和或差恒等式
$$
\LARGE \sin (a + b) = \sin a \cos b  + \cos a \sin b
$$
$$
\LARGE \sin (a - b) = \sin a \cos b  - \cos a \sin b
$$
$$
\LARGE \cos (a + b) = \cos a \cos b  - \sin a \sin b
$$
$$
\LARGE \cos (a - b) = \cos a \cos b  + \sin a \sin b
$$
$$
\LARGE \tan (a + b) = \tfrac{\tan a + \tan b}{ 1 - \tan a \tan b }
$$
$$
\LARGE \tan (a - b) = \tfrac{\tan a - \tan b}{ 1 + \tan a \tan b }
$$
:::

证明 $\LARGE \sin (a + b)$， $\LARGE \cos (a + b)$:

<img src="/images/trigonometricFunction/A.png" width="700"/>

证明 $\LARGE \sin (a - b)$:

<img src="/images/trigonometricFunction/B.png" width="700"/>

证明 $\LARGE \cos (a - b)$:

<img src="/images/trigonometricFunction/C.png" width="700"/>

证明 $\LARGE \tan (a + b) = \tfrac{\tan a + \tan b}{ 1 - \tan a \tan b }$

<img src="/images/trigonometricFunction/D.png" width="700"/>

$\LARGE \tan (a - b) = \tfrac{\tan a - \tan b}{ 1 + \tan a \tan b }$ 同理

:::info 等腰三角形恒等式
$$
\LARGE \sin 2\theta = 2\sin\theta\cos\theta
$$
$$
\LARGE \cos 2\theta = \cos^2 \theta - \sin^2 \theta = 2\cos^2 \theta - 1 = 1- 2\sin^2\theta
$$
$$
\LARGE \tan 2\theta = \tfrac{2\tan \theta}{ 1 + \tan^2\theta }
$$
:::

$\LARGE \cos 2\theta$ 用 $\LARGE \cos ^ 2\theta + \sin ^ 2\theta = 1$ 带入一下可得

:::info 正弦定理
$$
\LARGE \tfrac{\sin A}{ a } = \tfrac{\sin B}{ b } =\tfrac{\sin C}{ c }
$$
:::

:::info 余弦定理
$$
\LARGE a^2 = b^2 + c^2 -2bc\cos A
$$
$$
\LARGE b^2 = a^2 + c^2 -2ac\cos B
$$
$$
\LARGE c^2 = a^2 + b^2 -2ab\cos C
$$
:::

正弦定理证明：

<img src="/images/trigonometricFunction/E.jpg" width="700"/>

余弦定理证明：

<img src="/images/trigonometricFunction/F.webp" width="700"/>
