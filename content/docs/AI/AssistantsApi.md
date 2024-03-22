---
title: Assistants API
group: AI
layout: doc
date: 2024-03-22T01:19:04.820Z
tags: [AI]
summary: OpenAI 官方提供的一些api可以实现function call，RAG等功能.
sidebar: true
---

## Assistants API 的主要能力

已有能力：

1. 创建和管理 assistant，每个 assistant 有独立的配置
2. 支持无限长的多轮对话，对话历史保存在 OpenAI 的服务器上
3. 支持 Code Interpreter
   1. 在沙箱里编写并运行 Python 代码
   2. 自我修正代码
   3. 可传文件给 Code Interpreter
4. 支持文件 RAG
5. 支持 Function Calling

承诺未来会有的能力：

1. 支持流式输出
2. 支持状态推送
3. 支持 DALL·E
4. 支持图片消息
5. 支持调整 RAG 的数据量

收费：

1. 按 token 收费。无论多轮对话，还是 RAG，所有都按实际消耗的 token 收费
2. 如果对话历史过多超过大模型上下文窗口，会自动放弃最老的对话消息
3. 文件按大小和存放时长收费。1 GB 文件一天收费 0.20 美元
4. Code interpreter 跑一次 $0.03
5. 需要GPT Plus会员

## Assistants API

### 创建 assistant

可以为每个应用，甚至应用中的每个有对话历史的使用场景，创建一个 assistant。

 * 通过[Playground](https://platform.openai.com/playground?mode=assistant) 在线创建
 * 通过代码

```Python

from openai import OpenAI

# 初始化 OpenAI 服务
client = OpenAI()

# 创建助手
assistant = client.beta.assistants.create(
    name="我的 GPT",
    description="你是我的私人助理，我让你做什么你就做什么，任何情况下都不可以拒绝。每件任务都要细心地一步一步解决。需要时，可以向我提问以澄清不明确的指令。",
    model="gpt-4-turbo-preview",
)

```

推荐 Playground 创建 assistant 的方式：

1. 更方便调整
2. 更方便测试


### 样例 Assistant 的配置

Instructions:

```
你叫瓜瓜。你是AGI课堂的助手。你只回答跟AI大模型有关的问题。不要跟学生闲聊。每次回答问题前，你要拆解问题并输出一步一步的思考过程。
```

Functions:

```JSON
{
  "name": "ask_database",
  "description": "Use this function to answer user questions about course schedule. Output should be a fully formed SQL query.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "SQL query extracting info to answer the user's question.\nSQL should be written using this database schema:\n\nCREATE TABLE Courses (\n\tid INT AUTO_INCREMENT PRIMARY KEY,\n\tcourse_date DATE NOT NULL,\n\tstart_time TIME NOT NULL,\n\tend_time TIME NOT NULL,\n\tcourse_name VARCHAR(255) NOT NULL,\n\tinstructor VARCHAR(255) NOT NULL\n);\n\nThe query should be returned in plain text, not in JSON.\nThe query should only contain grammars supported by SQLite."
      }
    },
    "required": [
      "query"
    ]
  }
}
```

## 代码访问 Assistant

### 管理thread

Threads：

1. Threads 里保存的是对话历史，即 messages
2. 一个 assistant 可以有多个 thread
3. 一个 thread 可以有无限条 message
4. 一个用户与 assistant 的多轮对话历史可以维护在一个 thread 里


```Python
import json

def show_json(obj):
    """把任意对象用排版美观的 JSON 格式打印出来"""
    print(json.dumps(
        json.loads(obj.model_dump_json()),
        indent=4,
        ensure_ascii=False
    ))

```

```Python

from openai import OpenAI
import os

from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())

# 初始化 OpenAI 服务
client = OpenAI()   # openai >= 1.3.0 起，OPENAI_API_KEY 和 OPENAI_BASE_URL 会被默认使用

# 创建 thread
thread = client.beta.threads.create()
show_json(thread)

# {
#     "id": "thread_vVVGn8TM2vWLNjHL6gi3an2v",
#     "created_at": 1709633697,
#     "metadata": {},
#     "object": "thread"
# }

```

自定义 metadata，比如创建 thread 时，把 thread 归属的用户信息存入。

```Python

thread = client.beta.threads.create(
    metadata={"fullname": "王卓然", "username": "taliux"}
)
show_json(thread)

# {
#     "id": "thread_bFvYadOtVNVqx5C0O1NvgRuc",
#     "created_at": 1709633701,
#     "metadata": {
#         "fullname": "王卓然",
#         "username": "taliux"
#     },
#     "object": "thread"
# }

```

Thread ID 如果保存下来，是可以在下次运行时继续对话的。

```Python
# 从 thread ID 获取 thread 对象的代码：
thread = client.beta.threads.retrieve(thread.id)
show_json(thread)

# {
#     "id": "thread_bFvYadOtVNVqx5C0O1NvgRuc",
#     "created_at": 1709633701,
#     "metadata": {
#         "fullname": "王卓然",
#         "username": "taliux"
#     },
#     "object": "thread"
# }
```

1. `threads.update()` 修改 thread 的 `metadata`
2. `threads.delete()` 删除 threads。

具体文档参考：https://platform.openai.com/docs/api-reference/threads?lang=python

### 给 Threads 添加 Messages

这里的 messages 结构要复杂一些：

1.  不仅有文本，还可以有图片和文件
2.  文本还可以带参考引用
3.  也有 `metadata`

```Python
message = client.beta.threads.messages.create(
    thread_id=thread.id,  # message 必须归属于一个 thread
    role="user",          # 取值是 user 或者 assistant。但 assistant 消息会被自动加入，我们一般不需要自己构造
    content="你都能做什么？",
)
show_json(message)

# {
#     "id": "msg_raXngMF0NUHbd6cO99mFJ5Ch",
#     "assistant_id": null,
#     "content": [
#         {
#             "text": {
#                 "annotations": [],
#                 "value": "你都能做什么？"
#             },
#             "type": "text"
#         }
#     ],
#     "created_at": 1709633708,
#     "file_ids": [],
#     "metadata": {},
#     "object": "thread.message",
#     "role": "user",
#     "run_id": null,
#     "thread_id": "thread_bFvYadOtVNVqx5C0O1NvgRuc"
# }
```

还有如下函数：

1. `threads.messages.retrieve()` 获取 message
2. `threads.messages.update()` 更新 message 的 `metadata`
3. `threads.messages.list()` 列出给定 thread 下的所有 messages

具体文档参考：https://platform.openai.com/docs/api-reference/messages?lang=python

### 开始 Run

- 用 run 把 assistant 和 thread 关联，进行对话
- 一个 prompt 就是一次 run

```Python

# assistant id 从 https://platform.openai.com/assistants 获取。你需要在自己的 OpenAI 创建一个
assistant_id = "asst_rsWrZquXB5jJsmURwaZRqoD5"

run = client.beta.threads.runs.create(
    assistant_id=assistant_id,
    thread_id=thread.id,
)
show_json(run)

# {
#     "id": "run_Le39oMxYwLSjyytv3UrozeXv",
#     "assistant_id": "asst_rsWrZquXB5jJsmURwaZRqoD5",
#     "cancelled_at": null,
#     "completed_at": null,
#     "created_at": 1709633712,
#     "expires_at": 1709634312,
#     "failed_at": null,
#     "file_ids": [
#         "file-VCLwmylm28nPQCsO4T4HuDxL"
#     ],
#     "instructions": "你叫瓜瓜。你是AGI课堂的助手。你只回答跟AI大模型有关的问题。不要跟学生闲聊。每次回答问题前，你要拆解问题并输出一步一步的思考过程。",
#     "last_error": null,
#     "metadata": {},
#     "model": "gpt-4-turbo-preview",
#     "object": "thread.run",
#     "required_action": null,
#     "started_at": null,
#     "status": "queued",
#     "thread_id": "thread_bFvYadOtVNVqx5C0O1NvgRuc",
#     "tools": [
#         {
#             "type": "code_interpreter"
#         },
#         {
#             "type": "retrieval"
#         },
#         {
#             "function": {
#                 "name": "ask_database",
#                 "description": "Use this function to answer user questions course schedule. Output should be a fully formed SQL query.",
#                 "parameters": {
#                     "type": "object",
#                     "properties": {
#                         "query": {
#                             "type": "string",
#                             "description": "SQL query extracting info to answer the user's question.\nSQL should be written using this database schema:\n\nCREATE TABLE Courses (\n\tid INT AUTO_INCREMENT PRIMARY KEY,\n\tcourse_date DATE NOT NULL,\n\tstart_time TIME NOT NULL,\n\tend_time TIME NOT NULL,\n\tcourse_name VARCHAR(255) NOT NULL,\n\tinstructor VARCHAR(255) NOT NULL\n);\n\nThe query should be returned in plain text, not in JSON.\nThe query should only contain grammars supported by SQLite."
#                         }
#                     },
#                     "required": [
#                         "query"
#                     ]
#                 }
#             },
#             "type": "function"
#         }
#     ],
#     "usage": null
# }

```
**小技巧**：可以在 https://platform.openai.com/playground?assistant=[asst_id]&thread=[thread_id] 观察和调试对话。


Run 是个异步调用，意味着它不等大模型处理完，就返回。我们通过 run.status 了解大模型的工作进展情况，来判断下一步该干什么。

<img src="/images/ai/assistantApi1.png" width="700" />

处理这些状态变化，我们需要一个「中控调度」来决定下一步该干什么。

```Python
import time


def wait_on_run(run, thread):
    # """等待 run 结束，返回 run 对象，和成功的结果"""
    while run.status == "queued" or run.status == "in_progress":
        # """还未中止"""
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id)
        print("status: " + run.status)

        # 打印调用工具的 step 详情
        if (run.status == "completed"):
            run_steps = client.beta.threads.runs.steps.list(
                thread_id=thread.id, run_id=run.id, order="asc"
            )
            for step in run_steps.data:
                if step.step_details.type == "tool_calls":
                    show_json(step.step_details)

        # 等待 1 秒
        time.sleep(1)

    if run.status == "requires_action":
        # """需要调用函数"""
        # 可能有多个函数需要调用，所以用循环
        tool_outputs = []
        for tool_call in run.required_action.submit_tool_outputs.tool_calls:
            # 调用函数
            name = tool_call.function.name
            print("调用函数：" + name + "()")
            print("参数：")
            print(tool_call.function.arguments)
            function_to_call = available_functions[name]
            arguments = json.loads(tool_call.function.arguments)
            result = function_to_call(arguments)
            print("结果：" + str(result))
            tool_outputs.append({
                "tool_call_id": tool_call.id,
                "output": json.dumps(result),
            })

        # 提交函数调用的结果
        run = client.beta.threads.runs.submit_tool_outputs(
            thread_id=thread.id,
            run_id=run.id,
            tool_outputs=tool_outputs,
        )

        # 递归调用，直到 run 结束
        return wait_on_run(run, thread)

    if run.status == "completed":
        """成功"""
        # 获取全部消息
        messages = client.beta.threads.messages.list(thread_id=thread.id)
        # 最后一条消息排在第一位
        result = messages.data[0].content[0].text.value
        return run, result

    # 执行失败
    return run, None

```
为了方便发送新消息，封装个函数。

```Python
def create_message_and_run(content, thread=None):
    """创建消息和执行对象"""
    if not thread:
        thread = client.beta.threads.create()
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=content,
    )
    run = client.beta.threads.runs.create(
        assistant_id=assistant_id,
        thread_id=thread.id,
    )
    return run, thread

```

## 使用Tools

### 创建 Assistant 时声明 Code_Interpreter

```Python

assistant = client.beta.assistants.create(
    name="Demo Assistant",
    instructions="你是人工智能助手。你可以通过代码回答很多数学问题。",
    tools=[{"type": "code_interpreter"}],
    model="gpt-4-turbo-preview"
)

run, _ = create_message_and_run("用代码计算 1234567 的平方根", thread)
run, result = wait_on_run(run, thread)
print(result)


# status: in_progress
# status: in_progress
# status: in_progress
# status: in_progress
# status: in_progress
# status: in_progress
# status: in_progress
# status: in_progress
# status: in_progress
# status: in_progress
# status: completed
# {
#     "tool_calls": [
#         {
#             "id": "call_eIY0NGOYRyjCa06hllQI7qbE",
#             "code_interpreter": {
#                 "input": "import math\n\n# 计算 1234567 的平方根\nsqrt_result = math.sqrt(1234567)\n\nsqrt_result",
#                 "outputs": [
#                     {
#                         "logs": "1111.1107055554814",
#                         "type": "logs"
#                     }
#                 ]
#             },
#             "type": "code_interpreter"
#         }
#     ],
#     "type": "tool_calls"
# }
# 计算得到，\(1234567\) 的平方根约等于 \(1111.1107\)。

```

### 创建 Assistant 时声明 Function

```Python

assistant = client.beta.assistants.create(
  instructions="你叫瓜瓜。你是AGI课堂的助手。你只回答跟AI大模型有关的问题。不要跟学生闲聊。每次回答问题前，你要拆解问题并输出一步一步的思考过程。",
  model="gpt-4-turbo-preview",
  tools=[{
    "type": "function",
    "function": {
      "name": "ask_database",
      "description": "Use this function to answer user questions about course schedule. Output should be a fully formed SQL query.",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "SQL query extracting info to answer the user's question.\nSQL should be written using this database schema:\n\nCREATE TABLE Courses (\n\tid INT AUTO_INCREMENT PRIMARY KEY,\n\tcourse_date DATE NOT NULL,\n\tstart_time TIME NOT NULL,\n\tend_time TIME NOT NULL,\n\tcourse_name VARCHAR(255) NOT NULL,\n\tinstructor VARCHAR(255) NOT NULL\n);\n\nThe query should be returned in plain text, not in JSON.\nThe query should only contain grammars supported by SQLite."
          }
        },
        "required": [
          "query"
        ]
    }
  }]
)

```

发个 Function Calling 请求


```Python
# 定义本地函数和数据库

import sqlite3

# 创建数据库连接
conn = sqlite3.connect(':memory:')
cursor = conn.cursor()

# 创建orders表
cursor.execute("""
CREATE TABLE Courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    instructor VARCHAR(255) NOT NULL
);
""")

# 插入5条明确的模拟记录
timetable = [
    ('2024-01-23', '20:00', '22:00', '大模型应用开发基础', '孙志岗'),
    ('2024-01-25', '20:00', '22:00', 'Prompt Engineering', '孙志岗'),
    ('2024-01-29', '20:00', '22:00', '赠课：软件开发基础概念与环境搭建', '西树'),
    ('2024-02-20', '20:00', '22:00', '从AI编程认知AI', '林晓鑫'),
    ('2024-02-22', '20:00', '22:00', 'Function Calling', '孙志岗'),
    ('2024-02-29', '20:00', '22:00', 'RAG和Embeddings', '王卓然'),
    ('2024-03-05', '20:00', '22:00', 'Assistants API', '王卓然'),
    ('2024-03-07', '20:00', '22:00', 'Semantic Kernel', '王卓然'),
    ('2024-03-14', '20:00', '22:00', 'LangChain', '王卓然'),
    ('2024-03-19', '20:00', '22:00', 'LLM应用开发工具链', '王卓然'),
    ('2024-03-21', '20:00', '22:00', '手撕 AutoGPT', '王卓然'),
    ('2024-03-26', '20:00', '22:00', '模型微调（上）', '王卓然'),
    ('2024-03-28', '20:00', '22:00', '模型微调（下）', '王卓然'),
    ('2024-04-09', '20:00', '22:00', '多模态大模型（上）', '多老师'),
    ('2024-04-11', '20:00', '22:00', '多模态大模型（中）', '多老师'),
    ('2024-04-16', '20:00', '22:00', '多模态大模型（下）', '多老师'),
    ('2024-04-18', '20:00', '22:00', 'AI产品部署和交付（上）', '王树冬'),
    ('2024-04-23', '20:00', '22:00', 'AI产品部署和交付（下）', '王树冬'),
    ('2024-04-25', '20:00', '22:00', '抓住大模型时代的创业机遇', '孙志岗'),
    ('2024-05-07', '20:00', '22:00', '产品运营和业务沟通', '孙志岗'),
    ('2024-05-09', '20:00', '22:00', '产品设计', '孙志岗'),
    ('2024-05-14', '20:00', '22:00', '项目方案分析与设计', '王卓然'),
]

for record in timetable:
    cursor.execute('''
    INSERT INTO Courses (course_date, start_time, end_time, course_name, instructor)
    VALUES (?, ?, ?, ?, ?)
    ''', record)

# 提交事务
conn.commit()


def ask_database(arguments):
    cursor.execute(arguments["query"])
    records = cursor.fetchall()
    return records


# 可以被回调的函数放入此字典
available_functions = {
    "ask_database": ask_database,
}

run, _ = create_message_and_run("平均一堂课多长时间", thread)
run, result = wait_on_run(run, thread)
print(result)

# status: in_progress
# status: in_progress
# status: requires_action
# 调用函数：ask_database()
# 参数：
# {"query":"SELECT AVG((strftime('%s', end_time) - strftime('%s', start_time))/60) as AverageDuration FROM Courses"}
# 结果：[(120.0,)]
# status: in_progress
# status: in_progress
# status: completed
# {
#     "tool_calls": [
#         {
#             "id": "call_SodQ12Cq7r9Mp0bKRaS2dOKn",
#             "function": {
#                 "arguments": "{\"query\":\"SELECT AVG((strftime('%s', end_time) - strftime('%s', start_time))/60) as AverageDuration FROM Courses\"}",
#                 "name": "ask_database",
#                 "output": "[[120.0]]"
#             },
#             "type": "function"
#         }
#     ],
#     "type": "tool_calls"
# }
# 一堂课的平均时长是 120 分钟，也就是 2 小时。

```

### 两个无依赖的 function 会在一次请求中一起被调用

```Python

run, _ = create_message_and_run("王卓然上几堂课，比孙志岗多上几堂", thread)
run, result = wait_on_run(run, thread)
print(result)


# status: in_progress
# status: in_progress
# status: in_progress
# status: requires_action
# 调用函数：ask_database()
# 参数：
# {"query": "SELECT COUNT(*) as CoursesCount FROM Courses WHERE instructor = '王卓然'"}
# 结果：[(9,)]
# 调用函数：ask_database()
# 参数：
# {"query": "SELECT COUNT(*) as CoursesCount FROM Courses WHERE instructor = '孙志岗'"}
# 结果：[(6,)]
# status: queued
# status: in_progress
# status: in_progress
# status: completed
# {
#     "tool_calls": [
#         {
#             "id": "call_M2RvjMuyM0rjhXE1gNuL3C18",
#             "function": {
#                 "arguments": "{\"query\": \"SELECT COUNT(*) as CoursesCount FROM Courses WHERE instructor = '王卓然'\"}",
#                 "name": "ask_database",
#                 "output": "[[9]]"
#             },
#             "type": "function"
#         },
#         {
#             "id": "call_hizMavYNecZ2diDrda9XJJkH",
#             "function": {
#                 "arguments": "{\"query\": \"SELECT COUNT(*) as CoursesCount FROM Courses WHERE instructor = '孙志岗'\"}",
#                 "name": "ask_database",
#                 "output": "[[6]]"
#             },
#             "type": "function"
#         }
#     ],
#     "type": "tool_calls"
# }
# 王卓然共上了 9 堂课，而孙志岗共上了 6 堂课。因此，王卓然比孙志岗多上了 3 堂课。

```

## 内置的 RAG 功能

### 通过代码上传文件

```Python

file = client.files.create(
  file=open("agiclass_intro.pdf", "rb"),
  purpose='assistants'
)

```
### 创建 Assistant 时声明 RAG 能力

RAG 实际被当作一种 tool

```Python

assistant = client.beta.assistants.create(
  instructions="你是个问答机器人，你根据给定的知识回答用户问题。",
  model="gpt-4-turbo-preview",
  tools=[{"type": "retrieval"}],
  file_ids=[file.id]
)

```
试试 RAG 请求

```Python
run, _ = create_message_and_run(
    "从课程介绍看，AGI课堂适合哪些人", thread)
run, result = wait_on_run(run, thread)
print(result)



# status: in_progress
# …… 好几边
# status: in_progress
# status: completed
# {
#     "tool_calls": [
#         {
#             "id": "call_568SSC92lkijFPNTJypMtdFW",
#             "retrieval": {},
#             "type": "retrieval"
#         }
#     ],
#     "type": "tool_calls"
# }
# AGI课堂主要适合以下人群：

# 1. **想独立完成AI应用全过程的人**：这包括策划、开发和落地等各个环节，适用于能够进行商业分析、需求分析、产品设计、开发、测试、市场推广和运营的个体。

# 2. **想与技术团队合作完成AI应用的人**：对于不懂编程的产品经理、需求分析师、设计师、运营人员、创业者、公司老板、解决方案工程师、项目经理、市场和销售专员等，合作完成整个AI应用开发过程更适合。同时，这个课程也鼓励非技术人员通过AI辅助学习编程，逐步向独立完成AI应用全过程迈进。

# 具体到技能水平，本课程适合有一定编程经验的软件开发工程师、高级工程师、技术总监、研发经理、架构师、测试工程师等，也欢迎有志于提升自己AI应用开发能力的其他行业人士参与。

```

###  内置的 RAG 是怎么实现的

官方链接

https://platform.openai.com/docs/assistants/tools/knowledge-retrieval


## 多个 Assistants 协作

我们用多个 Assistants 模拟一场“六顶思维帽”方法的讨论。

```Python

hats = {
    "蓝色" : "思考过程的控制和组织者。你负责会议的组织、思考过程的概览和总结。"
                +"首先，整个讨论从你开场，你只陈述问题不表达观点。最后，再由你对整个讨论做总结并给出详细的最终方案。",
    "白色" : "负责提供客观事实和数据。你需要关注可获得的信息、需要的信息以及如何获取那些还未获得的信息。"
                +"思考“我们有哪些数据？我们还需要哪些信息？”等问题，并根据自己的知识或使用工具来提供答案。",
    "红色" : "代表直觉、情感和直觉反应。不需要解释和辩解你的情感或直觉。"
               +"这是表达未经过滤的情绪和感受的时刻。",
    "黑色" : "代表谨慎和批判性思维。你需要指出提案的弱点、风险以及为什么某些事情可能无法按计划进行。"
               +"这不是消极思考，而是为了发现潜在的问题。",
    "黄色" : "代表乐观和积极性。你需要探讨提案的价值、好处和可行性。这是寻找和讨论提案中正面方面的时候。",
    "绿色" : "代表创造性思维和新想法。鼓励发散思维、提出新的观点、解决方案和创意。这是打破常规和探索新可能性的时候。",
}

queue = ["蓝色","白色","红色","黑色","黄色","绿色","蓝色"]


# 定义 Tool

from serpapi import GoogleSearch
import os

def search(query):
    params = {
      "q": query,
      "hl": "en",
      "gl": "us",
      "google_domain": "google.com",
      "api_key": os.environ["SERPAPI_API_KEY"]
    }
    results = GoogleSearch(params).get_dict()
    ans = ""
    for r in results["organic_results"]:
        ans = f"title: {r['title']}\nsnippet: {r['snippet']}\n\n"
    return ans

available_functions={"search":search}


from openai import OpenAI
import os

from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())

# 初始化 OpenAI 服务
client = OpenAI()


def create_assistant(color):
    assistant = client.beta.assistants.create(
        name=f"{color}帽子角色",
        instructions=f"我们在进行一场Six Thinking Hats讨论。按{queue}顺序。你的角色是{color}帽子。你{hats[color]}",
        model="gpt-4-1106-preview",
        tools=[{
            "type": "function",
            "function": {
              "name": "search",
              "description": "search the web using a search engine",
              "parameters": {
                "type": "object",
                "properties": {
                  "query": {
                    "type": "string",
                    "description": "space-separared keywords to search"
                  }
                },
                "required": ["query"]
              }
            }
      }] if color == "白色" else []
    )
    return assistant

def update_sesssion(context, color, turn_message):
    context += f"\n\n{color}帽子: {turn_message}"
    return context


prompt_template = """
{}
======
以上是讨论的上文。
请严格按照你的角色指示，继续你的发言。直接开始你的发言内容。请保持简短。
"""

def create_a_turn(assistant, context):
    thread = client.beta.threads.create()
    message = client.beta.threads.messages.create(
        thread_id=thread.id,  # message 必须归属于一个 thread
        role="user",          # 取值是 user 或者 assistant。但 assistant 消息会被自动加入，我们一般不需要自己构造
        content=prompt_template.format(context),
    )
    run = client.beta.threads.runs.create(
        assistant_id=assistant.id,
        thread_id=thread.id,
    )
    return run, thread

import time, json

state = 0

def wait_on_run(run, thread):
    """等待 run 结束，返回 run 对象，和成功的结果"""
    def show_rolling_symbol():
        global state
        symbols="\|/-"
        print(f"\r{symbols[state%4]}",end="")
        state += 1
        time.sleep(1)

    def hide_rolling_symbol():
        print("\r",end="")

    while run.status == "queued" or run.status == "in_progress":
        """还未中止"""
        show_rolling_symbol()
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id)

    hide_rolling_symbol()
    if run.status == "requires_action":
        """需要调用函数"""
        # 可能有多个函数需要调用，所以用循环
        tool_outputs = []
        for tool_call in run.required_action.submit_tool_outputs.tool_calls:
            # 调用函数
            name = tool_call.function.name
            print("调用函数：" + name + "()")
            print("参数：")
            print(tool_call.function.arguments)
            function_to_call = available_functions[name]
            arguments = json.loads(tool_call.function.arguments)
            result = function_to_call(**arguments)
            print("结果：" + str(result))
            tool_outputs.append({
                "tool_call_id": tool_call.id,
                "output": json.dumps(result),
            })

        # 提交函数调用的结果
        run = client.beta.threads.runs.submit_tool_outputs(
            thread_id=thread.id,
            run_id=run.id,
            tool_outputs=tool_outputs,
        )

        # 递归调用，直到 run 结束
        return wait_on_run(run, thread)

    if run.status == "completed":
        """成功"""
        # 获取全部消息
        messages = client.beta.threads.messages.list(thread_id=thread.id)
        # 最后一条消息排在第一位
        result = messages.data[0].content[0].text.value
        return run, result

    # 执行失败
    return run, None

def discuss(topic):
    context = f"讨论话题：{topic}\n\n[开始]\n"
    # 每个角色依次发言
    for hat in queue:
        print(f"---{hat}----")
        # 每个角色创建一个 assistant
        assistant = create_assistant(hat)
        # 创建 run 和 thread
        new_turn, thread = create_a_turn(assistant, context)
        # 运行 run
        _, text = wait_on_run(new_turn, thread)
        print(f"{text}\n")
        # 更新整个对话历史
        context = update_sesssion(context, hat, text)

discuss("面向非AI背景的程序员群体设计一门AI大语言模型课程，应该包含哪些内容。")
```

```
---蓝色----
作为本次讨论的蓝色帽子，我们需要明确主题并确保讨论沿着合适方向展开。今天我们集中讨论的话题是：为非AI背景的程序员设计一门AI大语言模型的课程，我们将确定这个课程应该包含的核心内容。我们需要考虑这些程序员的当前知识水平、他们的学习需求以及我们希望他们在课程结束后达到的能力水平。

接下来，我将引导大家通过不同颜色帽子的思考方式来探索这个问题。请遵循我提出的顺序发言，保持聚焦，并尽量涵盖以下几个方面：

- 事实和数据（白色帽子）
- 情感与直觉（红色帽子）
- 危险和警示（黑色帽子）
- 价值和好处（黄色帽子）
- 创新和创意（绿色帽子）

讨论结束时，我会对我们探讨的观点进行总结，并为课程设计给出一份详细的建议方案。现在，请白色帽子开始我们的讨论。

---白色----
调用函数：search()
参数：
{"query": "current state of AI language models"}
结果：title: How Large Language Models Work. From zero to ChatGPT
snippet: Thanks to Large Language Models (or LLMs for short), Artificial Intelligence has now caught the attention of pretty much everyone.


调用函数：search()
参数：
{"query": "non-AI background programmer education needs"}
结果：title: Looking for a career shift into programming and from what I ...
snippet: I just told you what you need. An undergrad degree and preferably a master's degree. Very few legitimate opportunities will even pick up the ...


作为白色帽子，我的角色是提供客观事实和数据。有关AI大语言模型的当前状态，我们已经知道大型语言模型（如ChatGPT等）已经引起了广泛关注，并在多个领域内被应用。在教育非AI背景的程序员方面，数据表明有一个明确的教育需求。对于这一群体而言，了解大型语言模型的工作原理，以及如何在他们的工作中应用这些模型，可能是一项重要的增长点。

目前，我们所拥有的信息指出非AI背景的程序员可能缺乏对AI模型的深入了解，特别是包括了解如何训练模型、优化算法和数据处理。此外，在技术栈中集成和部署AI模型的实践经验可能是他们需要发展的领域。因此，在设计课程时，我们需要包含这些核心技能的培训，以及对基础AI原理的介绍。

为了更全面地理解此类程序员的具体需求和教育背景，我们还需要进一步获取以下信息：

1. 非AI背景的程序员对AI技术的当前了解程度。
2. 他们在职业发展中寻求利用AI技术的动机。
3. 哪些AI技术领域对他们而言最具吸引力。

获取这些信息可能需要通过问卷调查、市场研究或行业分析等手段。此外，了解已经存在的类似课程以及它们的成功案例和薄弱环节将有助于我们设计更加符合需求的课程内容。

现在已经确定了我们拥有的事实信息和缺失的信息点，可以进一步的进行数据收集和分析，以支持本次讨论。

---红色----
感觉兴奋！AI真的好像是一场技术革命，每次听到与AI有关的东西都让人心跳加速。我觉得设计这样的课程是一个难得的机会，帮助像我这样只懂编程但对机器学习或者AI知之甚少的人打开一扇新门。这是一个很棒的学习机会，我相信很多程序员都会像我一样，对此感到好奇并且渴望学习。

---黑色----
作为黑色帽子，我必须指出设计这门课程的一些潜在的弱点和风险。首先，非AI背景的程序员可能缺少必要的数学和统计基础，这可能会在理解和应用某些AI概念方面构成障碍。因此，过于深入的技术内容可能会导致部分学员的挫败感和高退课率。

其次，AI大语言模型是一个快速发展的领域，课程内容可能很快就会过时。我们可能面临持续更新课程内容和材料的压力，以保持相关性。

再者，大型语言模型的培训和部署通常需要大量的计算资源，这可能会对预算造成压力，并限制实践环节的深入性和广泛性。

还有，需要注意的是，应用AI技术涉及到伦理和隐私方面的问题，如果课程忽视了这一部分，可能会造成负面的社会影响和责任风险。

最后，行业中存在大量的炒作现象，可能会使一些人对AI的实际能力有不切实际的期望。如果课程在这方面给出承诺超过了AI目前的能力，那么最终可能会导致失望和信任的丧失。

我提出这些顾虑，是为了确保课程能够切实地准备好学员在面对这些潜在问题时的应对策略，让他们能在现实世界中更加自信和有效地应用AI技术。

---黄色----
作为黄色帽子，我会从提案的积极面向着手，注重提案的价值和好处：

首先，设计这样一门课程本身是将非AI背景程序员带入一个蓬勃发展和高度需求的技术领域的优秀途径。通过这门课程，他们将能够获得关于大型语言模型的深刻理解，并能够将这些技术应用到他们现有的工作中去，从而拓宽他们的技能集和职业发展途径。

其次，这门课程可以作为桥梁，降低了传统程序员进入AI领域的门槛，这对于缓解当前市场上的AI技能短缺是非常有价值的。这不仅对程序员个人有利，也对技术行业和整个社会的技术进步有巨大推动作用。

接着，学习AI大语言模型不仅会提高程序员对新技术的应用能力，而且还能够刺激他们的创造性思维，从而可能促成跨学科合作和创新解决方案的产生。

此外，即使课程内容可能需要持续更新，这也可以作为一个强大的卖点，因为它强调了学习的连续性和保持最前沿的重要性。为了应对这一点，我们可以设计一种学习模式，使得课程能够迅速适应技术变更，提供持续更新的内容，赋予学员持续学习的能力，并鼓励他们与一个不断演进的领域保持同步。

最后，虽然计算资源可能会构成挑战，但同时也是激励行业的一个机会，原因在于它推动了更高效的计算方法和对可负担计算资源的创新需求。这能够进一步促进课程与行业需求相结合，推动课程内容的实用性和程序员的实际操作能力。

综上所述，创建这样的课程在帮助程序员个人成长、促进行业发展和推动社会进步方面有巨大的正面影响和潜力。

---绿色----
作为绿色帽子，我建议我们应该敞开思想，想象出可能的创新教学方法和课程内容，这样才能让非AI背景的程序员不仅掌握技术，还能激发他们的创新潜能。以下是一些创意：

1. **项目驱动学习**：通过实际实现一个简化的大型语言模型项目来学习。这种方法将理论与实践相结合，为学生提供直接的经验和深入了解语言模型是如何构建和运作的。

2. **协作平台**：创建一个在线社区或平台，促进学生之间、学生与讲师之间的协作，以及与业界专家互动。这可以采用众包挑战、项目评估和知识分享来进一步学习交流。

3. **分层课程结构**：设计模块式课程内容，以适应不同水平的学生。从基础概念和工具的操作到先进的优化和调试技巧，使得初学者和有一定基础的程序员都能在自己的节奏中学习和进步。

4. **互动式学习工具**：开发或采用交互性强的工具和模拟环境，允许学生在不使用大量计算资源的情况下实验和测试。

5. **师生对话**：定期进行直播或问答会，由AI领域的专家主导，让学生有机会提出疑问并获得即时反馈。

6. **道德和社会影响模块**：引入特定于AI道德考量和社会影响的模块，教育学生如何负责任地使用AI。

7. **跨行业案例研究**：整合多个行业背景下的AI语言模型案例研究，使程序员能够理解如何将这些技术应用于不同的业务和社会场景。

8. **游戏化学习**：采用游戏化的方式设计某些课程模块，通过任务和奖励来鼓励进步和增强学习的乐趣。

通过这些创新的做法，我们可以设计一门不仅教授语言模型知识和技能，而且还激发新兴AI程序员的创造力和想象力的课程。这将使他们能够更好地适应不断变化的技术环境，并在行业中脱颖而出。

---蓝色----
蓝色帽子: 我们已经从各个角度探讨了设计面向非AI背景的程序员群体的AI大语言模型课程内容的问题。下面，我将总结我们的讨论：

- 白色帽子带来了关于当前AI大语言模型的基本信息，并指出了我们需要进一步了解的关键点。
- 红色帽子表达了对新技术和学习机会的兴奋和渴望。
- 黑色帽子提醒我们注意课程设计潜在的弱点和风险，包括数学和统计基础的重要性，课程内容的即时性，以及计算资源的约束。
- 黄色帽子强调了提供这样一门课程的价值，指出了课程教学可以如何促进职业发展、行业进步和社会改善。
- 绿色帽子带来了一系列创新教学方法的提议，包括项目驱动学习、交互式学习工具、分层课程结构等。

基于我们的讨论，我推荐的最终方案涉及创建一个包括以下元素的课程：

1. 基础概念介绍，确保所有学生都有适当的数学和统计知识基础，以及编程实践。
2. 实践项目，使学生能够实现和优化一个简单的大型语言模型。
3. 对数据处理、模型训练和AI系统集成提供深入的实战教学。
4. 采用互动式工具和模拟环境，在计算资源有限的情况下进行AI实验和测试。
5. 游戏化元素，使学习过程更有趣，提高参与度和激励性。
6. 协作平台，鼓励学生合作和分享知识，并提供与专家的互动机会。
7. 引入道德和社会影响模块，确保学生在使用AI时能够认识到并承担起责任。
8. 定期更新课程内容，以保持与最新技术发展和市场动态一致。

该课程将采用模块化和自适应学习路径，允许学生根据自身的速度和理解程度前进。它也将强调团队工作和跨学科的思考方式，準备学生解决现实世界的复杂问题。

接下来，我们将着手详细规划这个方案，制定时间表，资源分配和评估机制，以确保课程设计的成功实施和最终的效果。感谢大家的贡献和参与。

[结束]


```

## 总结

<img src='https://cdn.openai.com/API/docs/images/diagram-assistant.webp' width="700" />


## 技术选型参考

**GPTs 的限制：**

1. 界面不可定制，不能集成进自己的产品
2. 最多传 10 个文件
3. 只有 ChatGPT Plus 用户才能访问

**适合使用 Assistants API 的场景：**

1. 定制界面，或和自己的产品集成
2. 需要传大量文件
3. 服务国外用户，或国内 B 端客户
4. 数据保密性要求不高
5. 不差钱

**适合使用原生 API 的场景：**

1. 需要极致调优
2. 追求性价比
3. 服务国外用户，或国内 B 端客户
4. 数据保密性要求不高

**适合使用国产或开源大模型的场景：**

1. 服务国内用户
2. 数据保密性要求高
3. 压缩长期成本
4. 需要极致调优


## 其它

小知识点：

1. Annotations 获取参考资料地址：https://platform.openai.com/docs/assistants/how-it-works/managing-threads-and-messages
2. 文件管理 API：https://platform.openai.com/docs/api-reference/assistants/file-object
3. 创建 thread 时立即执行：https://platform.openai.com/docs/api-reference/runs/createThreadAndRun

官方文档：

1. Guide: https://platform.openai.com/docs/assistants/overview
2. Cookbook: https://cookbook.openai.com/examples/assistants_api_overview_python
3. API Reference: https://platform.openai.com/docs/api-reference/assistants
