## 1. memory
> 记忆系统让 Agent 从"每次都是陌生人"变成"越用越懂你"。但别指望它记住一切——向量相似度不是精确匹配，召回率和准确率需要取舍。

上一章讲的上下文窗口管理，解决的是"单次对话内"的记忆。但用户关了浏览器、换了设备、过了几天再来，那些上下文就没了。真实场景中，用户会：
- **中断后继续昨天的话题**
- **希望 Agent 记住自己的偏好**
- **不想每次都重复解释背景**

没有记忆系统的 Agent 就像失忆症患者——每次见面都要重新自我介绍。
### 1.1 记忆类型
记忆分为4类：
![memory category](./images/018.png?sw=996&sh=490)

工作记忆和会话记忆，上一章的上下文窗口管理已经覆盖了。

这章重点讲长期记忆和语义记忆——如何让 Agent 跨会话记住东西。

> **session**，就是会话。Coder Cli 默认让 Agent 在首轮运行生成会话 ID，传入 `--sessionId` 可沿用同一 ID 检索历史。

### 1.2 记忆存到哪
记忆存在哪里，要看保存什么、怎么查找，以及是否需要多人共享。

| 方案 | 适合什么 | 主要不足 |
| --- | --- | --- |
| 本地文件 | 保存偏好、项目约定和任务笔记，方便直接查看、修改 | 多个进程同时修改、跨设备共享较麻烦 |
| SQLite | 在本机保存大量对话记录，按条件查找，不用另起服务 | 不适合多个服务同时大量写入 |
| MySQL / PostgreSQL | 多个用户、多个服务共享记录 | 需要搭建和维护数据库服务 |
| Redis | 暂存经常读取的内容，加快访问 | 主要解决读取速度，长期记录仍需可靠保存 |
| 向量数据库 | 按意思查找，比如用“喜欢吃什么”找到“我爱吃川菜” | 需要额外处理文本，也可能找错或漏掉 |

回到 Pydantic AI 工程，项目使用的 Harness 0.64.0 已有这些能力：

- **记笔记**：`Memory` 配合 `FileStore`，提供文件读写和文本搜索；笔记需要多个进程同时写时，可改用 `SqliteMemoryStore`。
- **存历史、查历史**：`StepPersistence` 配合 `SqliteStepStore` 保存运行记录，`ConversationSearch` 按关键词查找旧内容，不需要向量数据库。
- **共享笔记**：已有 `PostgresMemoryStore`；将来做多用户服务时，优先复用它，比另写 MySQL 存储更省事。

因此，**当前 Coder Cli 选择文件存笔记、SQLite 存历史**。它是本地工具，先用框架现成能力即可；暂不增加 Redis，也不引入向量数据库。等确实出现读取慢，或“换个说法就找不到”的问题，再补对应能力。

注意，`Memory` 让模型按需记笔记，完整运行历史由 `StepPersistence` 保存。当前 `agent/runtime.py` 已接入文件笔记、SQLite 历史和关键词搜索。

参考：[官方 Memory](https://pydantic.dev/docs/ai/harness/memory/)、[历史搜索](https://pydantic.dev/docs/ai/harness/conversation-search/)。

### 1.3 记忆存什么

记忆保存**用户偏好**、**任务进度**和**可复用的经验**。处理这些内容时，要区分三份数据：

| 数据 | 保存什么 | 用来做什么 |
| --- | --- | --- |
| 原始记录 | 对话、工具调用和返回结果 | 核对原话、报错和操作细节 |
| 笔记或摘要 | 从原文提炼的事实、约束、结论和未完成事项 | 快速了解背景，跨对话复用 |
| 向量 | 用 Embedding 模型把文本转成的一组数字 | 按意思查找对应文本 |

**LLM 做摘要，Embedding 做向量，两者用途不同。** 摘要是人能读的文字，向量用于计算相近程度。语义记忆保存的是可复用的事实和经验；它可以写成文件，也可以配上向量方便查找。

摘要通常在任务阶段结束，或旧对话过长时生成。比如使用下面这段 prompt 提取：

> 提取用户明确要求、已确认事实、采用的方案、未完成事项。保留关键名称和数值，不补充原文没有的结论；不确定的内容单独标明。

保存前检查摘要是否遗漏关键条件，并附上日期、所属项目和原文编号。比如，把多轮端口排查整理成“8000 被占用，改用 8001，接口请求成功”，同时保留当时的记录。摘要可能遗漏细节，原始记录仍需保留。

写入分为过滤、去重、更新和拆分：**LLM 判断内容，程序执行检查和存储。** 一种可实现的写入流程如下。

| 步骤 | 谁来做 | 工程上怎么做 |
| --- | --- | --- |
| 过滤 | LLM 提取，程序校验 | <ul><li>LLM 从新对话中提取候选记忆，附上来源编号；没有就返回空列表。</li><li>程序检查正文非空、来源编号存在；事实仍需核对原文。</li></ul> |
| 去重 | 程序比对，必要时由 LLM 确认 | <ul><li>程序在同一用户、项目内比较正文，相同则复用旧记录。</li><li>措辞不同则搜索相近记录，由 LLM 判断是否重复、是否有新信息。</li></ul> |
| 更新 | LLM 比对，程序替换 | <ul><li>程序按项目和主题查旧记录，将正文和编号交给 LLM。</li><li>LLM 建议新增或替换；程序确认旧记录属于当前项目，再更新正文和版本号。</li></ul> |
| 拆开 | 程序切段 | <ul><li>短笔记整条保存；长文按标题、段落切分，超长再细切。</li><li>每段保留来源、顺序和原文位置，通常无需调用 LLM。</li></ul> |

去重时，程序可对去掉首尾空白后的正文计算哈希，用“用户 + 项目 + 哈希”检查是否已保存。向量相近只能用来找候选，不能直接当作重复：比如“端口是 8001”和“端口改成 8002”很相近，却需要更新。

比对后分三种处理：**事实相同、没有新信息，跳过正文写入，只补充新的来源编号；同一事项发生变化，更新旧记录；内容不同，新增记录。** 去重结果应在写入时再次检查；若用数据库保存，可用上述组合的唯一约束，避免两个任务同时写入相同内容。

例如，LLM 可以提出下面的更新；其中旧记录 `m17` 必须是程序提供的候选，不能由模型随意指定：

```json
{"action": "replace", "target_id": "m17", "text": "天气服务端口改为 8002", "source_ids": ["msg42"]}
```

若使用向量存储，程序在保存正文后调用 Embedding 模型，再按同一记录编号写入新向量，并附上版本号。更新失败要记录并重试；搜索返回时核对正文版本，丢弃尚未更新的旧向量结果。长文重新切段后，也要删除或停用旧段，避免新旧内容同时命中。

### 1.4 记忆检索

少量笔记可以直接交给 LLM，让它挑出与问题相关的内容；笔记越多，读取成本越高。内容较多时，常用向量搜索，先缩小范围，再把找到的文字交给 LLM。

**查找流程：问题 → 生成问题向量 → 查相近记录 → 取回文本 → LLM 回答。**

生成向量后，要把它和对应文字关联起来，因为搜索用的是向量，交给 LLM 阅读的是文字。以 Qdrant 查询为例：假设 `memories` 使用余弦相似度，已存有向量及对应的 `text`（正文）、`project`（项目）、`source`（原文位置），`query_vector` 已由同一 Embedding 模型生成。

```python
import httpx

# 用问题向量搜索，而不是用问题文字匹配。
response = httpx.post(
    "http://localhost:6333/collections/memories/points/query",
    json={
        "query": query_vector,
        # 只查 frontend 项目的记录。
        "filter": {"must": [{"key": "project", "match": {"value": "frontend"}}]},
        "score_threshold": 0.7,  # 排除低分记录；示例值，需用实际问题调整。
        "limit": 12,  # 多取一些候选，去重后最多保留 3 条。
        "with_payload": ["text", "source"],  # 同时取回正文和来源。
    },
    timeout=10,
)
response.raise_for_status()  # 查询失败时抛出异常，不当作“没有记忆”。

# 相同正文只保留一份，合并编号和来源；不同段落仍分别保留。
unique = {}
for point in response.json()["result"]["points"]:
    payload = point["payload"]
    text = payload["text"].strip()
    if not text:
        continue
    memory = unique.setdefault(text, {"text": text, "ids": [], "sources": []})
    memory["ids"].append(point["id"])
    if payload["source"] not in memory["sources"]:
        memory["sources"].append(payload["source"])

# 查询结果已按分数从高到低排列，保持这个顺序截取。
memories = list(unique.values())[:3]
```

1. **准备输入**：先把“React 组件怎么优化”转成 `query_vector`，再作为 `query` 传入。生成向量的步骤在示例中省略，必须使用与入库时配套的同一 Embedding 模型。
2. **筛选候选**：`filter` 限定项目，`score_threshold=0.7` 排除低分记录，`limit=12` 最多取 12 条候选。分数门槛要用实际问题调整，不能保证高分内容一定有用。
3. **合并重复**：`with_payload` 取回正文和来源；`unique` 按去掉首尾空白后的正文查重，将重复记录的编号、来源合并。最后按原来的分数顺序，最多保留 3 条。
4. **用于回答**：下一步把 `memories` 中的 `text`、`sources` 和用户问题一起交给 LLM。若列表为空，就说明没有找到符合条件的记忆；需要核对细节时，按来源读取原文。

这里合并的是正文相同的片段，不会仅因两段文字相近就删掉其中一段。按意思查找可以让“React 组件怎么优化”命中“前端渲染性能提升方案”；文件名、错误码等精确信息，仍可配合关键词搜索。

实际请求通常组合三类内容：**近期对话保持连贯，相关旧记录补充细节，摘要提供长期背景**。

### 1.5 Memory 实战

先看框架已经提供什么，再决定要补什么。项目锁定的 Pydantic AI 2.64.0 / Harness 0.64.0 中：

| 能力 | 可以直接做什么 | 还缺什么 |
| --- | --- | --- |
| `Memory` + `FileStore` | 保存、更新笔记，按文本搜索 | 不自动按意思查找 |
| `StepPersistence` + `ConversationSearch` | 保存运行历史，按关键词查旧记录 | 不自动提炼长期笔记 |
| `SummarizingCompaction` | 对旧历史额外调用 LLM 生成摘要，保留近期消息 | 用于当前上下文压缩，不会自动把结论写进长期笔记或向量库 |
| `Embedder` | 用 `embed_documents()` 生成内容向量，用 `embed_query()` 生成问题向量 | 不负责向量入库和搜索 |

CLI 已接入文件笔记、SQLite 历史、关键词搜索和 LLM 摘要。需要跨措辞查找时，再用 `Embedder` 补上语义搜索。

```bash
uv run python main.py --sessionId demo
# 在同一会话中依次提出任务：
# 记住：本项目使用中文回答。请保存到记忆。
# 搜索记忆和之前的对话，告诉我本项目的回答语言。
```

在 `coder-cli` 目录运行。同一 workspace 共享笔记，`--sessionId` 限定历史检索范围；不传时由 Agent 在首轮运行生成 ID，成功后从结果获取。同一会话的下一轮显式传入上一轮消息；重启后根据已有 ID 加载最近成功轮次的完整消息快照，恢复模型上下文；经过摘要压缩的旧原文仍按需检索。

例如，排查天气服务后，可以这样保存笔记：

```text
.agent-memory/main/
├── MEMORY.md       # 常用约定：中文回答；测试命令 uv run pytest
└── weather.md      # 专题笔记，内容如下

日期：2026-11-03
问题：weather.py 启动失败，报 Address already in use
原因：8000 端口已被占用
处理：改用 8001，同时更新客户端地址
验证：请求天气接口成功
```

这是笔记格式示例，不是当前工程的排查记录。`main/` 是 `Memory` 默认的笔记目录；`MEMORY.md` 放短内容，专题文件放细节。

在 Pydantic AI 的 `Memory` 路径中，模型决定记什么、调用哪个写入工具；框架负责实际文件读写：

- **过滤**：由模型根据指令决定是否调用 `write_memory`，不是框架自动筛选。若要固定在每个阶段结束后提取，就由应用代码额外调用一个 Agent，用 `output_type` 约束候选列表，再校验和保存。
- **去重**：框架会防止同一次写入工具调用重放后重复执行，但不会自动合并不同调用写入的相同事实。不传 `old_text` 的写入仍会追加；正文查重、相近内容比对和来源合并需要模型或应用代码处理。
- **更新**：模型先读取旧笔记，再调用 `write_memory(file=..., old_text=..., content=...)`。框架只替换唯一匹配的原文；未找到或匹配多处时要求模型重试。不传 `old_text` 是追加，不会自动识别重复或矛盾。
- **拆开**：模型可以主动写入不同专题文件；框架不会自动切段。文件超过大小限制会拒绝写入并要求拆分。向量切段、记录编号和版本同步仍需应用代码实现。

上面的“候选列表 → 校验 → 去重 → 新增或更新 → 同步向量”是完整写入流程的设计；当前 CLI 使用模型调用记忆工具的方式，尚未实现独立提取和向量同步流程。

下面摘出 `agent/runtime.py` 中的记忆配置，省略了原有 Coder、Skills、MCP 和网页工具，复用前文的 `model`：

```python
from pathlib import Path
from pydantic_ai import Agent
from pydantic_ai.capabilities import LocalWorkspace
from pydantic_ai_harness import Memory, StepPersistence, ConversationSearch, SummarizingCompaction
from pydantic_ai_harness.memory import FileStore
from pydantic_ai_harness.step_persistence import SqliteStepStore
from pydantic_ai_harness.conversation_search import SnapshotHistorySource

workspace = Path("workspace").resolve()
workspace.mkdir(exist_ok=True)
store = SqliteStepStore(database=str(workspace / "sessions.db"))
agent = Agent(
    model,
    capabilities=[
        LocalWorkspace(workspace),
        StepPersistence(store=store),
        ConversationSearch(
            SnapshotHistorySource(store), scope="conversation", max_matches=3,
        ),
        SummarizingCompaction(max_messages=60, keep_messages=20),
        Memory(
            FileStore(".agent-memory"), max_tokens=1000, max_search_results=3,
            injection_errors="raise",
        ),
    ],
    instructions=(
        "保存用户明确要求和已验证结论，已有笔记过期时替换旧内容。"
        "需要旧细节时，先搜索笔记，再搜索对话历史；找不到就说明找不到。"
    ),
)
```

这段配置实际提供：

- `MEMORY.md` 的部分内容随请求带入，预算约 1000 token；其他笔记按需搜索，每次最多返回 3 条。
- 模型可调用 `search_memory(query="8000")` 搜索笔记，调用 `search_conversation_history(query="Address already in use")` 查原始报错；历史搜索最多返回 3 处匹配。
- 历史搜索只查同一对话。第一轮传 `conversation_id="weather-debug"`，下一轮传上一轮的 `message_history`；重启后仍可沿用这个 ID 搜索，但 ID 本身不会把旧消息自动加载成当前对话；本项目 CLI 已在[第五章](./05-harness.md)中补上快照加载，并显式传入 `message_history`。

当前运行超过 60 条消息时，`SummarizingCompaction` 尝试摘要旧历史、保留近期约 20 条消息，具体机制见[上一章](./03-context-window.md#12-上下文工程)。压缩摘要若要成为长期记忆，还需另行提炼、检查并保存到笔记。`injection_errors="raise"` 让笔记加载失败时明确报错，避免悄悄跳过记忆。

验证记忆是否有效，运行离线测试：

```bash
uv run python -m unittest discover -s tests -p 'test_runtime.py' -v
```

测试实际写入笔记后，启动新 Python 进程，检查笔记是否自动带入请求、能否通过 `search_memory` 找回；再检查旧内容替换，以及同一会话历史的检索和隔离。测试使用模拟模型，不请求真实模型 API。

本次离线验证通过：新进程加载并搜到 `PORT_PROBE=8001`，更新后只保留 `PORT_PROBE=8002`；原会话能查回历史证据，其他会话查不到。完整测试共 10 项，全部通过。

补语义搜索时，CLI 需要增加两条路径：

- **保存**：将已确认的笔记或原文段落交给 `Embedder.embed_documents()`；把向量、文字、项目和原文编号一起写入向量存储。
- **查询**：提供一个 `search_semantic_memory` 工具，内部用 `Embedder.embed_query()` 处理问题，过滤当前项目，查询少量相近记录，返回文字和来源给模型。

本地 CLI 先用本地向量索引；用 PostgreSQL 的服务可考虑 pgvector，无需为此同时引入 Redis 和另一套数据库。更换 Embedding 模型或配置后，要重新生成已有内容的向量。当前兼容聊天接口是否支持 Embedding 也需单独验证。

参考：[《记忆架构》8.4–8.6 节](https://waylandz.com/ai-agent-book/第08章-记忆架构/)、[Pydantic AI Embeddings](https://pydantic.dev/docs/ai/embeddings/)、[向量搜索与过滤](https://qdrant.tech/documentation/concepts/search/)、[Memory](https://pydantic.dev/docs/ai/harness/memory/)、[Conversation Search](https://pydantic.dev/docs/ai/harness/conversation-search/)。
