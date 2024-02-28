---
title: Python 基础数据类型和变量
group: Python
layout: doc
date: 2024-02-21T07:23:00.452Z
tags: [Python]
sidebar: true
summary: Python基础
---

## 数据类型

* Number（数字）
* String（字符串）
* bool（布尔类型）
* List（列表）
* Tuple（元组）
* Set（集合）
* Dictionary（字典）

不可变数据（3 个）：Number（数字）、String（字符串）、Tuple（元组）；<br/>
可变数据（3 个）：List（列表）、Dictionary（字典）、Set（集合）。

### Number（数字）

  Python3 支持 int、float、bool、complex（复数）。

  #### int

  Python允许在数字中间以_分隔，因此，写成10_000_000_000和10000000000是完全一样的。十六进制数也可以写成0xa1b2_c3d4。

  #### float

  用科学计数法表示，把10用e替代，1.23x109就是1.23e9，或者12.3e8，0.000012可以写成1.2e-5。

### 字符串

  * 转义字符\可以转义很多字符，比如\n表示换行，\t表示制表符，字符\本身也要转义，所以\\\表示的字符就是\
  * 如果字符串里面有很多字符都需要转义，就需要加很多\，为了简化，Python还允许用r''表示''内部的字符串默认不转义
  * 如果字符串内部有很多换行，用\n写在一行里不好阅读，为了简化，Python允许用'''...'''的格式表示多行内容
  * 多行字符串'''...'''还可以在前面加上r，实现不转义
  * 字符串的截取的语法格式如下：变量[头下标:尾下标:步长]
  * 可用* 数字输出字符串多次

```Python

print('I\'m ok.')
# I'm ok.
print('I\'m learning\nPython.')
# I'm learning
# Python.
print('\\\n\\')
# \
# \


print('\\\t\\')
# \       \
print(r'\\\t\\')
# \\\t\\


print('''line1
  line2
  line3''')
# line1
# line2
# line3


print(str[0:-1])
# 输出第一个到倒数第二个的所有字符
print(str[2:])
# 输出从第三个开始之后的所有字符
print(str[:2])
# 输出从第三个开始之前的所有字符
print(str[1:5:2])
# 输出从第二个开始到第五个且每隔一个的字符（步长为2）
print(str * 2)
# 输出字符串两次

```

### 布尔值

  * True、False要大写
  * bool 是 int 的子类，True 和 False 可以和数字相加， True==1、False==0 会返回 True，但可以通过 is 来判断类型。

```Python

issubclass(bool, int)
# True

True==1
# True

False==0
# True

True+1
# 2

False+1
# 1

1 is True
# False

0 is False
# False

```

### 逻辑运算符

  and、or和not

### 数值运算

* / 除法，得到一个浮点数
* // 除法，得到一个整数(向下取整)
* \*\* 乘方
* 在混合计算时，Python会把整型转换成为浮点数。

### 空值

  空值是Python里一个特殊的值，用None表示。None不能理解为0，因为0是有意义的，而None是一个特殊的空值。

## 变量

  变量名必须是大小写英文、数字和_的组合，且不能用数字开头


### 常量

  * 在Python中，通常用全部大写的变量名表示常量， 比如PI (π) 。
  * 但事实上PI仍然是一个变量，Python根本没有任何机制保证PI不会被改变，所以，用全部大写的变量名表示常量只是一个习惯上的用法，如果你一定要改变变量PI的值，也没人能拦住你。


### 赋值

  * Python允许你同时为多个变量赋值。
  * 也可以为多个对象指定多个变量

```Python

a = b = c = 1
# a = 1
# b = 1
# c = 1

a, b, c = 1, 2, "runoob"
# a = 1
# b = 2
# c = "runoob"

```
