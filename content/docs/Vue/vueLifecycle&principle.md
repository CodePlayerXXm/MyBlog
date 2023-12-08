---
title: Vue内部运行机制及生命周期
group: Vue
layout: doc
date: 2021-1-02T13:54:36+08:00
tags: [Vue]
sidebar: true
summary:  Vue内部运行机制、及各生命周期的不同。
---

# Vue 内部运行机制及生命周期

## Vue 内部运行机制

<img style="display:table;margin:auto" src="/images/principle.jpg" />

### 初始化与挂载

<img style="display:table;margin:auto" src="/images/principle1.jpg" />

### 模板编译

<img style="display:table;margin:auto" src="/images/principle2.jpg" />

<font color="color:#ff0000">\* **抽象语法树是 JSON 格式的对象**</font>

### 数据响应

<img style="display:table;margin:auto" src="/images/principle3.jpg" />

### 更新视图

<img style="display:table;margin:auto" src="/images/principle4.jpg" />

## Vue 生命周期

### 完整的生命周期流程

<img style="display:table;margin:auto" src="/images/lifecycle.png" />

### 各生命周期 el 与 data 的不同

<img style="display:table;margin:auto" src="/images/lifecycle1.jpg" />

### 各生命周期详解

<img style="display:table;margin:auto" src="/images/lifecycle2.jpg" />

<img style="display:table;margin:auto" src="/images/lifecycle3.jpg" />

<img style="display:table;margin:auto" src="/images/lifecycle4.jpg" />

### 代码示例

```javascript
<script type="text/javascript">
    window.onload = function() {
        var vm = new Vue({
            el: '#app',
            data: {
                myText: '我是生命周期！',
            },
            beforeCreate () {
                console.log('==============' + 'beforeCreated' + '===================')
                console.log(this.$el)
                console.log(this.$data)
            },
            created () {
                console.log('==============' + 'created' + '===================')
                console.log(this.$el)
                console.log(this.$data)
            },
            beforeMount () {
                console.log('==============' + 'beforeMount' + '===================')
                console.log(this.$el)
                console.log(this.$data)
            },
            mounted () {
                console.log('==============' + 'mounted' + '===================')
                console.log(this.$el)
                console.log(this.$data)
            },
            beforeUpdate () {
                debugger
                console.log('==============' + 'beforeUpdate' + '===================')
                console.log(this.$el)
                console.log(this.$data)
                console.log(this.$el.innerHTML)
                console.log(document.getElementById('myText').innerText)
                debugger
            },
            updated () {
                console.log('==============' + 'updated' + '===================')
                console.log(this.$el)
                console.log(this.$data)
                console.log(this.$el.innerHTML)
                console.log(document.getElementById('myText').innerText)
            },
            beforeDestroy () {
                console.log('==============' + 'beforeDestroy' + '===================')
                console.log(this.$el)
                console.log(this.$data)
            },
            destroyed () {
                console.log('==============' + 'destroyed' + '===================')
                console.log(this.$el)
                console.log(this.$data)
            }
        })

    }
</script>

<div id="app">
    <input type="text" v-model="myText">
    <div id="myText">{{myText}}</div>
</div>

```

运行结果：

<img style="display:table;margin:auto" src="/images/lifecycleResult.jpg" />

<font color="color:#ff0000">\* **注意 beforeMount 和 mounted 的\$el 中占位符的替换。**</font>

修改 data 中的数据：

<img style="display:table;margin:auto" src="/images/lifecycleResult2.jpg" />

<font color="color:#ff0000">\* **注意$el和$data 的打印，update 前后是一样的，而真实 DOM 中的却不一样。查阅原因似乎是\$el 是虚拟 DOM，本质是一个对象，栈中存放的是内存地址的指针。而 console.log 的特性是在点击输出结果前面的箭头之前，其实里面是没有内容的，当点击时才会根据这个指针去寻找结果然后显示，所以当点击时已经是 updated 生命周期了。所以使用真实 DOM 才会显示的正确的结果。**</font>

<img style="display:table;margin:auto" src="/images/debugger.jpg" />

通过 debugger 断点查看得到了正确的结果。
