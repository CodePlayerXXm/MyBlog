---
title: AutoGPT 实现一个智能体
group: AI
layout: doc
date: 2024-05-30T01:49:02.350Z
tags: [AI]
summary: 简介 AutoGPT
sidebar: true
---


## 1、功能描述

<img src="/images/ai/agent-overview.png" width="700" />

设计一个 Agent，自动选择使用以下工具回答用户的问题：

- 查看目录下的文件
- 基于给定的文档回答用户问题
- 查看与分析 Excel 文件
- 撰写文档
- 调用 Email 客户端发邮件


## 2、演示用例

实验中使用三个文档演示 Agent 的能力

./data
 |__2023年8月-9月销售记录.xlsx
 |__供应商名录.xlsx
 |__供应商资格要求.pdf
文档内容示例

<img src="/images/ai/doc1.png" width="700" />

<img src="/images/ai/doc2.png" width="700" />

<img src="/images/ai/doc3.png" width="700" />


测试输入举例

- 9 月份的销售额是多少
- 销售总额最大的产品是什么
- 帮我找最近一个月出销售额不达标的供应商
- 给对方发一封邮通知此事
- 对比 8 月和 9 月销售情况，写一份报告


## 3、核心模块流程图


<img src="/images/ai/agent-flowchart.png" width="700" />


## 4、吴恩达推荐的4种 Agent 设计范式

1. **Reflection（反思）**：类似于AI的自我纠错和迭代。例如，AI系统会检查自己编写的代码，并提出修改建议。

2. **Tool Use（工具使用）**：大语言模型调用插件，扩展了其能力。例如，使用Copilot进行联网搜索或调用代码插件解决数理逻辑问题。

3. **Planning（规划）**：AI根据用户输入的任务，拆解流程、选择工具、调用、执行并输出结果。例如，根据一张图片中的姿态生成一张新图片，并进行描述。

4. **Multi-agent（多智能体协作）**：多个Agent协作完成任务，每个Agent可能扮演不同的角色，如CEO、产品经理或程序员。这种模式模拟了现实生活中的工作场景，能够处理复杂系统处理复杂系统

<div class="alert alert-success">
<b>划重点：</b>实际生产中，往往要结合以上多种方法完成复杂任务。
</div>


