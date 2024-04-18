---
title: Semantic Kernel
group: AI
layout: doc
date: 2024-03-22T01:19:04.820Z
tags: [AI]
summary: 微软搞大语言模型开发的框架
sidebar: true
---

## 大语言模型开发框架的价值

功能：

* 第三方能力抽象。比如 LLM、向量数据库、搜索引擎等
* 常用工具、方案封装
* 底层实现封装。比如流式接口、超时重连、异步与并行等

举例：

- 与外部功能解依赖
  - 比如可以随意更换 LLM 而不用大量重构代码
  - 更换三方工具也同理
- 经常变的部分要在外部维护而不是放在代码里
  - 比如 Prompt 模板
- 各种环境下都适用
  - 比如线程安全
- 方便调试和测试
  - 至少要能感觉到用了比不用方便吧
  - 合法的输入不会引发框架内部的报错

## Semantic Kernel

1. Semantic Kernel 是微软研发的一个开源的，面向大模型的开发框架（SDK）；
2. 它支持你用不同开发语言（C#/Python/Java）基于 OpenAI API/Azure OpenAI API/Huggingface 开发大模型应用；
3. 它封装了一系列开箱即用的工具，包括：提示词模板、链式调用、规划能力等。


### SK的生态位

微软将此技术栈命名为 Copilot Stack。

<img src="/images/ai/copilot-stack.png" alt="SK 的生态位" width="700"/>

解释：

- Plugin extensibility: 插件扩展
- Copilots: AI 助手（副驾驶），例如 GitHub Copilot、Office 365 Copilot、Windows Copilot
- AI orchestration: AI 编排，SK 就在这里
- Foundation models: 基础大模型，例如 GPT-4
- AI infrastructure: AI 基础设施，例如 PyTorch、GPU


SK 是个野心勃勃的项目，它希望：

1. 让开发者更容易的把 LLM 的能力集成到应用中，像调用函数一样简单
2. 让 Prompt 构成的「函数」（Semantic Function，见下文）与原生函数之间，可以很方便的互相嵌套调用
3. 让开发者开发的 LLM 能力与应用解耦，高度可复用
4. 让开发者能与微软的整个 Copilot 生态紧密结合，互相提供养料

### SK的基础架构
<br/>

<img src="/images/ai/mind-and-body-of-semantic-kernel.png" alt="SK 的架构" width="700"/>

解释：

- Models and Memory: 类比为大脑
- Connectors: 用来连接各种外部服务，类似驱动程序
- Plugins: 用来连接内部技能
- Triggers and actions: 外部系统的触发器和动作，类比为四肢

说明：

- Sematic Kernel 通过 **Kernel** 链接 LLM 与 **Functions**（功能）:
- Semantic Functions：通过 Prompt 实现的 LLM 能力
- Native Functions: 编程语言原生的函数功能

在 SK 中，一组 Function 组成一个技能（Skill/Plugin）。要运行 Skill/Plugin，需要有一个配置和管理的单元，这个组织管理单元就是 Kernel。

Kernel 负责管理底层接口与调用顺序，例如：OpenAI/Azure OpenAI 的授权信息、默认的 LLM 模型选择、对话上下文、技能参数的传递等等。


## 写代码


### Hello World



```Python

import semantic_kernel as sk
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion

import asyncio

# 加载 .env 到环境变量
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())

# 创建 semantic kernel, 启动操作系统
kernel = sk.Kernel()

api_key, org_id = sk.openai_settings_from_dot_env()
service_id="chat-gpt"

kernel.add_service(
  OpenAIChatCompletion(
    service_id=service_id,
    ai_model_id="gpt-3.5-turbo",
    api_key=api_key,
    org_id=org_id
  )
)

# Define the request settings
req_settings = kernel.get_service(service_id).get_prompt_execution_settings_class()(service_id=service_id)
req_settings.max_tokens = 2000
req_settings.temperature = 0.1
req_settings.top_p = 0.8

input_text = input('请输入内容: ')

## 安装应用程序
prompt = f"给我讲个关于{input_text}的笑话吧"

prompt_template_config = sk.PromptTemplateConfig(
  template=prompt,
  name="tldr",
  template_format="semantic-kernel",
  execution_settings=req_settings,
)

function = kernel.create_function_from_prompt(
  function_name="my_function",
  plugin_name="my_plugin",
  prompt_template_config=prompt_template_config,
)


# Run your prompt
# Note: functions are run asynchronously
async def main():
  result = await kernel.invoke(function)
  print(result) # => Robots must not harm humans.

asyncio.run(main())

```

### Semantic Functions

Semantic Functions 是纯用数据（Prompt + 配置文件）定义的，不需要编写任何代码。所以它与编程语言无关，可以被任何编程语言调用。

一个典型的 semantic function 包含两个文件：

- skprompt.txt: 存放 prompt，可以包含参数，还可以调用其它函数
- config.json: 存放配置，包括函数功能，参数的数据类型，以及调用大模型时的参数

举例：根据用户的自然语言指示，生成 Linux 命令

**skprompt.txt**

```
已知数据库结构为：
#```
CREATE TABLE Courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    instructor VARCHAR(255) NOT NULL
);
#```
请将下述用户输入转为SQL表达式
用户输入：{{$input}}

直接输出SQL语句，不要评论，不要分析，不要Markdown标识!

```
**config.json**

```JSON

{
    "schema": 1,
    "type": "completion",
    "description": "将用户的输入转换成 SQL 语句",
    "completion": {
        "max_tokens": 256,
        "temperature": 0,
        "top_p": 0,
        "presence_penalty": 0,
        "frequency_penalty": 0
    },
    "input": {
        "parameters": [
            {
                "name": "input",
                "description": "用户的输入",
                "defaultValue": ""
            }
        ]
    }
}

```
- type 只有 "completion" 和 "embedding" 两种
