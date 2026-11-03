## 1. Context Window
Agent 里的另一核心就是管理有限的上下文窗口和构建长期记忆。

### 1.1 上下文窗口
上下文窗口可以理解为每次 LLM 请求传递的完整数据。它包含7个组成部分：

- **System Instructions** — 系统指令，定义角色和行为边界
- **User Prompt** — 用户的当前请求
- **Conversation History** — 对话历史
- **Long-Term Memory** — 跨会话的持久记忆
- **Retrieved Information (RAG)** — 实时检索的外部知识
- **Available Tools** — 可用工具的定义和 schema
- **Output Format** — 输出格式要求

每一项都在争夺上下文窗口这块有限的空间。上下文工程的核心挑战，就是在这七个维度之间做出最优分配。

记住一句话："Agent 的失败，本质上是上下文的失败，而不是模型的失败。"

上下文窗口不是无限的。理解它的物理约束，是做好上下文工程的前提。Token（令牌）是 LLM 处理文本的最小单位——不是字符，也不是单词，而是模型内部切分文本的"碎片"。不同语言的 token 效率不同：
![intro](./images/016.png?sw=754&sh=392)
> ⚠️ 时效性提示 (2026-01): Token 计数依赖具体 tokenizer，以下换算为约数。实际使用请调用对应 SDK 的 token 计数 API。

精确计算文本 token 需要匹配模型的 tokenizer；完整请求还要考虑消息格式、工具定义和多模态内容。并不是 tokenizer 一定很慢，而是在每轮都检查上下文预算时，可以先用低成本估算。Pydantic AI 中要区分两种用途：

**1. 上下文压缩：按字符数粗估。** 本项目锁定的 `pydantic-ai-harness==0.64.0` 提供 `estimate_token_count()`。不传入 tokenizer 时，它提取消息里的文本片段，将字符数相加，再整除 4。核心规则可简化为：

```python
estimated_tokens = total_characters // 4
```

可以直接调用公开函数：

```python
from pydantic_ai.messages import ModelRequest, UserPromptPart
from pydantic_ai_harness.compaction import estimate_token_count

messages = [ModelRequest(parts=[UserPromptPart(content="Hello world!")])]
assert estimate_token_count(messages) == 3  # 12 个字符，12 // 4
```

这里的字符数是 Python 的 `len(text)`，不是 UTF-8 字节数。这个方法不运行分词器，也不请求模型，但中文、压缩 JSON 等内容可能被明显低估；图片、音频和完整工具 schema 也不能靠消息文本长度准确计入。它适合粗略判断何时压缩历史，不能当作账单或请求一定能放进窗口的保证。

Harness 的 `estimate_context_tokens()` 会优先使用最近一次模型响应中服务商报告的 usage 作为基准，再估算后续新增内容；没有 usage 时才回退到字符估算。`estimate_token_count(messages, tokenizer=...)` 也允许传入返回 token 数的函数，但即使文本分词准确，也不等于完整请求计数准确。参见 [Compaction 官方文档](https://pydantic.dev/docs/ai/harness/compaction/)。

实际做窗口预算时，还要给工具定义、多模态内容和模型输出预留空间；接近上限时，使用目标模型支持的请求计数方法校验，并留出估算误差余量。

### 1.2 上下文工程
上下文工程，是在有限窗口内持续组织和维护模型所需信息的过程：**组装指令、历史、检索结果和工具 → 估算预算并预留输出空间 → 按需裁剪或摘要 → 请求模型 → 将回复和工具结果加入历史，进入下一轮**。Pydantic AI 组织请求，Harness 提供估算和压缩能力。

主要做三件事：

- **控制输入**：精简指令，按需检索，工具结果分页或过滤，完整资料留在外部。
- **传递历史**：通过 `message_history` 显式传入；复用 Agent 实例不会自动记住上一轮。
- **压缩历史**：在 `before_model_request` 阶段处理，更新后续使用的历史，并维护工具调用与返回的配对关系。

Harness 提供几种策略：

- `DeduplicateFileReads`：清空被较新读取替代的旧文件读取内容，不调用模型。
- `ClearToolResults`：清空旧工具结果，保留近期结果，不调用模型。
- `SlidingWindowCompaction`：丢弃较早消息，保留近期历史，不调用模型。
- `SummarizingCompaction`：摘要旧历史，保留近期消息，额外调用模型。

代码摘要（Pydantic AI 2.64.0 / Harness 0.64.0）：复用前文的 `model`，接入现有 Agent 时将压缩能力加入原有 `capabilities`。

```python
from pydantic_ai import Agent
from pydantic_ai_harness.compaction import SummarizingCompaction

agent = Agent(
    model,
    capabilities=[SummarizingCompaction(max_tokens=24_000, keep_messages=10)],
)

first = agent.run_sync("分析项目，记录修改计划。")
second = agent.run_sync("继续完成修改并验证。", message_history=first.all_messages())
```

配置要点：

- `max_tokens=24_000`：估算上下文超过此值时尝试压缩；不是模型窗口大小。
- `keep_messages=10`：保留近期消息的目标数量，不是 10 轮对话；实际边界受工具配对等规则影响。
- `max_fraction=0.75`：可替代 `max_tokens`，按窗口比例触发；兼容接口需核实窗口，必要时用 `context_window` 覆盖。
- **区分限额**：压缩的 `max_tokens` 控制触发时机；`model_settings.max_tokens` 限制单次输出；`UsageLimits` 限制运行用量，不会自动裁剪历史。
- **留出余量**：为输出、工具定义和估算误差预留空间；压缩不保证一定低于阈值，摘要可能遗漏细节，也不能替代长期记忆或原始存档。

参考：[压缩策略](https://pydantic.dev/docs/ai/harness/compaction/)、[消息与历史](https://pydantic.dev/docs/ai/message-history/)、[UsageLimits](https://pydantic.dev/docs/ai/api/pydantic-ai/usage/#pydantic_ai.usage.UsageLimits)。

### 1.3 压缩算法

`SlidingWindowCompaction` 使用了**滑动窗口思想**：保留近期历史，淘汰较早历史。具体实现是超过阈值后批量裁剪，而不是经典双指针逐步移动窗口。以下以本项目的 Harness 0.64.0 为准。

```python
from pydantic_ai_harness.compaction import SlidingWindowCompaction

compaction = SlidingWindowCompaction(max_messages=80, keep_messages=40)
```

算法过程：

1. **检查阈值**：消息数、估算 token 数或窗口占比超限时触发。
2. **定位切点**：按消息数保留时，初始切点为 `len(messages) - keep_messages`。
3. **修正边界**：若切开工具调用与返回，则向前移动切点，将依赖一起保留。
4. **补回保护内容**：默认保留首条用户请求，并恢复被固定的内容等。
5. **更新历史**：后续步骤使用裁剪后的历史，全程不调用 LLM。

参数有两个容易误解的地方：

- **触发量和保留量不同**：上述配置超过 80 条才触发，触发后保留近期约 40 条；工具依赖和保护内容可能使结果超过 40 条。
- **`keep_tokens` 不是严格上限**：设置正数时，算法通过二分查找定位满足最低保留 token 量的最短原始后缀，再补齐工具依赖；不能把它理解成“最多保留这么多 token”。

其他策略采用不同的处理规则：

- **按资源去重 — `DeduplicateFileReads`**：同一文件的新读取替代旧读取，清空旧结果。
- **按类型清理 — `ClearToolResults`**：清空较早工具结果，保留近期结果和对话结构。
- **摘要替换 — `SummarizingCompaction`**：用模型摘要替换旧历史，近期内容保留原文。
- **分层处理 — `TieredCompaction`**：逐层执行策略，每层后重新估算，达到目标就停止；可先清理，再摘要。

参考：[Harness 策略与保留规则](https://pydantic.dev/docs/ai/harness/compaction/)。

不同框架可以从“选哪些消息”和“是否修改历史”两个维度比较：

| 实现 | 核心算法 | 边界处理 | 历史变化 |
| --- | --- | --- | --- |
| Pydantic Harness `SlidingWindowCompaction` | 超阈值后截取近期后缀 | 向前扩展，维护工具配对 | 更新运行历史 |
| LangChain `trim_messages(strategy="last")` | 按 token 或消息预算截取后缀 | 可配置起止消息类型、保留 system、是否部分截断 | 返回裁剪结果，是否写回由调用方决定 |
| AutoGen `BufferedChatCompletionContext` | 取最后 N 条消息 | 若首条是工具执行结果，则移除 | 返回视图，内部历史保留 |
| AutoGen `TokenLimitedChatCompletionContext` | 反复计数，超限就删除中间消息 | 最后处理开头的工具执行结果 | 返回视图，内部历史保留 |

- **窗口裁剪不等于摘要**：前者丢弃旧信息，后者尝试压缩保留，代价是额外模型调用和可能遗漏细节。
- **返回视图不等于删除历史**：本次请求看不到的消息，可能仍在内部存储；Pydantic 的运行历史裁剪也不代表外部存档被删除。
- **名称不代表淘汰顺序**：所查 AutoGen token 限制实现删除中间消息，更倾向保留开头与结尾，并非普通滑动窗口。

对比依据：[LangChain API](https://reference.langchain.com/python/langchain-core/messages/utils/trim_messages)、[AutoGen Buffered 源码](https://microsoft.github.io/autogen/dev/_modules/autogen_core/model_context/_buffered_chat_completion_context.html)、[AutoGen TokenLimited 源码](https://microsoft.github.io/autogen/dev/_modules/autogen_core/model_context/_token_limited_chat_completion_context.html)。其他框架采用所链接文档的实现，升级版本时需重新核对；这里比较机制，不代表性能或效果排名。

### 1.4 工程扩展

实际 Coder 的长任务还需要 **Write + Select**：将信息写到上下文之外，需要时再取回，与窗口裁剪、摘要配合使用。

- **Write（写出）**：保存任务进度、决策、测试日志和原始对话；上下文保留简述与资料位置。
- **Select（选择与检索）**：按当前步骤搜索路径、符号、错误信息或历史记录，再读取相关原文；不必每轮加载全部资料，也不一定需要向量检索。
- **Compress（压缩）**：清理、裁剪或摘要当前历史，控制窗口占用；外部保存的信息仍可按需取回。

工作流程：**执行并记录 → 写入任务状态和证据位置 → 清理上下文 → 后续按需检索 → 继续执行**。这种方式让摘要负责保留任务概况，原始资料负责提供精确细节。参见 [LangChain 上下文工程分类](https://www.langchain.com/blog/context-engineering-for-agents)、[Anthropic 外部笔记与按需检索](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)。

Pydantic AI Harness 有两条互补路径：

- **主动笔记**：`Memory` 提供 `write_memory`、`search_memory` 等工具，记录目标、约束、决策和下一步；默认只注入有预算限制的笔记片段与文件列表。
- **历史回查**：`StepPersistence` 保存逐步快照，`ConversationSearch` 从同一存储中恢复历史并用 BM25 检索；它不负责写入，也不会自动把所有历史塞回上下文。

代码摘要（Pydantic AI 2.64.0 / Harness 0.64.0）：复用前文的 `model`，为单用户本地 Coder 组合笔记、历史检索和裁剪。接入现有工程时，保留原有 Skills、MCP、工具和指令。

```python
from pathlib import Path
from pydantic_ai import Agent
from pydantic_ai.capabilities import LocalWorkspace
from pydantic_ai_harness import (
    ConversationSearch, Memory, SlidingWindowCompaction, StepPersistence,
)
from pydantic_ai_harness.coder import Coder
from pydantic_ai_harness.conversation_search import SnapshotHistorySource
from pydantic_ai_harness.memory import FileStore
from pydantic_ai_harness.step_persistence import SqliteStepStore

workspace = Path("workspace").resolve()
workspace.mkdir(exist_ok=True)
store = SqliteStepStore(database=str(workspace / "sessions.db"))

agent = Agent(
    model,
    capabilities=[
        LocalWorkspace(workspace), Coder(),
        StepPersistence(store=store),
        ConversationSearch(SnapshotHistorySource(store), scope="conversation"),
        SlidingWindowCompaction(max_messages=80, keep_messages=40),
        Memory(FileStore(".agent-memory")),
    ],
    instructions=(
        "阶段结束时更新任务笔记，记录约束、决策、进度和证据路径。"
        "需要旧细节时先搜索笔记或对话历史；代码事实以当前文件为准。"
    ),
)

first = agent.run_sync("分析项目并保存修改计划。", conversation_id="local-task-1")
second = agent.run_sync("继续修改并验证。", message_history=first.all_messages())
```

实现要点：

- **职责分开**：笔记由模型按需写入，指令引导不等于保证写入；运行快照由 `StepPersistence` 保存。完整测试日志仍需显式写入文件，快照不包含工具没有返回的内容。
- **检索范围**：两轮通过历史继承同一 `conversation_id`；框架不会仅凭 ID 自动恢复 `message_history`；本项目 CLI 已在[第五章](./05-harness.md)中显式加载最近成功的消息快照，恢复后继续传入该历史。
- **先压缩，后注入**：将 `Memory` 放在压缩能力之后，让笔记作用于压缩后的请求。
- **保持可追溯**：笔记记录结论和原文位置，区分已验证事实与推测；代码改变后应重新读取，避免依赖过期副本。当前目标和关键约束保持可见，不完全依赖检索命中。
- **保存不等于可恢复**：必须保留压缩前快照；若清理了它们，对应原文可能无法找回。该版本历史检索对中文连续文本的分词有限，路径、函数名和错误码更适合精确查询。
- **范围限制**：示例面向单用户本地工程；多用户服务需按用户隔离存储、工作区与会话身份，不能仅依赖模型传入的 ID。

参考：[Memory](https://pydantic.dev/docs/ai/harness/memory/)、[Conversation Search](https://pydantic.dev/docs/ai/harness/conversation-search/)、[Step Persistence](https://pydantic.dev/docs/ai/harness/step-persistence/)。

### 1.5 上下文隔离

上下文隔离，是将不同任务的输入和执行历史分开管理：**确定共享背景 → 为任务建立独立上下文 → 在各自上下文中推进 → 按需交换结论和证据**，避免无关信息持续进入同一个窗口。

- **与 Select 的区别**：Select 决定本次请求读取什么；Isolate 决定不同任务各自维护哪份上下文，以及信息如何跨边界流动。
- **与 Compress 的区别**：Compress 缩减已有历史；Isolate 将不同任务的后续历史分开，减少相互干扰。
- **隔离的价值**：调试过程、失败尝试和工具输出留在所属任务中，其他任务只接收需要的结果。

以分支对话为例：讨论中同时出现方案 A 和方案 B，可以共享此前的需求分析，之后分别维护两份历史。

1. **确定边界**：选择话题分离前的共同背景；若历史已经混杂，先筛选或整理任务交接内容。
2. **独立推进**：A 的新增消息只进入 A，B 的新增消息只进入 B，双方不自动接收对方后续内容。
3. **选择性回流**：比较方案时传回结论、关键约束和验证证据，避免重新合并全部探索历史。

Pydantic AI 2.64.0 可通过显式传递不同的 `message_history` 实现这一点；新 `conversation_id` 标识分支，真正决定模型看到什么的是传入的历史。复用前文的 `agent`：

```python
base = agent.run_sync("分析共同需求与约束。")

branch = agent.run_sync(
    "独立评估方案 B，只讨论它的实现与风险。",
    message_history=base.all_messages(),
    conversation_id="new",
)
main = agent.run_sync(
    "继续评估方案 A。",
    message_history=base.all_messages(),  # 不传入 branch 的新增历史
)
```

不同框架提供的构件不同，但需要明确的上下文边界相同：

| 框架 | 共同背景如何进入 | 后续上下文如何分开 |
| --- | --- | --- |
| Pydantic AI | 显式传入 `message_history` | 各自继续自己的历史，新会话 ID 用于标识 |
| LangGraph | 从同一个 checkpoint 的状态分叉 | 分别推进分支状态；其中传给模型的消息仍由应用决定 |
| Claude Agent SDK | Fork 继承已有会话历史 | 后续对话写入独立分支，原对话可继续 |

使用时注意：

- **分叉不等于清空**：继承的旧历史仍占窗口，也可能包含无关任务；需要时配合 Select 和 Compress。
- **历史分开不等于状态全隔离**：共享的 Memory、工具、deps 和文件仍可能传递信息或相互影响；新 ID 不会自动隔离这些资源。
- **控制回流内容**：只回传结论可能漏掉前提，传回全部历史又会失去隔离价值；应保留任务相关的约束、证据位置和未解决问题。

这里关注“每个任务看到什么、后续信息流向哪里”。Session 的标识、分支保存、恢复与切换将在 [04-session.md](./04-session.md) 中展开。

参考：[Pydantic AI 消息历史](https://pydantic.dev/docs/ai/core-concepts/message-history/)、[LangGraph 分叉](https://docs.langchain.com/oss/python/langgraph/use-time-travel)、[Claude 分支对话](https://code.claude.com/docs/en/agent-sdk/sessions)。

### 1.6 Cache

Agent 会反复发送指令、工具定义和历史消息，重复输入可能成为主要成本。这里的 **Prompt Cache** 由模型服务商保存前缀的 KV 状态，后续请求命中时复用计算；新增输入仍需处理，回答仍重新生成，也不减少上下文窗口占用。

处理过程：**查找可复用前缀 → 复用命中部分，计算其余输入 → 按服务商策略写入新缓存 → 生成回答**。相同前缀不保证命中，还取决于模型、最低缓存长度、有效期和服务商规则。

优化原则：

- **稳定前缀**：尽量保持指令、工具定义及顺序稳定，将时间戳、随机 ID 等动态内容后置；变化位置之前的前缀仍可能复用。
- **优先追加**：新消息追加到末尾有利于复用，但需要纠错、裁剪或摘要时仍应修改历史，不能为命中率保留无关内容。
- **工具控制按接口实现**：接口支持时，用 `tool_choice`、`allowed_tools` 等控制调用范围，避免不必要地改动工具定义；工具执行端仍须校验权限。
- **按服务商配置**：工具和指令的内部顺序、缓存开关与 TTL 不通用。例如 Anthropic 按 `tools → system → messages` 缓存，提供默认 5 分钟及可选 1 小时 TTL。
- **看实际收益**：区分普通输入、缓存写入、缓存读取和输出的计价；写入可能更贵，读取通常更便宜。以总费用和延迟评估，不套用固定折扣或提速比例。

参考：[OpenAI Prompt Caching](https://developers.openai.com/api/docs/guides/prompt-caching)、[Anthropic Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)。

**Pydantic AI 的实现与应用**（本项目 Pydantic AI 2.64.0 / Harness 0.64.0）：

- **配置层**：`Caching()` 通过统一的 `ModelSettings.cache` 设置表达缓存策略，模型适配层将其转换为支持的服务商参数或缓存断点；KV 本身由服务商管理。
- **能力边界**：仅隐式缓存且无请求侧配置的模型可能忽略该设置；兼容 OpenAI 接口不代表支持同样的缓存行为。
- **Coder 默认开启**：现有 `Coder()` 默认设置 `cache=True`，无需再叠加 `Caching()`；可用 `model_settings={"cache": ...}` 覆盖默认值。`Coder(caching=False)` 仅移除默认配置，不保证关闭服务商的隐式缓存。
- **可选配置**：该版本支持 `cache=True`、`False`、`"5m"`、`"30m"`、`"1h"`，实际 TTL 按服务商支持档位映射；服务商专用缓存设置优先于统一设置。

独立 Agent 的配置摘要，复用前文的 `model`：

```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import Caching

agent = Agent(
    model,
    capabilities=[Caching()],  # 对应统一设置 cache=True
    instructions="根据项目事实回答，保留关键约束和验证结果。",
)

first = agent.run_sync("分析需求并给出修改计划。")
second = agent.run_sync("继续细化计划。", message_history=first.all_messages())

usage = second.usage
print(usage.input_tokens, usage.cache_read_tokens, usage.cache_write_tokens)
```

- **保持复用条件**：两轮共享稳定指令和已有历史，但是否命中仍由服务商决定。
- **减少无效写入**：大量一次性请求只共享指令时，可用 `Caching(messages=False)` 请求只缓存稳定前缀；仅对支持该控制的模型有效。
- **正确观测**：`result.usage` 是本次运行的累计用量；`cache_read_tokens` 和 `cache_write_tokens` 已包含在 `input_tokens` 中，不要重复相加。字段为 0 时，需检查是否支持、达到长度门槛，以及服务商是否返回对应统计。

参考：[Pydantic AI Caching](https://pydantic.dev/docs/ai/capabilities/caching/)、[Coder 缓存配置](https://pydantic.dev/docs/ai/harness/coder/#prompt-caching)。

**本项目实测（2026-11-03）**：使用 `GLM-5.3-Flash-Event`，连续两次运行相同 query，保持配置一致且不调用工具。当时的单次 CLI 输出了逐请求和累计缓存统计。当前 TUI 在状态行展示累计值，悬停查看逐请求值。

在 `coder-cli` 目录中，加载已有 `.env` 配置，确认天气 MCP 服务 `http://127.0.0.1:8000/mcp` 可用后，启动 TUI，发送以下请求，等待完成后退出，再启动一次并发送同一请求：

```bash
.venv/bin/python main.py
# 在 TUI 中发送；完成后 Ctrl+Q 退出，再启动一次重复发送：
# 这是缓存验证请求。不要调用任何工具，不要创建、读取或修改任何文件。只回复：缓存验证完成。
```

本次记录使用两个独立的单次 CLI 进程，未传递 `message_history`；当前 TUI 重启后发送第一条消息可保持同样的上下文隔离。两次都只请求模型一次，并回复“缓存验证完成。”；框架启动时会发现 MCP 工具，但模型未调用业务工具。缓存由服务商跨请求复用，不依赖同一个 Python 进程。

| 运行 | 输入 token | 缓存读取 token | 缓存输入占比 |
| --- | ---: | ---: | ---: |
| 第一次 | 3054 | 0 | 0% |
| 第二次 | 3054 | 2944 | **96.4%** |

第二次确认服务商报告缓存命中。该比例不代表费用或延迟降低 96.4%；本次未测费用和提速幅度。
