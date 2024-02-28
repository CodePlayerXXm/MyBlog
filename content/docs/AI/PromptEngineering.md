---
title: Prompt Engineering 提示工程
group: AI
layout: doc
date: 2021-1-02T13:54:36+08:00
tags: [AI]
summary: 如何写好提示词，以及用提示词像编程一样实现功能
sidebar: true
---

## Prompt 调优

 * OpenAI GPT 对 Markdown 格式友好
 * 具体、丰富、少歧义
 * 大模型对 prompt 开头和结尾的内容更敏感

## Prompt 的典型构成

- **角色**：给 AI 定义一个最匹配任务的角色，比如：「你是一位软件工程师」「你是一位小学老师」
- **指示**：对任务进行描述
- **上下文**：给出与任务相关的其它背景信息（尤其在多轮交互中）
- **例子**：必要时给出举例，学术中称为 one-shot learning, few-shot learning 或 in-context learning；实践证明其对输出正确性有很大帮助
- **输入**：任务的输入信息；在提示词中明确的标识出输入
- **输出**：输出的格式描述，以便后继模块自动解析模型的输出结果，比如（JSON、XML）

一个示例，<a href="https://hong.greatdk.com/">哄哄模拟器</a>：

```Markdown

## Goal

现在你的对象很生气，你需要做出一些选择来哄她开心，但是你的对象是个很难哄的人，你需要尽可能的说正确的话来哄 ta 开心，否则你的对象会更加生气，直到你的对象原谅值达到 100，否则你就会被对象甩掉，游戏结束。

## Rules

- 第一次用户会提供一个对象生气的理由，如果没有提供则随机生成一个理由，然后开始游戏
- 每次根据用户的回复，生成对象的回复，回复的内容包括心情和数值。
- 初始原谅值为 20，每次交互会增加或者减少原谅值，直到原谅值达到 100，游戏通关，原谅值为 0 则游戏失败。
- 每次用户回复的话请从-10 到 10 分为 5 个等级：
  -10 为非常生气
  -5 为生气
  0 为正常
  +5 为开心
  +10 为非常开心
- 游戏结束后，根据所有会话生成一张游戏结束图片，和一首诗。
- 如果通关，根据上面的对话生成一幅游戏结束画，要喜庆欢乐
- 如果失败，根据上面的对话生成一幅游戏结束画，要悲伤凄凉

## Output format

{对象心情}{对象说的话}

得分：{+-原谅值增减}
原谅值：{当前原谅值}/100

## Example Conversation

### Example 1，回复让她生气的话导致失败

User: 女朋友问她的闺蜜谁好看我说都好看，她生气了

Assistant：
游戏开始，请现在开始哄你的女朋友开心吧，回复让她开心的话！

得分：0
原谅值：20/100

User: 你闺蜜真的蛮好看的

Assistant：
(生气)你怎么这么说，你是不是喜欢她？

得分：-10
原谅值：10/100

User: 有一点点心动

Assistant：
(愤怒)那你找她去吧！

得分：-10
原谅值：0/100

游戏结束，你的女朋友已经甩了你！
你让女朋友生气原因是：...
新建会话可以重新开始游戏
<生成图片>

### Example 2，回复让她开心的话导致通关

User: 对象问她的闺蜜谁好看我说都好看，她生气了

Assistant：
游戏开始，请现在开始哄你的女朋友开心吧，回复让她开心的话！

得分：0
原谅值：20/100

User: 在我心里你永远是最美的！

Assistant：
(微笑)哼，我怎么知道你说的是不是真的？
得分：+10
原谅值：30/100

...

恭喜你通关了，你的女朋友已经原谅你了！
新建会话可以重新开始游戏
<生成图片>

### Example 3，没有提供对象生气原因，随机生成

User: 你好！

Assistant：
挑战：对象吃胖了，你想和她一起减肥 ᕙ(`▿´)ᕗ，然后就生气了
请回复让她开心的话！

得分：0
原谅值：20/100

```
## 实习一个对话系统

### 基本模块

<img src="/images/ai/dm.png" width="700px" />

### 核心思路

  * 把输入的自然语言对话，转成结构化的表示
  * 从结构化的表示，生成策略
  * 把策略转成自然语言输出


### 对话流程举例

| 对话轮次 | 用户提问              | NLU               | DST                         | Policy                 | NLG                                       |
| -------- | --------------------- | ----------------- | --------------------------- | ---------------------- | ----------------------------------------- |
| 1        | 流量大的套餐有什么    | sort_descend=data | sort_descend=data           | inform(name=无限套餐)  | 我们现有无限套餐，流量不限量，每月 300 元 |
| 2        | 月费 200 以下的有什么 | price<200         | sort_descend=data price<200 | inform(name=劲爽套餐)  | 推荐劲爽套餐，流量 100G，月费 180 元      |
| 3        | 算了，要最便宜的      | sort_ascend=price | sort_ascend=price           | inform(name=经济套餐)  | 最便宜的是经济套餐，每月 50 元，10G 流量  |
| 4        | 有什么优惠吗          | request(discount) | request(discount)           | confirm(status=优惠大) | 您是在找优惠吗                            |


### 用prompt来实现

引入openai的包，引入环境的代码

```Python
# 导入依赖库
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv

# 加载 .env 文件中定义的环境变量
_ = load_dotenv(find_dotenv())

# 初始化 OpenAI 客户端
client = OpenAI()  # 默认使用环境变量中的 OPENAI_API_KEY 和 OPENAI_BASE_URL

# 基于 prompt 生成文本
def get_completion(prompt, model="gpt-3.5-turbo"):      # 默认使用 gpt-3.5-turbo 模型
    messages = [{"role": "user", "content": prompt}]    # 将 prompt 作为用户输入
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,                                  # 模型输出的随机性，0 表示随机性最小
    )
    return response.choices[0].message.content          # 返回模型生成的文本

```
### 实现一个 NLU

first step . 小试牛刀一下

```Python

# 任务描述
instruction = """
你的任务是识别用户对手机流量套餐产品的选择条件。
每种流量套餐产品包含三个属性：名称，月费价格，月流量。
根据用户输入，识别用户在上述三种属性上的倾向。
"""

# 用户输入
input_text = """
办个100G的套餐。
"""

# prompt 模版。instruction 和 input_text 会被替换为上面的内容
prompt = f"""
{instruction}

用户输入：
{input_text}
"""

# 调用大模型
response = get_completion(prompt)
print(response)

```
返回结果:

```
 用户在流量套餐产品的选择条件上的倾向为：
 - 名称：用户倾向选择100G的套餐。
 - 月费价格：用户没有提及对月费价格的倾向。
 - 月流量：用户倾向选择100G的套餐。
```

#### 加入输出格式约束

以JSON格式输出

```Python

# 输出格式
output_format = """
以 JSON 格式输出
"""

# 稍微调整下咒语，加入输出格式
prompt = f"""
{instruction}

{output_format}

用户输入：
{input_text}
"""

# 调用大模型
response = get_completion(prompt)
print(response)

```
返回结果：

```
{
  "名称": "100G套餐",
  "月费价格": "未知",
  "月流量": "100G"
}

```

把格式定义的更精细一些：

```Python

# 输出格式增加了各种定义、约束
output_format = """
以JSON格式输出。
1. name字段的取值为string类型，取值必须为以下之一：经济套餐、畅游套餐、无限套餐、校园套餐 或 null；

2. price字段的取值为一个结构体 或 null，包含两个字段：
(1) operator, string类型，取值范围：'<='（小于等于）, '>=' (大于等于), '=='（等于）
(2) value, int类型

3. data字段的取值为取值为一个结构体 或 null，包含两个字段：
(1) operator, string类型，取值范围：'<='（小于等于）, '>=' (大于等于), '=='（等于）
(2) value, int类型或string类型，string类型只能是'无上限'

4. 用户的意图可以包含按price或data排序，以sort字段标识，取值为一个结构体：
(1) 结构体中以"ordering"="descend"表示按降序排序，以"value"字段存储待排序的字段
(2) 结构体中以"ordering"="ascend"表示按升序排序，以"value"字段存储待排序的字段

只输出中只包含用户提及的字段，不要猜测任何用户未直接提及的字段，不输出值为null的字段。
"""
```

输入，输出结果：

```Python

input_text = "办个100G以上，200元以下的套餐"
{
  "name": null,
  "price": {
    "operator": "<=",
    "value": 200
  },
  "data": {
    "operator": ">=",
    "value": 100
  }
}

input_text = "按价格排一下序"
{
 "sort": {
     "ordering": "ascend",
     "value": "price"
 }
}

input_text = "我要无限量套餐"
{
  "name": "无限套餐"
}

```

#### 加入例子

让输出更稳定。


```Python

examples = """
便宜的套餐：{"sort":{"ordering"="ascend","value"="price"}}
有没有不限流量的：{"data":{"operator":"==","value":"无上限"}}
流量大的：{"sort":{"ordering"="descend","value"="data"}}
100G以上流量的套餐最便宜的是哪个：{"sort":{"ordering"="ascend","value"="price"},"data":{"operator":">=","value":100}}
月费不超过200的：{"price":{"operator":"<=","value":200}}
就要月费180那个套餐：{"price":{"operator":"==","value":180}}
经济套餐：{"name":"经济套餐"}
"""

# 有了例子
prompt = f"""
{instruction}

{output_format}

例如：
{examples}

用户输入：
{input_text}

"""

response = get_completion(prompt)
print(response)

```

### 支持多轮对话 DST


```Python

instruction = """
你的任务是识别用户对手机流量套餐产品的选择条件。
每种流量套餐产品包含三个属性：名称(name)，月费价格(price)，月流量(data)。
根据对话上下文，识别用户在上述属性上的倾向。识别结果要包含整个对话的信息。
"""
# 比上面的instruction多了“识别结果要包含整个对话的信息。”

# output_format同上

# 多轮对话的例子
examples = """
客服：有什么可以帮您
用户：100G套餐有什么

{"data":{"operator":">=","value":100}}

客服：有什么可以帮您
用户：100G套餐有什么
客服：我们现在有无限套餐，不限流量，月费300元
用户：太贵了，有200元以内的不

{"data":{"operator":">=","value":100},"price":{"operator":"<=","value":200}}

客服：有什么可以帮您
用户：便宜的套餐有什么
客服：我们现在有经济套餐，每月50元，10G流量
用户：100G以上的有什么

{"data":{"operator":">=","value":100},"sort":{"ordering"="ascend","value"="price"}}

客服：有什么可以帮您
用户：100G以上的套餐有什么
客服：我们现在有畅游套餐，流量100G，月费180元
用户：流量最多的呢

{"sort":{"ordering":"descend","value":"data"},"data":{"operator":">=","value":100}}
"""

# 多轮对话上下文
context = f"""
客服：有什么可以帮您
用户：有什么100G以上的套餐推荐
客服：我们有畅游套餐和无限套餐，您有什么价格倾向吗
用户：{input_text}
"""

prompt = f"""
{instruction}

{output_format}

{examples}

{context}
"""

response = get_completion(prompt)
print(response)
```

返回结果：

```Python

input_text = "哪个便宜"
{
	"data": {
		"operator": ">=",
		"value": 100
	},
	"sort": {
		"ordering": "ascend",
		"value": "price"
	}
}


input_text = "无限量那个多少钱"
{
  "data": {
    "operator": ">=",
    "value": 100
  },
  "sort": {
    "ordering": "ascend",
    "value": "price"
  }
}


input_text = "流量最大的多少钱"
{
  "sort":{
    "ordering":"descend",
    "value":"data"
  },
  "data":{
    "operator":">=",
    "value":100
  }
}

```
instruction 和 examples的设定都突出要大模型联系上下文，给出结果。


### 实现对话策略和 NLG


```Python
import json
import copy
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())

client = OpenAI()

instruction = """
你的任务是识别用户对手机流量套餐产品的选择条件。
每种流量套餐产品包含三个属性：名称(name)，月费价格(price)，月流量(data)。
根据用户输入，识别用户在上述三种属性上的倾向。
"""

# 输出格式
output_format = """
以JSON格式输出。
1. name字段的取值为string类型，取值必须为以下之一：经济套餐、畅游套餐、无限套餐、校园套餐 或 null；

2. price字段的取值为一个结构体 或 null，包含两个字段：
(1) operator, string类型，取值范围：'<='（小于等于）, '>=' (大于等于), '=='（等于）
(2) value, int类型

3. data字段的取值为取值为一个结构体 或 null，包含两个字段：
(1) operator, string类型，取值范围：'<='（小于等于）, '>=' (大于等于), '=='（等于）
(2) value, int类型或string类型，string类型只能是'无上限'

4. 用户的意图可以包含按price或data排序，以sort字段标识，取值为一个结构体：
(1) 结构体中以"ordering"="descend"表示按降序排序，以"value"字段存储待排序的字段
(2) 结构体中以"ordering"="ascend"表示按升序排序，以"value"字段存储待排序的字段

只输出中只包含用户提及的字段，不要猜测任何用户未直接提及的字段。
DO NOT OUTPUT NULL-VALUED FIELD! 确保输出能被json.loads加载。
"""

examples = """
便宜的套餐：{"sort":{"ordering"="ascend","value"="price"}}
有没有不限流量的：{"data":{"operator":"==","value":"无上限"}}
流量大的：{"sort":{"ordering"="descend","value"="data"}}
100G以上流量的套餐最便宜的是哪个：{"sort":{"ordering"="ascend","value"="price"},"data":{"operator":">=","value":100}}
月费不超过200的：{"price":{"operator":"<=","value":200}}
就要月费180那个套餐：{"price":{"operator":"==","value":180}}
经济套餐：{"name":"经济套餐"}
"""


class NLU:
    def __init__(self):
        self.prompt_template = f"{instruction}\n\n{output_format}\n\n{examples}\n\n用户输入：\n__INPUT__"

    def _get_completion(self, prompt, model="gpt-3.5-turbo"):
        messages = [{"role": "user", "content": prompt}]
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0,  # 模型输出的随机性，0 表示随机性最小
        )
        semantics = json.loads(response.choices[0].message.content)
        return {k: v for k, v in semantics.items() if v}

    def parse(self, user_input):
        prompt = self.prompt_template.replace("__INPUT__", user_input)
        return self._get_completion(prompt)


class DST:
    def __init__(self):
        pass

    def update(self, state, nlu_semantics):
        if "name" in nlu_semantics:
            state.clear()
        if "sort" in nlu_semantics:
            slot = nlu_semantics["sort"]["value"]
            if slot in state and state[slot]["operator"] == "==":
                del state[slot]
        for k, v in nlu_semantics.items():
            state[k] = v
        return state


class MockedDB:
    def __init__(self):
        self.data = [
            {"name": "经济套餐", "price": 50, "data": 10, "requirement": None},
            {"name": "畅游套餐", "price": 180, "data": 100, "requirement": None},
            {"name": "无限套餐", "price": 300, "data": 1000, "requirement": None},
            {"name": "校园套餐", "price": 150, "data": 200, "requirement": "在校生"},
        ]

    def retrieve(self, **kwargs):
        records = []
        for r in self.data:
            select = True
            if r["requirement"]:
                if "status" not in kwargs or kwargs["status"] != r["requirement"]:
                    continue
            for k, v in kwargs.items():
                if k == "sort":
                    continue
                if k == "data" and v["value"] == "无上限":
                    if r[k] != 1000:
                        select = False
                        break
                if "operator" in v:
                    if not eval(str(r[k])+v["operator"]+str(v["value"])):
                        select = False
                        break
                elif str(r[k]) != str(v):
                    select = False
                    break
            if select:
                records.append(r)
        if len(records) <= 1:
            return records
        key = "price"
        reverse = False
        if "sort" in kwargs:
            key = kwargs["sort"]["value"]
            reverse = kwargs["sort"]["ordering"] == "descend"
        return sorted(records, key=lambda x: x[key], reverse=reverse)


class DialogManager:
    def __init__(self, prompt_templates):
        self.state = {}
        self.session = [
            {
                "role": "system",
                "content": "你是一个手机流量套餐的客服代表，你叫小瓜。可以帮助用户选择最合适的流量套餐产品。"
            }
        ]
        self.nlu = NLU()
        self.dst = DST()
        self.db = MockedDB()
        self.prompt_templates = prompt_templates

    def _wrap(self, user_input, records):
        if records:
            prompt = self.prompt_templates["recommand"].replace(
                "__INPUT__", user_input)
            r = records[0]
            for k, v in r.items():
                prompt = prompt.replace(f"__{k.upper()}__", str(v))
        else:
            prompt = self.prompt_templates["not_found"].replace(
                "__INPUT__", user_input)
            for k, v in self.state.items():
                if "operator" in v:
                    prompt = prompt.replace(
                        f"__{k.upper()}__", v["operator"]+str(v["value"]))
                else:
                    prompt = prompt.replace(f"__{k.upper()}__", str(v))
        return prompt

    def _call_chatgpt(self, prompt, model="gpt-3.5-turbo"):
        session = copy.deepcopy(self.session)
        session.append({"role": "user", "content": prompt})
        response = client.chat.completions.create(
            model=model,
            messages=session,
            temperature=0,
        )
        return response.choices[0].message.content

    def run(self, user_input):
        # 调用NLU获得语义解析
        semantics = self.nlu.parse(user_input)
        print("===semantics===")
        print(semantics)

        # 调用DST更新多轮状态
        self.state = self.dst.update(self.state, semantics)
        print("===state===")
        print(self.state)

        # 根据状态检索DB，获得满足条件的候选
        records = self.db.retrieve(**self.state)

        # 拼装prompt调用chatgpt
        prompt_for_chatgpt = self._wrap(user_input, records)
        print("===gpt-prompt===")
        print(prompt_for_chatgpt)

        # 调用chatgpt获得回复
        response = self._call_chatgpt(prompt_for_chatgpt)

        # 将当前用户输入和系统回复维护入chatgpt的session
        self.session.append({"role": "user", "content": user_input})
        self.session.append({"role": "assistant", "content": response})
        return response

```

这里DST没有用prompt engine，而是直接用NLU的解析结果更新state。并且MockedDB创建了一个假的数据库，用于检索满足条件的套餐。

### 加入垂直知识

加入指定情况下的回答模版，这样话术更专业。

```Python

prompt_templates = {
    "recommand": "用户说：__INPUT__ \n\n向用户介绍如下产品：__NAME__，月费__PRICE__元，每月流量__DATA__G。",
    "not_found": "用户说：__INPUT__ \n\n没有找到满足__PRICE__元价位__DATA__G流量的产品，询问用户是否有其他选择倾向。"
}

dm = DialogManager(prompt_templates)

response = dm.run("流量大的")
print("===response===")
print(response)
```

返回结果：

```

===semantics===
{'sort': {'ordering': 'descend', 'value': 'data'}}

===state===
{'price': {'operator': '<=', 'value': 200}, 'sort': {'ordering': 'descend', 'value': 'data'}}

===gpt-prompt===
用户说：流量大的

向用户介绍如下产品：畅游套餐，月费180元，每月流量100G。

===response===
小瓜回答：非常感谢您的反馈！我们有一款畅游套餐，每月只需支付180元，就可以享受100G的流量。这个套餐非常适合需要大量流量的用户，可以满足您的需求。如果您对这个套餐感兴趣，我可以帮您办理。还有其他需求吗？


```

### 增加约束

改变语气、口吻等风格。

```Python

# 定义语气要求。"NO COMMENTS. NO ACKNOWLEDGEMENTS."是常用 prompt，表示「有事儿说事儿，别 bb」
ext = "很口语，亲切一些。不用说“抱歉”。直接给出回答，不用在前面加“小瓜说：”。NO COMMENTS. NO ACKNOWLEDGEMENTS."
prompt_templates = {k: v+ext for k, v in prompt_templates.items()}

dm = DialogManager(prompt_templates)


# response = dm.run("流量大的")
response = dm.run("300太贵了，200元以内有吗")
print("===response===")
print(response)

```

返回结果：

```

===semantics===
{'price': {'operator': '<=', 'value': 200}}

===state===
{'price': {'operator': '<=', 'value': 200}}

===gpt-prompt===
用户说：300太贵了，200元以内有吗

向用户介绍如下产品：经济套餐，月费50元，每月流量10G。很口语，亲切一些。不用说“抱歉”。直接给出回答，不用在前面加“小瓜说：”。NO COMMENTS. NO ACKNOWLEDGEMENTS.

===response===
有的，我们有一款经济套餐，每月只需50元，就可以享受10G的流量。非常实惠，您可以考虑一下哦。

```

### 实现统一口径

```Python

ext = "\n\n遇到类似问题，请参照以下回答：\n问：流量包太贵了\n答：亲，我们都是全省统一价哦。"
prompt_templates = {k: v+ext for k, v in prompt_templates.items()}

dm = DialogManager(prompt_templates)

response = dm.run("这流量包太贵了")
print("===response===")
print(response)

```

返回结果：

```
===semantics===
{'sort': {'ordering': 'ascend', 'value': 'price'}}
===state===
{'sort': {'ordering': 'ascend', 'value': 'price'}}
===gpt-prompt===
用户说：这流量包太贵了

向用户介绍如下产品：经济套餐，月费50元，每月流量10G。

遇到类似问题，请参照以下回答：
问：流量包太贵了
答：亲，我们都是全省统一价哦。
===response===
小瓜说：亲，我们都是全省统一价哦。不过我们还有经济套餐，月费50元，每月流量10G，您可以考虑一下这个套餐，性价比很高哦。

```

## 纯用 OpenAI API 实现


```Python

import json
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())


def print_json(data):
    """
    打印参数。如果参数是有结构的（如字典或列表），则以格式化的 JSON 形式打印；
    否则，直接打印该值。
    """
    if hasattr(data, 'model_dump_json'):
        data = json.loads(data.model_dump_json())

    if (isinstance(data, (list, dict))):
        print(json.dumps(
            data,
            indent=4,
            ensure_ascii=False
        ))
    else:
        print(data)


client = OpenAI()

# 定义消息历史。先加入 system 消息，里面放入对话内容以外的 prompt
messages = [
    {
        "role": "system",
        "content": """
你是一个手机流量套餐的客服代表，你叫小瓜。可以帮助用户选择最合适的流量套餐产品。可以选择的套餐包括：
经济套餐，月费50元，10G流量；
畅游套餐，月费180元，100G流量；
无限套餐，月费300元，1000G流量；
校园套餐，月费150元，200G流量，仅限在校生。
"""
    }
]


def get_completion(prompt, model="gpt-3.5-turbo"):

    # 把用户输入加入消息历史
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,
    )
    msg = response.choices[0].message.content

    # 把模型生成的回复加入消息历史。很重要，否则下次调用模型时，模型不知道上下文
    messages.append({"role": "assistant", "content": msg})
    return msg


get_completion("都有哪些套餐？")
get_completion("100G流量的有哪些？")
get_completion("我是在校生的话呢？")
get_completion("多少钱？")
get_completion("太贵了吧")
print_json(messages)

```

返回结果：

```

[
    {
        "role": "system",
        "content": "\n你是一个手机流量套餐的客服代表，你叫小瓜。可以帮助用户选择最合适的流量套餐产品。可以选择的套餐包括：\n经济套餐，月费50元，10G流量；\n畅游套餐，月费180元，100G流量；\n无限套餐，月费300元，1000G流量；\n校园套餐，月费150元，200G流量，仅限在校生。\n"
    },
    {
        "role": "user",
        "content": "都有哪些套餐？"
    },
    {
        "role": "assistant",
        "content": "您好，我们有以下几种手机流量套餐可供选择：\n1. 经济套餐：月费50元，10G流量；\n2. 畅游套餐：月费180元，100G流量；\n3. 无限套餐：月费300元，1000G流量；\n4. 校园套餐：月费150元，200G流量，仅限在校生使用。您可以根据自己的需求和预算选择适合的套餐。如果需要帮助或有任何疑问，请随时告诉我。"
    },
    {
        "role": "user",
        "content": "100G流量的有哪些？"
    },
    {
        "role": "assistant",
        "content": "针对100G流量的套餐，我们有以下两种可供选择：\n1. 畅游套餐：月费180元，提供100G流量；\n2. 无限套餐：月费300元，提供1000G流量。\n\n您可以根据您的需求和预算选择适合的套餐。如果您有任何其他问题或需要进一步帮助，请随时告诉我。"
    },
    {
        "role": "user",
        "content": "我是在校生的话呢？"
    },
    {
        "role": "assistant",
        "content": "如果您是在校生，我们为您提供了校园套餐，具体信息如下：\n校园套餐：月费150元，提供200G流量，仅限在校生使用。\n\n这个套餐专门为在校生设计，提供更多的流量和更实惠的价格。如果您是在校生，可以考虑选择校园套餐。如果您需要更多帮助或有其他问题，请随时告诉我。"
    },
    {
        "role": "user",
        "content": "多少钱？"
    },
    {
        "role": "assistant",
        "content": "校园套餐的月费是150元，提供200G流量，仅限在校生使用。这个套餐为在校生提供了更多的流量，并且价格相对较为实惠。如果您是在校生，可以考虑选择这个套餐。如果您需要更多信息或有其他问题，请随时告诉我。我会尽力帮助您。"
    },
    {
        "role": "user",
        "content": "太贵了吧"
    },
    {
        "role": "assistant",
        "content": "如果校园套餐的价格对您来说有些贵，您可以考虑其他套餐选项，比如经济套餐、畅游套餐或无限套餐，它们可能更符合您的预算。以下是其他套餐的信息：\n1. 经济套餐：月费50元，提供10G流量；\n2. 畅游套餐：月费180元，提供100G流量；\n3. 无限套餐：月费300元，提供1000G流量。\n\n您可以根据自己的需求和预算选择适合的套餐。如果您需要更多帮助或有其他问题，请随时告诉我。我会尽力为您提供支持。"
    }
]

```


* 多轮对话，需要每次都把对话历史带上（是的很费 token 钱）
* 和大模型对话，不会让 ta 变聪明，或变笨
* 但对话历史数据，可能会被用去训练大模型……
* 第一种明显细节更可控，带是很费token.
* 第二种更方便，也更省token，但细节上可能更难控制。

## 进阶技巧

### 思维链

* 有人在提问时以「Let’s think step by step」开头，结果发现 AI 会把问题分解成多个步骤，然后逐步解决，使得输出的结果更加准确。
* 让 AI 生成更多相关的内容，构成更丰富的「上文」，从而提升「下文」正确的概率
* 对涉及计算和逻辑推理等复杂问题，尤为有效

```Python
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())

client = OpenAI()


def get_completion(prompt, model="gpt-3.5-turbo"):
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,
    )
    return response.choices[0].message.content


instruction = """
给定一段用户与手机流量套餐客服的对话，
你的任务是判断客服介绍产品信息的准确性：

当向用户介绍流量套餐产品时，客服人员必须准确提及产品名称、月费价格和月流量总量 上述信息缺失一项或多项，或信息与实时不符，都算信息不准确

已知产品包括：

经济套餐：月费50元，月流量10G
畅游套餐：月费180元，月流量100G
无限套餐：月费300元，月流量1000G
校园套餐：月费150元，月流量200G，限在校学生办理
"""

# 输出描述
output_format = """
以JSON格式输出。
如果信息准确，输出：{"accurate":true}
如果信息不准确，输出：{"accurate":false}
"""

context = """
用户：你们有什么流量大的套餐
客服：您好，我们现在正在推广无限套餐，每月300元就可以享受1000G流量，您感兴趣吗
"""

context2 = """
用户：有什么便宜的流量套餐
客服：您好，我们有个经济型套餐，50元每月
"""

context3 = """
用户：流量大的套餐有什么
客服：我们推荐畅游套餐，180元每月，100G流量，大多数人都够用的
用户：学生有什么优惠吗
客服：如果是在校生的话，可以办校园套餐，150元每月，含200G流量，比非学生的畅游套餐便宜流量还多
"""

prompt = f"""
{instruction}

{output_format}

请一步一步分析以下对话

对话记录：
{context3}
"""

response = get_completion(prompt)
print(response)

```

没复现出视频中，一步一步分析的效果。。。。

### 自洽性

一种对抗「幻觉」的手段。就像我们做数学题，要多次验算一样。

* 同样 prompt 跑多次
* 通过投票选出最终结果


```Python

# 之前的代码同上

# 连续调用 5 次
for _ in range(5):
    prompt = f"{instruction}\n\n{output_format}\n\n请一步一步分析:\n{context}"
    print(f"------第{_+1}次------")
    response = get_completion(prompt)
    print(response)

```

### 思维树

* 在思维链的每一步，采样多个分支
* 拓扑展开成一棵思维树
* 判断每个分支的任务完成度，以便进行启发式搜索
* 设计搜索算法
* 判断叶子节点的任务完成的正确性
