---
title: RAG Embeddings
group: AI
layout: doc
date: 2024-03-01T03:48:59.309Z
tags: [AI]
summary: 给大模型提供知识库（文本向量数据库）
sidebar: true
---

## LLM 固有的局限性

* LLM 的知识不是实时的
* LLM 可能不知道你私有的领域/业务知识


## 检索增强生成 RAG（Retrieval Augmented Generation）

原理：可以把这个过程想象成开卷考试。让 LLM 先翻书，再回答问题。

<img src="/images/ai/RAG.png" width="700"/>

## RAG 系统的基本搭建流程

* 文档加载，并按一定条件切割成片段
* 将切割的文本片段灌入检索引擎
* 封装检索接口
* 构建调用流程：Query -> 检索 -> Prompt -> LLM -> 回复

### 文档的加载与切割

```Python
# pip install pdfminer.six

from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer


def extract_text_from_pdf (filename, page_numbers=None, min_line_length=1):
    # '''从 PDF 文件中（按指定页码）提取文字'''
    paragraphs = []
    buffer = ''
    full_text = ''
    # 提取全部文本
    for i, page_layout in enumerate(extract_pages(filename)):
        # 如果指定了页码范围，跳过范围外的页
        if page_numbers is not None and i not in page_numbers:
            continue
        for element in page_layout:
            if isinstance(element, LTTextContainer):
                full_text += element.get_text() + '\n'
    # 按空行分隔，将文本重新组织成段落
    lines = full_text.split('\n')
    for text in lines:
        if len(text) >= min_line_length:
            buffer += (' '+text) if not text.endswith('-') else text.strip('-')
        elif buffer:
            paragraphs.append(buffer)
            buffer = ''
    if buffer:
        paragraphs.append(buffer)
    return paragraphs


paragraphs = extract_text_from_pdf("通化金马.pdf", [1,2],min_line_length=10)

for para in paragraphs:
    print(para+"\n")

```

返回结果：


```

 二、公司关注并核实的相关情况

 针对公司股票异常波动，经通过电话、现场问询等方式对公司控股股东、实

 际控制人、董事会、管理层进行核实，现对有关核实情况说明如下：

 1、公司前期披露的信息未发现需要更正、补充之处。

 2、公司未发现近期公共传媒报道可能或已经对公司股票交易价格产生较大

 影响的未公开重大信息。

……
```

###  检索引擎

先实现一个基础版检索引擎

pip install elasticsearch8 # 搜索引擎数据库


pip install nltk # 文本处理方法库


英文关键词提取

```Python

from elasticsearch7 import Elasticsearch, helpers
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
import re

import warnings
warnings.simplefilter("ignore")  # 屏蔽 ES 的一些Warnings

# 实验室平台已经内置
#nltk.download('punkt')  # 英文切词、词根、切句等方法
#nltk.download('stopwords')  # 英文停用词库
def to_keywords(input_string):
    '''（英文）文本只保留关键字'''
    # 使用正则表达式替换所有非字母数字的字符为空格
    no_symbols = re.sub(r'[^a-zA-Z0-9\s]', ' ', input_string)
    word_tokens = word_tokenize(no_symbols)
    # 加载停用词表
    stop_words = set(stopwords.words('english'))
    ps = PorterStemmer()
    # 去停用词，取词根
    filtered_sentence = [ps.stem(w)
                         for w in word_tokens if not w.lower() in stop_words]
    return ' '.join(filtered_sentence)

```

中文关键词提取


```Python

import re
import jieba
import nltk
from nltk.corpus import stopwords
import warnings
warnings.simplefilter("ignore")  # 屏蔽 ES 的一些Warnings
nltk.download('stopwords')


def to_keywords(input_string):
    # 按搜索引擎模式分词
    word_tokens = jieba.cut_for_search(input_string)
    # 加载停用词表
    stop_words = set(stopwords.words('chinese'))
    # 去除停用词
    filtered_sentence = [w for w in word_tokens if not w in stop_words]
    return ' '.join(filtered_sentence)


def sent_tokenize(input_string):
    # 按标点切分
    sentences = re.split(r'(?<=[。！？；?!])', input_string)
    # 去掉空字符串
    return [sentence for sentence in sentences if sentence.strip()]


if "__main__" == __name__:
    # 测试关键词提取
    print(to_keywords("小明硕士毕业于中国科学院计算所，后在日本京都大学深造"))
    # 测试断句
    print(sent_tokenize("这是，第一句。这是第二句吗？是的！啊"))

```

将文本灌入检索引擎

```Python
from elasticsearch8 import Elasticsearch, helpers
from ExtractText import paragraphs
from TextCutting import to_keywords
import warnings
warnings.simplefilter("ignore")  # 屏蔽 ES 的一些Warnings


# 1. 创建Elasticsearch连接
es = Elasticsearch(
    'http://localhost:9200/',  # 服务地址与端口
    basic_auth=("elastic", "_PebGpTg6*EIgBO2FtzO"),  # 用户名，密码
)

# 2. 定义索引名称
index_name = "demo"

if __name__ == "__main__":

    # 3. 如果索引已存在，删除它（仅供演示，实际应用时不需要这步）
    if es.indices.exists(index=index_name):
        es.indices.delete(index=index_name)

    # 4. 创建索引
    es.indices.create(index=index_name)

    # 5. 灌库指令
    actions = [
        {
            "_index": index_name,
            "_source": {
                "keywords": to_keywords(para),
                "text": para
            }
        }
        for para in paragraphs
    ]

    # 6. 文本灌库
    helpers.bulk(es, actions)


```

实现关键字检索


```Python
from SearchEngine import es, index_name, to_keywords

def search(query_string, top_n=10):
    keywords = to_keywords(query_string)

    # ES 的查询语言
    search_query = {
        "match": {
            "keywords": keywords
        }
    }
    res = es.search(index=index_name, query=search_query, size=top_n)
    return [hit["_source"]["text"] for hit in res["hits"]["hits"]]


results = search("3、近期公司在研国家 I.I 类新药琥珀八氢氨吖啶片项目引起市场广泛关注，", 2)


for r in results:
    print(r+"\n")

```
### LLM 接口封装

```Python
from openai import OpenAI
import os
# 加载环境变量
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())  # 读取本地 .env 文件，里面定义了 OPENAI_API_KEY

client = OpenAI()

def get_completion(prompt, model="gpt-3.5-turbo"):
    '''封装 openai 接口'''
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,  # 模型输出的随机性，0 表示随机性最小
    )
    return response.choices[0].message.content
```

### Prompt 模板

```Python
prompt_template = """
你是一个问答机器人。
你的任务是根据下述给定的已知信息回答用户问题。
确保你的回复完全依据下述已知信息。不要编造答案。
如果下述已知信息不足以回答用户的问题，请直接回复"我无法回答您的问题"。

已知信息:
__INFO__

用户问：
__QUERY__

请用中文回答用户问题。
"""


def build_prompt(prompt_template, **kwargs):
    '''将 Prompt 模板赋值'''
    prompt = prompt_template
    for k, v in kwargs.items():
        if isinstance(v, str):
            val = v
        elif isinstance(v, list) and all(isinstance(elem, str) for elem in v):
            val = '\n'.join(v)
        else:
            val = str(v)
        prompt = prompt.replace(f"__{k.upper()}__", val)
    return prompt

```

### RAG Pipeline 初探

```Python

from Search import search
from PromptTemplate import build_prompt
from GptApi import get_completion


user_query = "公司叫什么名字？"

# 1. 检索
search_results = search(user_query, 10)

# 2. 构建 Prompt
prompt = build_prompt(info=search_results, query=user_query)
print("===Prompt===")
print(prompt)

# 3. 调用 LLM
response = get_completion(prompt)

print("===回复===")
print(response)


```

返回结果


```
===Prompt===

你是一个问答机器人。
你的任务是根据下述给定的已知信息回答用户问题。
确保你的回复完全依据下述已知信息。不要编造答案。
如果下述已知信息不足以回答用户的问题，请直接回复"我无法回答您的问题"。

已知信息:
 除上述事项外，公司、公司控股股东、实际控制人目前不存在关于本公司的
 买卖公司股票情况。
 吖啶片 III 期临床试验盲态数据审核的公告》，集团公司及全资子公司长春华洋
 针对公司股票异常波动，经通过电话、现场问询等方式对公司控股股东、实
 露而未披露的、对本公司股票及其衍生品种交易价格产生较大影响的信息；公司
 2、公司未发现近期公共传媒报道可能或已经对公司股票交易价格产生较大
 本公司董事会确认，除前述事项外，本公司目前没有任何根据深交所《股票
 1、经自查，公司不存在违反信息公平披露的情形。
 通化金马药业集团股份有限公司董事会
 二、公司关注并核实的相关情况

用户问：
公司叫什么名字？

请用中文回答用户问题。

===回复===
公司叫通化金马药业集团股份有限公司。


```

### 关键字检索的局限性

因为是逐字匹配所以，如果是同一个问题换一个说法，可能导致检索不到结果。


## 向量检索

### 文本向量（Text Embeddings）

1. 将文本转成一组浮点数：每个下标 i，对应一个维度
2. 整个数组对应一个 n 维空间的一个点，即**文本向量**又叫 Embeddings
3. 向量之间可以计算距离，距离远近对应**语义相似度**大小

<img src="/images/ai/embeddings.png" width=700px />


### 文本向量是怎么得到的（简单了解）

1. 构建相关（正立）与不相关（负例）的句子对儿样本
2. 训练双塔式模型，让正例间的距离小，负例间的距离大

例如：

<img src="/images/ai/sbert.png" width=700px />

扩展阅读：https://www.sbert.net

### 向量间的相似度计算

<img src="/images/ai/sim.png" width=700px>

调用openAI的Embeddings模型

```Python

def get_embeddings(texts, model="text-embedding-ada-002",dimensions=None):
    '''封装 OpenAI 的 Embedding 模型接口'''
    if model == "text-embedding-ada-002":
        dimensions = None
    if dimensions:
        data = client.embeddings.create(input=texts, model=model, dimensions=dimensions).data
    else:
        data = client.embeddings.create(input=texts, model=model).data
    return [x.embedding for x in data]

```

封装计算欧式距离，余弦距离的函数

```Python
import numpy as np
from numpy import dot
from numpy.linalg import norm


def cos_sim(a, b):
    '''余弦距离 -- 越大越相似'''
    return dot(a, b)/(norm(a)*norm(b))


def l2(a, b):
    '''欧式距离 -- 越小越相似'''
    x = np.asarray(a)-np.asarray(b)
    return norm(x)


```

做一些小测试


```Python

test_query = ["测试文本"]
vec = get_embeddings(test_query)[0]
print(vec[:10])
print(len(vec))

```

返回结果


```
[-0.007280634716153145, -0.006147929932922125, -0.010664181783795357, 0.001484171487390995, -0.010678750462830067, 0.029253656044602394, -0.01976952701807022, 0.005444996990263462, -0.01687038503587246, -0.01207733154296875]
1536

```

<br/>


```Python
# query = "国际争端"

# 且能支持跨语言
query = "global conflicts"

documents = [
    "联合国就苏丹达尔富尔地区大规模暴力事件发出警告",
    "土耳其、芬兰、瑞典与北约代表将继续就瑞典“入约”问题进行谈判",
    "日本岐阜市陆上自卫队射击场内发生枪击事件 3人受伤",
    "国家游泳中心（水立方）：恢复游泳、嬉水乐园等水上项目运营",
    "我国首次在空间站开展舱外辐射生物学暴露实验",
]

query_vec = get_embeddings([query])[0]
doc_vecs = get_embeddings(documents)

print("Cosine distance:")
print(cos_sim(query_vec, query_vec))
for vec in doc_vecs:
    print(cos_sim(query_vec, vec))

print("\nEuclidean distance:")
print(l2(query_vec, query_vec))
for vec in doc_vecs:
    print(l2(query_vec, vec))

```
返回结果


```
Cosine distance:
1.0
0.7622749944010915
0.7563038106493584
0.7426665802579038
0.7079273699608006
0.7254355321045072

Euclidean distance:
0.0
0.6895288502682277
0.6981349637998769
0.7174028746492277
0.7642939833636829
0.7410323668625171

```

### 向量数据库

向量数据库，是专门为向量检索设计的中间件

pip install chromadb

用chroma作为向量数据库

chroma run --path /db_path 启动数据库


```Python

import chromadb


class MyVectorDBConnector:
    def __init__(self, collection_name, embedding_fn):
        chroma_client = chromadb.HttpClient(host='localhost', port=8000)
        # 为了演示，实际不需要每次 reset()
        # chroma_client.reset()

        # 创建一个 collection
        self.collection = chroma_client.get_or_create_collection(name=collection_name)
        self.embedding_fn = embedding_fn

    def add_documents(self, documents):
        # '''向 collection 中添加文档与向量'''
        print(documents)
        self.collection.add(
            embeddings=self.embedding_fn(documents),  # 每个文档的向量
            documents=documents,  # 文档的原文
            ids=[f"id{i}" for i in range(len(documents))]  # 每个文档的 id
        )

    def search(self, query, top_n):
        # '''检索向量数据库'''
        results = self.collection.query(
            query_embeddings=self.embedding_fn([query]),
            n_results=top_n
        )
        return results


```
<br/>

```Python
# 创建一个向量数据库对象
vector_db = MyVectorDBConnector("demo", get_embeddings)
# 向向量数据库中添加文档
vector_db.add_documents(paragraphs)


from VectorDB import vector_db


user_query = "公司的名字"
results = vector_db.search(user_query, 10)

for para in results['documents'][0]:
    print(para+"\n")

```

### 主流向量数据库功能对比

<img src="/images/ai/vectordb.png" width=700px/>


- FAISS: Meta 开源的向量检索引擎 https://github.com/facebookresearch/faiss
- Pinecone: 商用向量数据库，只有云服务 https://www.pinecone.io/
- Milvus: 开源向量数据库，同时有云服务 https://milvus.io/
- Weaviate: 开源向量数据库，同时有云服务 https://weaviate.io/
- Qdrant: 开源向量数据库，同时有云服务 https://qdrant.tech/
- PGVector: Postgres 的开源向量检索引擎 https://github.com/pgvector/pgvector
- RediSearch: Redis 的开源向量检索引擎 https://github.com/RediSearch/RediSearch
- ElasticSearch 也支持向量检索 https://www.elastic.co/enterprise-search/vector-search

### 基于向量检索的 RAG

```Python
class RAG_Bot:
    def __init__(self, vector_db, llm_api, n_results=2):
        self.vector_db = vector_db
        self.llm_api = llm_api
        self.n_results = n_results

    def chat(self, user_query):
        # 1. 检索
        search_results = self.vector_db.search(user_query, self.n_results)

        # 2. 构建 Prompt
        prompt = build_prompt(info=search_results['documents'][0], query=user_query)

        print("===Prompt===")
        print(prompt)

        # 3. 调用 LLM
        response = self.llm_api(prompt)
        return response

# 创建一个RAG机器人
bot = RAG_Bot(
    vector_db,
    llm_api=get_completion
)

user_query = "文章发布时间是？"

response = bot.chat(user_query)

print(response)

```
### 国产大模型

embedding 模型，百度千帆 bge_large_zh；
chat，调用文心4.0对话接口。

```Python

import json
import requests
import os
# 加载 .env 到环境变量
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())


# 通过鉴权接口获取 access token
def get_access_token():
    # """
    # 使用 AK，SK 生成鉴权签名（Access Token）
    # :return: access_token，或是None(如果错误)
    # """
    url = "https://aip.baidubce.com/oauth/2.0/token"
    params = {
        "grant_type": "client_credentials",
        "client_id": os.getenv("ERNIE_CLIENT_ID"),
        "client_secret": os.getenv("ERNIE_CLIENT_SECRET")
    }

    return str(requests.post(url, params=params).json().get("access_token"))


# 调用文心千帆 调用 BGE Embedding 接口
def get_embeddings_bge(prompts):
    url = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/embeddings/bge_large_zh?access_token=" + get_access_token()
    payload = json.dumps({
        "input": prompts
    })
    headers = {'Content-Type': 'application/json'}

    response = requests.request("POST", url, headers=headers, data=payload).json()
    data = response["data"]
    return [x["embedding"] for x in data]


# 调用文心4.0对话接口
def get_completion_ernie(prompt):

    url = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=" + get_access_token()
    payload = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    })

    headers = {'Content-Type': 'application/json'}

    response = requests.request(
        "POST", url, headers=headers, data=payload).json()

    return response["result"]


if __name__ == '__main__':
    res = get_embeddings_bge(['一二三四五'])
    print(len(res[0]))


```
<br/>

```Python

# 创建一个RAG机器人
bot = RAG_Bot(vector_db,llm_api=get_completion_ernie,n_results=20)

query = "文章发布主体是什么公司？"
response = bot.chat(query)
print("===回复===")
print(response)

```
返回结果

```

===Prompt===

你是一个问答机器人。
你的任务是根据下述给定的已知信息回答用户问题。
确保你的回复完全依据下述已知信息。不要编造答案。
如果下述已知信息不足以回答用户的问题，请直接回复"我无法回答您的问题"。

已知信息:
 股票交易异常波动公告
 吖啶片 III 期临床试验盲态数据审核的公告》，集团公司及全资子公司长春华洋
 大投资者，股票价格可能受到宏观经济、市场环境、行业发展、公司经营情况及
 通化金马药业集团股份有限公司
 2、目前公司经营情况及内外部经营环境未发生重大变化。公司郑重提醒广
 投资者偏好等多重因素影响，敬请广大投资者注意交易风险，审慎决策、理性投
 本公司及董事会全体成员保证信息披露的内容真实、准确、完整，没有虚假
 3、2023 年 8 月 31 日，公司披露了《关于完成国家 I.I 类新药琥珀八氢氨
 20%。根据深圳证券交易所的有关规定，该情形属于股票交易异常波动的情况。
 记载、误导性陈述或重大遗漏。
 证券代码：000766        证券简称：通化金马        公告编号：2023-47
 政策等多方面因素的影响，药政评审决策、相关研发进展及未来产品市场竞争形
 床成盲态数据审核。但新药研发尤其是国家 I.I 类新药的研发受到技术、审批、
 1、通化金马药业集团股份有限公司（以下简称“公司”）股票交易价格连续
 二个交易日（2023 年 9 月 13 日、9 月 14 日）日收盘价格涨幅偏离值累计超过
 高科技有限公司自主研发、具有独家专利的琥珀八氢氨吖啶片已经完成 III 期临

用户问：
文章发布主体是什么公司？

请用中文回答用户问题。

===回复===
文章发布主体是通化金马药业集团股份有限公司。


```
文本向量化的接口，文本参数有长度限制，最大16。中文的效果似乎要比openai的好。

### OpenAI 新发布的两个 Embedding 模型


2024年1月25日，OpenAI 新发布了两个 Embedding 模型

- text-embedding-3-large
- text-embedding-3-small

其最大特点是，支持自定义的缩短向量维度，从而在几乎不影响最终效果的情况下降低向量检索与相似度计算的复杂度。

通俗的说：**越大越准、越小越快。** 官方公布的评测结果:

<img src="/images/ai/mteb.png" width=700px />

注：[MTEB](https://huggingface.co/blog/mteb) 是一个大规模多任务的 Embedding 模型公开评测集

扩展阅读：这种可变长度的 Embedding 技术背后的原理叫做 [Matryoshka Representation Learning](https://arxiv.org/abs/2205.13147)

## 实战 RAG 系统的进阶知识

### 文本分割的粒度

**缺陷**

1. 粒度太大可能导致检索不精准，粒度太小可能导致信息不全面
2. 问题的答案可能跨越两个片段

**解决**

重叠切割，每一段切割的片段，向前向后伸展一定长度。

```Python

from nltk.tokenize import sent_tokenize # 英文分句 ，中文用前面自己写的方法
import json


def split_text(paragraphs, chunk_size=300, overlap_size=100):
    '''按指定 chunk_size 和 overlap_size 交叠割文本'''
    sentences = [s.strip() for p in paragraphs for s in sent_tokenize(p)]
    chunks = []
    i = 0
    while i < len(sentences):
        chunk = sentences[i]
        overlap = ''
        prev_len = 0
        prev = i - 1
        # 向前计算重叠部分
        while prev >= 0 and len(sentences[prev])+len(overlap) <= overlap_size:
            overlap = sentences[prev] + ' ' + overlap
            prev -= 1
        chunk = overlap+chunk
        next = i + 1
        # 向后计算当前chunk
        while next < len(sentences) and len(sentences[next])+len(chunk) <= chunk_size:
            chunk = chunk + ' ' + sentences[next]
            next += 1
        chunks.append(chunk)
        i = next
    return chunks


chunks = split_text(paragraphs, 300, 100)

vector_db = MyVectorDBConnector("demo_text_split", get_embeddings)
# 向向量数据库中添加文档
vector_db.add_documents(chunks)

```

返回结果：

```
===Prompt===

你是一个问答机器人。
你的任务是根据下述给定的已知信息回答用户问题。
确保你的回复完全依据下述已知信息。不要编造答案。
如果下述已知信息不足以回答用户的问题，请直接回复"我无法回答您的问题"。

已知信息:
3、近期公司在研国家 I.I 类新药琥珀八氢氨吖啶片项目引起市场广泛关注， 公司提醒广大投资者注意二级市场炒作风险。 4、《中国证券报》、《证券时报》、《上海证券报》和巨潮资讯网为公司选定的
信息披露媒体，公司所有信息均以在上述指定媒体刊登的信息为准，请广大投资 者理性投资，注意风险。 通化金马药业集团股份有限公司董事会 2023 年 9 月 14 日
际控制人、董事会、管理层进行核实，现对有关核实情况说明如下： 1、公司前期披露的信息未发现需要更正、补充之处。 2、公司未发现近期公共传媒报道可能或已经对公司股票交易价格产生较大 影响的未公开重大信息。
吖啶片 III 期临床试验盲态数据审核的公告》，集团公司及全资子公司长春华洋 高科技有限公司自主研发、具有独家专利的琥珀八氢氨吖啶片项目于 2023 年 8
公司 前期披露的信息不存在需要更正、补充之处。 1、经自查，公司不存在违反信息公平披露的情形。 2、新药研发尤其是国家 I.I 类新药的研发受到技术、审批、政策等多方面

用户问：
文章发布主体是什么公司？

请用中文回答用户问题。

===回复===
文章发布主体是通化金马药业集团股份有限公司。

```
效果确实要比之前的好，之前返回不了文章发布主体

### 检索后排序

**问题**:

有时，最合适的答案不一定排在检索的最前面

**方案**:

1. 检索时过招回一部分文本
2. 通过一个排序模型对 query 和 document 重新打分排序

<img src="/images/ai/sbert-rerank.png" width=700px>


```Python
pip install sentence_transformers


from sentence_transformers import CrossEncoder

model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2', max_length=512)


user_query = "how safe is llama 2"

scores = model.predict([(user_query, doc)
                       for doc in search_results['documents'][0]])
# 按得分排序
sorted_list = sorted(
    zip(scores, search_results['documents'][0]), key=lambda x: x[0], reverse=True)
for score, doc in sorted_list:
    print(f"{score}\t{doc}\n")
```

这个用于缩减召回条数，比较有用。

### 混合检索（Hybrid Search）


在**实际生产**中，传统的关键字检索（稀疏表示）与向量检索（稠密表示）各有优劣。

举个具体例子，比如文档中包含很长的专有名词，关键字检索往往更精准而向量检索容易引入概念混淆。


```Python

query = "非小细胞肺癌的患者"

documents = [
    "李某患有肺癌，癌细胞已转移",
    "刘某肺癌I期",
    "张某经诊断为非小细胞肺癌III期",
    "小细胞肺癌是肺癌的一种"
]

query_vec = get_embeddings([query])[0]
doc_vecs = get_embeddings(documents)

print("Cosine distance:")
for vec in doc_vecs:
    print(cos_sim(query_vec, vec))

```

返回结果

```
Cosine distance:
0.9106675359933479
0.8895478505819983
0.9039165614288258
0.9131441645902685

```

根据返回结果是最后一个最贴近搜索结果，但实际上相差了很远……


所以，有时候我们需要结合不同的检索算法，来达到比单一检索算法更优的效果。这就是**混合检索**。

混合检索的核心是，综合文档 $d$ 在不同检索算法下的排序名次（rank），为其生成最终排序。

一个最常用的算法叫 **Reciprocal Rank Fusion（RRF）**

<img src="/images/ai/RRF.png" width=700px />

其中 A 表示所有使用的检索算法的集合，rank_a(d) 表示使用算法 a 检索时，文档 d 的排序，k 是个常数。

简答来说就是，用一个常数加上一种算法的排名，取倒数，然后各种算法的得分取和。自然排名越靠前，得分越高。

很多向量数据库都支持混合检索，比如 [Weaviate](https://weaviate.io/blog/hybrid-search-explained)、[Pinecone](https://www.pinecone.io/learn/hybrid-search-intro/) 等。也可以根据上述原理自己实现。

### RAG-Fusion

RAG-Fusion 就是利用了 RRF 的原理来提升检索的准确性。

<img src="/images/ai/rag-fusion.jpeg" width=700px />

简单来说就是，用户给出一个 query，然后向量化，通过模型把这个query转换成多个意思相同的query，然后用 RRF 进行融合，得出最后的结果。

原始项目（一段非常简短的演示代码）：https://github.com/Raudaschl/rag-fusion

## 向量模型的本地部署


```Python
from sentence_transformers import SentenceTransformer

#model_name = 'BAAI/bge-large-zh-v1.5' #中文
model_name = 'moka-ai/m3e-base' #中英双语，但效果一般

model = SentenceTransformer(model_name)


#query = "国际争端"
query = "global conflicts"

documents = [
    "联合国就苏丹达尔富尔地区大规模暴力事件发出警告",
    "土耳其、芬兰、瑞典与北约代表将继续就瑞典“入约”问题进行谈判",
    "日本岐阜市陆上自卫队射击场内发生枪击事件 3人受伤",
    "国家游泳中心（水立方）：恢复游泳、嬉水乐园等水上项目运营",
    "我国首次在空间站开展舱外辐射生物学暴露实验",
]

query_vec = model.encode(query)

doc_vecs = [
    model.encode(doc)
    for doc in documents
]

print("Cosine distance:")  # 越大越相似
#print(cos_sim(query_vec, query_vec))
for vec in doc_vecs:
    print(cos_sim(query_vec, vec))
```
返回结果

```
Cosine distance:
0.6958812
0.65735227
0.6653426
0.6371888
0.6942898

```

扩展阅读：https://github.com/FlagOpen/FlagEmbedding


- 不是每个 Embedding 模型都对余弦距离和欧氏距离同时有效
- 哪种相似度计算有效要阅读模型的说明（通常都支持余弦距离计算）


## 总结

- 离线步骤：
  1. 文档加载
  2. 文档切分
  3. 向量化
  4. 灌入向量数据库

- 在线步骤：
  1. 获得用户问题
  2. 用户问题向量化
  3. 检索向量数据库
  4. 将检索结果和用户问题填入 Prompt 模版
  5. 用最终获得的 Prompt 调用 LLM
  6. 由 LLM 生成回复
