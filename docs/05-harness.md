## 1. Harness 基础
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

`UsageLimits(request_limit=10)` 限制一次运行中的模型请求次数。

新对话不传 `conversation_id`，由框架生成，成功后从 `result.conversation_id` 获取。已有会话沿用它的 ID，但 ID 本身不会把磁盘中的历史加载到模型上下文。

#### 保存与恢复

`StepPersistence` 可以将原生消息快照保存到 SQLite。重启后，先根据会话 ID 找到最近一次成功运行，再加载完整快照。下面用已有的 `store` 演示恢复步骤：

```python
async def restore_history(store, conversation_id):
    runs = await store.list_runs(conversation_id=conversation_id)
    for run in reversed(runs):
        if run.parent_run_id is not None:
            continue
        events = await store.list_events(run_id=run.run_id)
        if not any(event.kind == "run_completed" for event in events):
            continue
        snapshot = await store.latest_snapshot(run_id=run.run_id)
        if snapshot is None:
            raise ValueError("成功运行缺少消息快照")
        return snapshot.messages
    return []

history = await restore_history(store, saved_id)
result = await agent.run(
    "继续完成上次的任务。",
    conversation_id=saved_id,
    message_history=history,
)
```

这里选择顶层运行中标记为 `run_completed` 的记录，保留完整工具调用、工具结果和压缩摘要。失败、取消、未完成和子 Agent 运行不能覆盖最近成功的上下文。历史读取失败时应明确报错，不能静默改用空历史。

恢复消息历史不会重新执行其中已完成的工具。继续运行后，框架保存新一轮快照，供之后恢复。已执行的文件写入或外部操作不会因为运行失败而自动回滚。

消息恢复和历史检索是两件事：前者把当前上下文重新交给模型，后者按需找回旧原文。摘要压缩后，当前上下文不再保留的细节仍可通过历史检索回查；笔记、检索和摘要机制见[第四章](./04-memory.md)。

### 1.2 workspace

Workspace 决定文件工具的相对路径从哪里解析，以及 shell 命令从哪个目录开始执行。本节沿用 [Pydantic AI 的 Workspace 与 LocalWorkspace](https://pydantic.dev/docs/ai/core-concepts/workspace/)：

```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import LocalWorkspace
from pydantic_ai_harness.coder import Coder

agent = Agent(model, capabilities=[LocalWorkspace(project_dir), Coder()])
```

会话历史和工作目录需要一起恢复。同样的 `read_file("src/main.py")`，在不同目录下会读取不同文件；只恢复消息历史而切换目录，可能把之前的工具结果用于另一个项目。

绑定会话时，先把工作目录转换为绝对路径，再与运行记录一起持久化。例如，在前文的 `StepPersistence` 配置中附加 metadata：

```python
workspace = project_dir.expanduser().resolve()
if not workspace.is_dir():
    raise ValueError("工作目录不存在或不是目录")

persistence = StepPersistence(
    store=store,
    metadata={"workspace": str(workspace)},
)
```

恢复时，先读取该会话顶层运行记录中的目录，再构建 `LocalWorkspace` 并加载消息历史。目录已删除或无法访问时，应明确报错，不能静默换成另一个目录。

会话存储的位置应独立于命令启动目录，否则换一个目录启动后可能找不到旧会话。笔记可以按工作目录组织，让同一项目的多个会话共享约定；消息历史仍按会话 ID 隔离。

`LocalWorkspace` 提供执行目录，不提供进程或文件访问隔离。工作目录绑定也不会阻止工具访问目录之外的本机资源。

--------

<!--后续-->
### 1.3 system prompt
### 1.4 session schema
### 1.5 tool seach
### 1.6 mcp & skill
**mcp registor** **mcp refresh** **mcp 去重** **mcp 无效**

## 2. 护栏
### 2.1 权限

### 2.2 Token 预算

### 2.3 上下文隔离
sessions 并行
## 3. 决策模式
Planning 模式

Reflection 模式

Human-in-the-loop

Chain-of-Thought

## 4. Multi-Agent



## 5. Dsh Super Agent

> [dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype/tree/main)
