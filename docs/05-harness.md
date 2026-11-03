## 1. Harness 
Agent 所有核心已经单独讲解完。在核心之上再补充工程化代码，以及权限、安全护栏，可观测性与评测就是一套 Harness。Pydantic AI 是 Agent Framework，再补充实际 Agent 场景（比如 coding，客户系统）工程系统，就是 Agent Harness（智能运行层），如 Claude Code，DeepSeek Harness(dsh)，OpenClaw 等。

> Agent = Model + Harness

本章会使用前面的知识和**系统知识**来实现完整的 Coding Agent。

### 1.1 多轮对话

多轮对话需要把上一轮消息作为下一轮的上下文。复用同一个 Agent 实例不会自动记住上一轮；真正维持对话的是显式传入 `message_history`。

#### 传递完整消息

复用前文已配置模型和工具的 `agent`：

```python
first = agent.run_sync("分析当前项目，并给出修改计划。")
second = agent.run_sync(
    "按刚才的计划继续。",
    conversation_id=first.conversation_id,
    message_history=first.all_messages(),
)
```

`all_messages()` 包含用户输入、模型回复、工具调用和工具结果。只保存最终的 `result.output` 会丢失执行依据，不能代替完整消息历史。

每轮成功后，用新的 `result.all_messages()` 替换当前历史；不要把它追加到旧列表中，否则会重复传入已有消息。启用上下文压缩后，这份历史也包含框架保留的近期消息和摘要。

#### 区分会话、运行

以下术语和字段命名沿用 [Pydantic AI 官方文档](https://pydantic.dev/docs/ai/api/pydantic-ai/run/)。

| 数据 | 作用 |
| --- | --- |
| `conversation_id` | 标识同一段对话，多轮之间沿用 |
| `run_id` | 标识一轮 Agent 运行 |
| `message_history` | 决定这一轮模型能看到哪些已有消息 |

一次 `agent.run()` 可以包含多次模型请求和工具调用，运行标识从 `result.run_id` 获取。同一会话中的多次运行沿用 `conversation_id`，每次运行各有自己的 `run_id`。

当前项目的 `UsageLimits(request_limit=10)` 限制一次运行中的模型请求次数。

新对话不传 `conversation_id`，由框架生成，成功后从 `result.conversation_id` 获取。已有会话沿用它的 ID，但 ID 本身不会把磁盘中的历史加载到模型上下文。

#### 保存与恢复

本项目使用 `StepPersistence` 将原生消息快照保存到 SQLite。应用重启后，先根据会话 ID 找到最近一次成功运行，再加载它的完整快照，并显式传给下一轮：

```python
from pathlib import Path
from sessions import load_session_history

history = await load_session_history(Path("workspace/sessions.db"), saved_id)
result = await agent.run(
    "继续完成上次的任务。",
    conversation_id=saved_id,
    message_history=history,
)
```

`load_session_history()` 是本项目的恢复代码：只选择顶层运行中标记为 `run_completed` 的轮次，保留完整工具调用、工具结果和压缩摘要。失败、取消、未完成和子 Agent 轮次不能覆盖最近成功的上下文。历史读取失败时应明确报错，不能静默改用空历史。

恢复消息历史不会重新执行其中已完成的工具。继续运行后，框架保存新一轮快照，供之后恢复。已执行的文件写入或外部操作不会因为运行失败而自动回滚。

消息恢复和历史检索是两件事：前者把当前上下文重新交给模型，后者按需找回旧原文。摘要压缩后，当前上下文不再保留的细节仍可通过历史检索回查；笔记、检索和摘要机制见[第四章](./04-memory.md)。

### 1.2 workspace

--------

<!--后续-->
多 session 并行

tool seach、渐进披露
几十个工具加一堆 MCP server，上下文撑不住，于是有了 tool search 和渐进披露。

护栏

权限

Token 预算控制

多 Agent

Planning 模式

Reflection 模式

Human-in-the-loop

Chain-of-Thought

Super Agent
