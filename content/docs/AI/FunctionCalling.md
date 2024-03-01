---
title: Function Calling
group: AI
layout: doc
date: 2024-03-01T03:48:59.309Z
tags: [AI]
summary: 大模型如何跟外部世界链接
sidebar: true
---

## 为什么要大模型连接外部世界


大模型两大缺陷：

* 并非知晓一切

训练数据不可能什么都有。垂直、非公开数据必有欠缺。

不知道最新信息。大模型的训练周期很长，且更新一次耗资巨大，还有越训越傻的风险。所以 ta 不可能实时训练。

GPT-3.5 的知识截至 2021 年 9 月，GPT-4 是 2023 年 12 月。

* 没有「真逻辑」

它表现出的逻辑、推理，是训练文本的统计规律，而不是真正的逻辑，所以有幻觉。

所以：大模型需要连接真实世界，并对接真逻辑系统。

## OpenAI 用 Actions 连接外部世界

### 1. Actions

  Actions 内置在 GPTs 中。

<img src='/images/ai/action.png'  width=700px/>

### 2. Actions 配置

  Actions 官方文档：<a href="https://platform.openai.com/docs/actions">链接</a>

```yaml
openapi: 3.1.0
info:
  title: 高德地图
  description: 获取 POI 的相关信息
  version: v1.0.0
servers:
  - url: https://restapi.amap.com/v5/place
paths:
  /text:
    get:
      description: 根据POI名称，获得POI的经纬度坐标
      operationId: get_location_coordinate
      parameters:
        - name: keywords
          in: query
          description: POI名称，必须是中文
          required: true
          schema:
            type: string
        - name: region
          in: query
          description: POI所在的区域名，必须是中文
          required: false
          schema:
            type: string
      deprecated: false
  /around:
    get:
      description: 搜索给定坐标附近的POI
      operationId: search_nearby_pois
      parameters:
        - name: keywords
          in: query
          description: 目标POI的关键字
          required: true
          schema:
            type: string
        - name: location
          in: query
          description: 中心点的经度和纬度，用逗号分隔
          required: false
          schema:
            type: string
      deprecated: false
components:
  schemas: {}
```
用yaml格式或者Json格式描述 Actions。

### GPTs 与它的平替们

[OpenAI GPTs](https://chat.openai.com/gpts/discovery)

1. 无需编程，就能定制个性对话机器人的平台
2. 可以放入自己的知识库，实现 RAG（后面会讲）
3. 可以通过 actions 对接专有数据和功能
4. 内置 DALL·E 3 文生图和 Code Interpreter 能力
5. 只有 ChatGPT Plus 会员可以使用

推荐两款平替：

字节跳动 Coze（扣子）[中国版](https://www.coze.cn/) [国际版](https://www.coze.com/)

1. 国际版可以免费使用 GPT-4 等 OpenAI 的服务！大羊毛！
2. 中国版发展势头很猛，使用云雀大模型
3. 功能更强大

[Dify](https://dify.ai/)

1. 开源，中国公司开发
2. 功能最丰富
3. 可以本地部署，支持非常多的大模型
4. 有 GUI，也有 API

有这类无需开发的工具，为什么还要学大模型开发技术呢？

1. 它们都无法针对业务需求做极致调优
2. 它们和其它业务系统的集成不是特别方便


## Function Calling 的机制

Function Calling 完整的官方接口文档：https://platform.openai.com/docs/guides/function-calling

<img src="/images/ai/functionCalling.png" width=700px>


### 调用本地函数

需求：实现一个回答问题的 AI。题目中如果有加法，必须能精确计算。

```Python

# 初始化
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
import json

_ = load_dotenv(find_dotenv())

client = OpenAI()

def print_json(data):
    """
    打印参数。如果参数是有结构的（如字典或列表），则以格式化的 JSON 形式打印；
    否则，直接打印该值。
    """
    if hasattr(data, 'model_dump_json'):
        data = json.loads(data.model_dump_json())

    if (isinstance(data, (list))):
        for item in data:
            print_json(item)
    elif (isinstance(data, (dict))):
        print(json.dumps(
            data,
            indent=4,
            ensure_ascii=False
        ))
    else:
        print(data)

def get_completion(messages, model="gpt-3.5-turbo"):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,  # 模型输出的随机性，0 表示随机性最小
        tools=[{  # 用 JSON 描述函数。可以定义多个。由大模型决定调用谁。也可能都不调用
            "type": "function",
            "function": {
                "name": "sum",
                "description": "加法器，计算一组数的和",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "numbers": {
                            "type": "array",
                            "items": {
                                "type": "number"
                            }
                        }
                    }
                }
            }
        }],
    )
    return response.choices[0].message

from math import *

prompt = "Tell me the sum of 1, 2, 3, 4, 5, 6, 7, 8, 9, 10."
# prompt = "桌上有 2 个苹果，四个桃子和 3 本书，一共有几个水果？"
# prompt = "1+2+3...+99+100"
# prompt = "1024 乘以 1024 是多少？"   # Tools 里没有定义乘法，会怎样？
# prompt = "太阳从哪边升起？"           # 不需要算加法，会怎样？

messages = [
    {"role": "system", "content": "你是一个数学家"},
    {"role": "user", "content": prompt}
]
response = get_completion(messages)

# 把大模型的回复加入到对话历史中
messages.append(response)

print("=====GPT回复=====")
print_json(response)

# 如果返回的是函数调用结果，则打印出来
if (response.tool_calls is not None):
    # 是否要调用 sum
    tool_call = response.tool_calls[0]
    if (tool_call.function.name == "sum"):
        # 调用 sum
        args = json.loads(tool_call.function.arguments)
        result = sum(args["numbers"])
        print("=====函数返回=====")
        print(result)

        # 把函数调用结果加入到对话历史中
        messages.append(
            {
                "tool_call_id": tool_call.id,  # 用于标识函数调用的 ID
                "role": "tool",
                "name": "sum",
                "content": str(result)  # 数值 result 必须转成字符串
            }
        )

        # 再次调用大模型
        print("=====最终回复=====")
        print(get_completion(messages).content)

```

返回结果：


```

{
    "content": null,
    "role": "assistant",
    "function_call": null,
    "tool_calls": [
        {
            "id": "call_EoBm8iVtl000rAZSyWe9qlk8",
            "function": {
                "arguments": "{\"numbers\":[1,2,3,4,5,6,7,8,9,10]}",
                "name": "sum"
            },
            "type": "function"
        }
    ]
}
=====GPT回复=====
{
    "content": null,
    "role": "assistant",
    "function_call": null,
    "tool_calls": [
        {
            "id": "call_EoBm8iVtl000rAZSyWe9qlk8",
            "function": {
                "arguments": "{\"numbers\":[1,2,3,4,5,6,7,8,9,10]}",
                "name": "sum"
            },
            "type": "function"
        }
    ]
}
=====函数返回=====
55
=====最终回复=====
The sum of 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 is 55.

```
通过tools参数定义一个function，让大模型自己判断该不该调用该函数。


如果要调用函数，大模型会返回函数的名字，参数，id。等信息的JSON.


返回的function calling信息，也要加入message list中，格式：


```Json
 {
    "tool_call_id": tool_call.id,  # 用于标识函数调用的 ID
    "role": "tool",
    "name": "sum",
    "content": str(result)  # 数值 result 必须转成字符串
}
```

**必须要是字符串，不能是数字。**


### 多 Function 调用

需求：查询某个地点附近的酒店、餐厅、景点等信息。即，查询某个 POI 附近的 POI。

```Python

def get_completion(messages, model="gpt-3.5-turbo"):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,  # 模型输出的随机性，0 表示随机性最小
        seed=1024,      # 随机种子保持不变，temperature 和 prompt 不变的情况下，输出就会不变
        tool_choice="auto",  # 默认值，由 GPT 自主决定返回 function call 还是返回文字回复。也可以强制要求必须调用指定的函数，详见官方文档
        tools=[{
            "type": "function",
            "function": {
                "name": "get_location_coordinate",
                "description": "根据POI名称，获得POI的经纬度坐标",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "POI名称，必须是中文",
                        },
                        "city": {
                            "type": "string",
                            "description": "POI所在的城市名，必须是中文",
                        }
                    },
                    "required": ["location", "city"],
                }
            }
        },
            {
            "type": "function",
            "function": {
                "name": "search_nearby_pois",
                "description": "搜索给定坐标附近的poi",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "longitude": {
                            "type": "string",
                            "description": "中心点的经度",
                        },
                        "latitude": {
                            "type": "string",
                            "description": "中心点的纬度",
                        },
                        "keyword": {
                            "type": "string",
                            "description": "目标poi的关键字",
                        }
                    },
                    "required": ["longitude", "latitude", "keyword"],
                }
            }
        }],
    )
    return response.choices[0].message


import requests

amap_key = "6d672e6194caa3b639fccf2caf06c342"

def get_location_coordinate(location, city):
    url = f"https://restapi.amap.com/v5/place/text?key={
        amap_key}&keywords={location}&region={city}"
    print(url)
    r = requests.get(url)
    result = r.json()
    if "pois" in result and result["pois"]:
        return result["pois"][0]
    return None


def search_nearby_pois(longitude, latitude, keyword):
    url = f"https://restapi.amap.com/v5/place/around?key={
        amap_key}&keywords={keyword}&location={longitude},{latitude}"
    print(url)
    r = requests.get(url)
    result = r.json()
    ans = ""
    if "pois" in result and result["pois"]:
        for i in range(min(3, len(result["pois"]))):
            name = result["pois"][i]["name"]
            address = result["pois"][i]["address"]
            distance = result["pois"][i]["distance"]
            ans += f"{name}\n{address}\n距离：{distance}米\n\n"
    return ans

prompt = "我想在北京五道口附近喝咖啡，给我推荐几个"
# prompt = "我到北京出差，给我推荐三里屯的酒店，和五道口附近的咖啡"

messages = [
    {"role": "system", "content": "你是一个地图通，你可以找到任何地址。"},
    {"role": "user", "content": prompt}
]
response = get_completion(messages)
messages.append(response)  # 把大模型的回复加入到对话中
print("=====GPT回复=====")
print_json(response)

while (response.tool_calls is not None):
    # 1106 版新模型支持一次返回多个函数调用请求，所以要考虑到这种情况
    for tool_call in response.tool_calls:
        args = json.loads(tool_call.function.arguments)
        print("函数参数展开：")
        print_json(args)

        if (tool_call.function.name == "get_location_coordinate"):
            print("Call: get_location_coordinate")
            result = get_location_coordinate(**args)
        elif (tool_call.function.name == "search_nearby_pois"):
            print("Call: search_nearby_pois")
            result = search_nearby_pois(**args)

        print("=====函数返回=====")
        print_json(result)

        messages.append({
            "tool_call_id": tool_call.id,  # 用于标识函数调用的 ID
            "role": "tool",
            "name": tool_call.function.name,
            "content": str(result)  # 数值result 必须转成字符串
        })

    response = get_completion(messages)
    messages.append(response)  # 把大模型的回复加入到对话中

print("=====最终回复=====")
print(response.content)
print("=====对话历史=====")
print_json(messages)

```
返回结果：


```
=====GPT回复=====
{
    "content": null,
    "role": "assistant",
    "function_call": null,
    "tool_calls": [
        {
            "id": "call_gIKWSBVtbtJXOt8UfTGrktBy",
            "function": {
                "arguments": "{\"location\":\"五道口\",\"city\":\"北京\"}",
                "name": "get_location_coordinate"
            },
            "type": "function"
        }
    ]
}
函数参数展开：
{
    "location": "五道口",
    "city": "北京"
}
Call: get_location_coordinate
https://restapi.amap.com/v5/place/text?key=88065c081c9a981e2bb5cd11f3d047e4&keywords=五道口&region=北京
=====函数返回=====
{
    "parent": "",
    "address": "(在建)13A号线;13号线",
    "distance": "",
    "pcode": "110000",
    "adcode": "110108",
    "pname": "北京市",
    "cityname": "北京市",
    "type": "交通设施服务;地铁站;地铁站",
    "typecode": "150500",
    "adname": "海淀区",
    "citycode": "010",
    "name": "五道口(地铁站)",
    "location": "116.337742,39.992894",
    "id": "BV10006886"
}
函数参数展开：
{
    "longitude": "116.337742",
    "latitude": "39.992894",
    "keyword": "咖啡"
}
Call: search_nearby_pois
https://restapi.amap.com/v5/place/around?key=88065c081c9a981e2bb5cd11f3d047e4&keywords=咖啡&location=116.337742,39.992894
=====函数返回=====
瑞幸咖啡(五道口地铁站店)
荷清路与成府路交叉口华清嘉园1号楼二层1-2号
距离：97米

八号桥咖啡(华清嘉园东区店)
五道口华清嘉园12号(五道口地铁站B南口步行150米)
距离：120米

星巴克(北京五道口购物中心店)
成府路28号1层101-10B及2层201-09号
距离：122米


=====最终回复=====
以下是在北京五道口附近的几家咖啡店推荐：

1. 瑞幸咖啡(五道口地铁站店)
地址：荷清路与成府路交叉口华清嘉园1号楼二层1-2号
距离：97米

2. 八号桥咖啡(华清嘉园东区店)
地址：五道口华清嘉园12号(五道口地铁站B南口步行150米)
距离：120米

3. 星巴克(北京五道口购物中心店)
地址：成府路28号1层101-10B及2层201-09号
距离：122米

您可以选择其中一家前往享受咖啡时光。
=====对话历史=====
{
    "role": "system",
    "content": "你是一个地图通，你可以找到任何地址。"
}
{
    "role": "user",
    "content": "我想在北京五道口附近喝咖啡，给我推荐几个"
}
{
    "content": null,
    "role": "assistant",
    "function_call": null,
    "tool_calls": [
        {
            "id": "call_gIKWSBVtbtJXOt8UfTGrktBy",
            "function": {
                "arguments": "{\"location\":\"五道口\",\"city\":\"北京\"}",
                "name": "get_location_coordinate"
            },
            "type": "function"
        }
    ]
}
{
    "tool_call_id": "call_gIKWSBVtbtJXOt8UfTGrktBy",
    "role": "tool",
    "name": "get_location_coordinate",
    "content": "{
      'parent': '',
      'address': '(在建)13A号线;13号线',
      'distance': '',
      'pcode': '110000',
      'adcode': '110108',
      'pname': '北京市',
      'cityname': '北京市',
      'type': '交通设施服务;地铁站;地铁站',
      'typecode': '150500',
      'adname': '海淀区',
      'citycode': '010',
      'name': '五道口(地铁站)',
      'location': '116.337742,39.992894',
      'id': 'BV10006886'
    }"
}
{
    "content": null,
    "role": "assistant",
    "function_call": null,
    "tool_calls": [
        {
            "id": "call_IpinGD6TXbnDt3nPDoC0wxJD",
            "function": {
                "arguments": "{\"longitude\":\"116.337742\",\"latitude\":\"39.992894\",\"keyword\":\"咖啡\"}",
                "name": "search_nearby_pois"
            },
            "type": "function"
        }
    ]
}
{
    "tool_call_id": "call_IpinGD6TXbnDt3nPDoC0wxJD",
    "role": "tool",
    "name": "search_nearby_pois",
    "content": "瑞幸咖啡(五道口地铁站店)\n荷清路与成府路交叉口华清嘉园1号楼二层1-2号\n距离：97米\n\n八号桥咖啡(华清嘉园东区店)\n五道口华清嘉园12号(五道口地铁站B南口步行150米)\n距离：120米\n\n星巴克(北京五道口购物中心店)\n成府路28号1层101-10B及2层201-09号\n距离：122米\n\n"
}
{
    "content": "以下是在北京五道口附近的几家咖啡店推荐：\n\n1. 瑞幸咖啡(五道口地铁站店)\n地址：荷清路与成府路交叉口华清嘉园1号楼二层1-2号\n距离：97米\n\n2. 八号桥咖啡(华清嘉园东区店)\n地址：五道口华清嘉园12号(五道口地铁站B南口步行150米)\n距离：120米\n\n3. 星巴克(北京五道口购物中心店)\n地址：成府路28号1层101-10B及2层201-09号\n距离：122米\n\n您可以选择其中一家前往享受咖啡时光。",
    "role": "assistant",
    "function_call": null,
    "tool_calls": null
}

```
### 用 Function Calling 获取 JSON 结构

Function calling 生成 JSON 的稳定性比较高，因为默认启动了 [JSON mode](https://platform.openai.com/docs/guides/text-generation/json-mode)。

需求：从一段文字中抽取联系人姓名、地址和电话

```Python

def get_completion(messages, model="gpt-3.5-turbo"):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,
        tools=[{
            "type": "function",
            "function": {
                "name": "add_contact",
                "description": "添加联系人",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "联系人姓名"
                        },
                        "address": {
                            "type": "string",
                            "description": "联系人地址"
                        },
                        "tel": {
                            "type": "string",
                            "description": "联系人电话"
                        },
                    }
                }
            }
        }],
    )
    return response.choices[0].message


prompt = "帮我寄给王卓然，地址是北京市朝阳区亮马桥外交办公大楼，电话13012345678。"
messages = [
    {"role": "system", "content": "你是一个联系人录入员。"},
    {"role": "user", "content": prompt}
]
response = get_completion(messages)
print("====GPT回复====")
print_json(response)
args = json.loads(response.tool_calls[0].function.arguments)
print("====函数参数====")
print_json(args)

```

返回结果：

```

====GPT回复====
{
    "content": null,
    "role": "assistant",
    "function_call": null,
    "tool_calls": [
        {
            "id": "call_87OnfLzIj4cXKw5XGzmNO0On",
            "function": {
                "arguments": "{\"name\":\"王卓然\",\"address\":\"北京市朝阳区亮马桥外交办公大楼\",\"tel\":\"13012345678\"}",
                "name": "add_contact"
            },
            "type": "function"
        }
    ]
}
====函数参数====
{
    "name": "王卓然",
    "address": "北京市朝阳区亮马桥外交办公大楼",
    "tel": "13012345678"
}

```

只用 JSON Mode，也可以不用 function calling 而获得稳定的 JSON 输出。

### 通过 Function Calling 查询数据库

需求：从订单表中查询各种信息，比如某个用户的订单数量、某个商品的销量、某个用户的消费总额等等。

```Python

#  描述数据库表结构
database_schema_string = """
CREATE TABLE orders (
    id INT PRIMARY KEY NOT NULL, -- 主键，不允许为空
    customer_id INT NOT NULL, -- 客户ID，不允许为空
    product_id STR NOT NULL, -- 产品ID，不允许为空
    price DECIMAL(10,2) NOT NULL, -- 价格，不允许为空
    status INT NOT NULL, -- 订单状态，整数类型，不允许为空。0代表待支付，1代表已支付，2代表已退款
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间，默认为当前时间
    pay_time TIMESTAMP -- 支付时间，可以为空
);
"""

def get_sql_completion(messages, model="gpt-3.5-turbo"):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,
        tools=[{  # 摘自 OpenAI 官方示例 https://github.com/openai/openai-cookbook/blob/main/examples/How_to_call_functions_with_chat_models.ipynb
            "type": "function",
            "function": {
                "name": "ask_database",
                "description": "Use this function to answer user questions about business. \
                            Output should be a fully formed SQL query.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": f"""
                            SQL query extracting info to answer the user's question.
                            SQL should be written using this database schema:
                            {database_schema_string}
                            The query should be returned in plain text, not in JSON.
                            The query should only contain grammars supported by SQLite.
                            """,
                        }
                    },
                    "required": ["query"],
                }
            }
        }],
    )
    return response.choices[0].message


import sqlite3

# 创建数据库连接
conn = sqlite3.connect(':memory:')
cursor = conn.cursor()

# 创建orders表
cursor.execute(database_schema_string)

# 插入5条明确的模拟记录
mock_data = [
    (1, 1001, 'TSHIRT_1', 50.00, 0, '2023-10-12 10:00:00', None),
    (2, 1001, 'TSHIRT_2', 75.50, 1, '2023-10-16 11:00:00', '2023-08-16 12:00:00'),
    (3, 1002, 'SHOES_X2', 25.25, 2, '2023-10-17 12:30:00', '2023-08-17 13:00:00'),
    (4, 1003, 'HAT_Z112', 60.75, 1, '2023-10-20 14:00:00', '2023-08-20 15:00:00'),
    (5, 1002, 'WATCH_X001', 90.00, 0, '2023-10-28 16:00:00', None)
]

for record in mock_data:
    cursor.execute('''
    INSERT INTO orders (id, customer_id, product_id, price, status, create_time, pay_time)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', record)

# 提交事务
conn.commit()


def ask_database(query):
    cursor.execute(query)
    records = cursor.fetchall()
    return records


prompt = "10月的销售额"
# prompt = "统计每月每件商品的销售额"
# prompt = "哪个用户消费最高？消费多少？"

messages = [
    {"role": "system", "content": "基于 order 表回答用户问题"},
    {"role": "user", "content": prompt}
]
response = get_sql_completion(messages)
if response.content is None:
    response.content = ""
messages.append(response)
print("====Function Calling====")
print_json(response)

if response.tool_calls is not None:
    tool_call = response.tool_calls[0]
    if tool_call.function.name == "ask_database":
        arguments = tool_call.function.arguments
        args = json.loads(arguments)
        print("====SQL====")
        print(args["query"])
        result = ask_database(args["query"])
        print("====DB Records====")
        print(result)

        messages.append({
            "tool_call_id": tool_call.id,
            "role": "tool",
            "name": "ask_database",
            "content": str(result)
        })
        response = get_sql_completion(messages)
        print("====最终回复====")
        print(response.content)

```
返回结果：

```
====Function Calling====
{
    "content": "",
    "role": "assistant",
    "function_call": null,
    "tool_calls": [
        {
            "id": "call_QfJD7mEhYw7IYD8lDz267cCt",
            "function": {
                "arguments": "{\"query\":\"SELECT SUM(price) FROM orders WHERE strftime('%m', create_time) = '10' AND status = 1;\"}",
                "name": "ask_database"
            },
            "type": "function"
        }
    ]
}
====SQL====
SELECT SUM(price) FROM orders WHERE strftime('%m', create_time) = '10' AND status = 1;
====DB Records====
[(136.25,)]
====最终回复====
10月的销售额为136.25。

```
### 用 Function Calling 实现多表查询

```Python

#  描述数据库表结构
database_schema_string = """
CREATE TABLE customers (
    id INT PRIMARY KEY NOT NULL, -- 主键，不允许为空
    customer_name VARCHAR(255) NOT NULL, -- 客户名，不允许为空
    email VARCHAR(255) UNIQUE, -- 邮箱，唯一
    register_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 注册时间，默认为当前时间
);
CREATE TABLE products (
    id INT PRIMARY KEY NOT NULL, -- 主键，不允许为空
    product_name VARCHAR(255) NOT NULL, -- 产品名称，不允许为空
    price DECIMAL(10,2) NOT NULL -- 价格，不允许为空
);
CREATE TABLE orders (
    id INT PRIMARY KEY NOT NULL, -- 主键，不允许为空
    customer_id INT NOT NULL, -- 客户ID，不允许为空
    product_id INT NOT NULL, -- 产品ID，不允许为空
    price DECIMAL(10,2) NOT NULL, -- 价格，不允许为空
    status INT NOT NULL, -- 订单状态，整数类型，不允许为空。0代表待支付，1代表已支付，2代表已退款
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间，默认为当前时间
    pay_time TIMESTAMP -- 支付时间，可以为空
);
"""

prompt = "统计每月每件商品的销售额"
# prompt = "这星期消费最高的用户是谁？他买了哪些商品？ 每件商品买了几件？花费多少？"
messages = [
    {"role": "system", "content": "基于 order 表回答用户问题"},
    {"role": "user", "content": prompt}
]
response = get_sql_completion(messages)
print(response.tool_calls[0].function.arguments)

```

返回结果：


```
{"query":"SELECT strftime('%Y-%m', create_time) AS month, product_id, SUM(price) AS total_sales FROM orders WHERE status = 1 GROUP BY month, product_id;"}

```
### Stream 模式

流式（stream）输出不会一次返回完整 JSON 结构，所以需要拼接后再使用。

```Python
def get_completion(messages, model="gpt-3.5-turbo"):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,
        tools=[{
            "type": "function",
            "function": {
                "name": "sum",
                "description": "计算一组数的加和",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "numbers": {
                            "type": "array",
                            "items": {
                                "type": "number"
                            }
                        }
                    }
                }
            }
        }],
        stream=True,    # 启动流式输出
    )
    return response


prompt = "1+2+3"
# prompt = "你是谁"

messages = [
    {"role": "system", "content": "你是一个小学数学老师，你要教学生加法"},
    {"role": "user", "content": prompt}
]
response = get_completion(messages)

function_name, args, text = "", "", ""

print("====Streaming====")

# 需要把 stream 里的 token 拼起来，才能得到完整的 call
for msg in response:
    delta = msg.choices[0].delta
    if delta.tool_calls:
        if not function_name:
            function_name = delta.tool_calls[0].function.name
            print(function_name)
        args_delta = delta.tool_calls[0].function.arguments
        print(args_delta)  # 打印每次得到的数据
        args = args + args_delta
    elif delta.content:
        text_delta = delta.content
        print(text_delta)
        text = text + text_delta

print("====done!====")

if function_name or args:
    print(function_name)
    print_json(args)
if text:
    print(text)

```
返回结果：

```
====Streaming====
sum

{"
numbers
":[
1
,
2
,
3
]}
====done!====
sum
{"numbers":[1,2,3]}

```
* 只有 gpt-3.5-turbo-1106 和 gpt-4-1106-preview 及更高版本的模型可用本次课介绍的方法
* 建议使用模型别名 gpt-3.5-turbo 和 gpt-4-preview 保持使用使用最新模型
* OpenAI 针对 Function Calling 做了 fine-tuning，以尽可能保证函数调用参数的正确。机理后面课时会讲
* 函数声明是消耗 token 的。要在功能覆盖、省钱、节约上下文窗口之间找到最佳平衡
* Function Calling 不仅可以调用读函数，也能调用写函数。但官方强烈建议，在写之前，一定要有真人做确认

## 支持 Function Calling 的国产大模型

### 百度文心大模型

官方文档：https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html

百度文心系列大模型有四个。按发布时间从早到晚是：

1. ERNIE-Bot - 支持 Function Calling
2. ERNIE-Bot-turbo
3. ERNIE-Bot 4.0
4. ERNIE-Bot 3.5 - 支持 Function Calling

参数大体和 OpenAI 一致。

### MiniMax

官方文档：https://api.minimax.chat/document/guides/chat-pro?id=64b79fa3e74cddc5215939f4

- 这是个公众不大知道，但其实挺强的大模型，尤其角色扮演能力
- 如果你曾经在一个叫 Glow 的 app 流连忘返，那么你已经用过它了
- 应该是最早支持 Function Calling 的国产大模型
- Function Calling 的 API 和 OpenAI 1106 版之前完全一样，但其它 API 有很大的特色

### ChatGLM3-6B

官方文档：https://github.com/THUDM/ChatGLM3/tree/main/tools_using_demo

- 最著名的国产开源大模型，生态最好
- 早就使用 `tools` 而不是 `function` 来做参数，其它和 OpenAI 1106 版之前完全一样

### 讯飞星火 3.0

官方文档：https://www.xfyun.cn/doc/spark/Web.html#_2-function-call%E8%AF%B4%E6%98%8E

和 OpenAI 1106 版之前完全一样
