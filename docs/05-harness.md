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

`StepPersistence` 可以将原生消息快照保存到 SQLite。重启后，先由数据库筛选最近成功的顶层运行，只返回一个 `run_id`，再通过框架加载它的完整快照：

```sql
SELECT r.run_id
FROM runs AS r
WHERE r.conversation_id = ?
  AND r.parent_run_id IS NULL
  AND EXISTS (
      SELECT 1 FROM events AS e
      WHERE e.run_id = r.run_id AND e.kind = 'run_completed'
  )
ORDER BY r.started_at DESC, r.rowid DESC
LIMIT 1;
```

会话 ID 通过参数绑定传入。`EXISTS` 只判断成功事件是否存在，不把事件内容加载到应用中。按运行开始时间倒序选取，时间相同时按 SQLite 行号倒序确定顺序。为了同时支持会话筛选与时间排序，可以为顶层运行增加部分复合索引：

```sql
CREATE INDEX IF NOT EXISTS idx_runs_top_conversation_started
ON runs(conversation_id, started_at)
WHERE parent_run_id IS NULL;
```

固定 `conversation_id` 后，SQLite 反向扫描该索引，可按 `started_at DESC, rowid DESC` 依次检查运行，找到第一个成功记录后停止。这里利用 [SQLite 索引排序规则](https://www.sqlite.org/queryplanner.html#multi_column_indices)：普通索引在键相同时按隐含 `rowid` 排列，保留同时间运行的原有选择顺序。成功事件检查继续使用 `events(run_id, seq)` 索引。

索引在恢复时通过 `IF NOT EXISTS` 自动补齐，首次创建会读取已有记录并写入数据库；之后复用已有索引。可以通过 `EXPLAIN QUERY PLAN` 确认使用 `idx_runs_top_conversation_started`，且不再出现 `USE TEMP B-TREE FOR ORDER BY`。索引让结果按所需顺序产生，但若最近多次运行均未成功，仍需继续检查更早的候选记录。

将这个查询放到工作线程执行，避免阻塞异步事件循环。查询没有结果时使用空历史；否则通过已有的 `store` 读取一个快照：

```python
history = []
if run_id is not None:
    snapshot = await store.latest_snapshot(run_id=run_id)
    if snapshot is None:
        raise ValueError("成功运行缺少消息快照")
    history = snapshot.messages

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

### 1.3 Session Schema

先看目前已经实现的数据结构。会话持久化沿用 **Pydantic AI Harness 0.64.0** 的 `StepPersistence` 与 `SqliteStepStore`，字段来源见 [Pydantic AI 的 Step Persistence 源码](https://github.com/pydantic/pydantic-ai/tree/main/src/pydantic_ai_harness/pydantic_ai_harness/step_persistence/)。下面按当前安装版本说明。

#### 会话如何组织

当前没有独立的 `sessions` 表。一个 session 由相同 `conversation_id` 的运行记录组成，每次 `agent.run()` 产生一个 `run_id`。

```text
conversation_id：同一会话
├── run_id：第一次运行
│   ├── metadata：工作目录等附加信息
│   ├── events：运行、模型请求、工具调用的过程事件
│   ├── snapshots：执行过程中保存的消息历史
│   └── tool_effects：工具执行状态
└── run_id：下一次运行
    └── ……
```

| 会话信息 | 当前存放或获取方式 |
| --- | --- |
| 会话 ID | `runs.conversation_id`；应用中的 `session_id` 对应该字段 |
| 标题 | 优先读取运行的 `metadata.title`，否则从首条用户消息提取；没有独立标题列 |
| 工作目录 | 顶层运行的 `metadata.workspace`，值为绝对路径 |
| 消息历史 | 最近成功的顶层运行所保存的完整消息快照 |
| 运行结果状态 | 从 `events.kind` 判断，例如 `run_completed`、`run_failed`；没有独立 session 状态列 |

会话列表中的 `session_id` 和 `title` 是聚合得到的视图，不是完整的持久化记录。工作目录也没有单独的数据库列，而是 metadata JSON 中的一个键：

```json
{"workspace": "/absolute/path/to/project"}
```

#### SQLite 表结构

下表列出当前存储使用的表与字段。`TEXT` 用于标识、时间和序列化 JSON，`INTEGER` 用于序号与步骤编号。

| 表 | 主键 | 其他字段 | 保存什么 |
| --- | --- | --- | --- |
| `runs` | `run_id` | `conversation_id`、`parent_run_id`、`agent_name`、`metadata`、`started_at`、`registration_id` | 一次运行的身份、归属与附加信息 |
| `events` | `seq`，自增 | `run_id`、`kind`、`step_index`、`timestamp`、`conversation_id`、`parent_run_id`、`agent_name`、`tool_call_id`、`tool_name`、`error`、`metadata`、`idempotency_key` | 按顺序追加的过程事件 |
| `snapshots` | `seq`，自增 | `run_id`、`step_index`、`conversation_id`、`parent_run_id`、`agent_name`、`timestamp`、`state`、`messages`、`idempotency_key` | 可恢复的消息历史快照 |
| `snapshot_messages` | `sha256` | `message` | 按内容哈希去重的原生消息 JSON |
| `snapshot_message_refs` | (`snapshot_seq`, `position`) | `sha256` | 一个快照中的消息顺序与内容引用 |
| `snapshot_idempotency_keys` | (`run_id`, `idempotency_key`) | 无 | 防止同一次快照写入被重复保存 |
| `tool_effects` | (`run_id`, `tool_call_id`) | `tool_name`、`status`、`started_at`、`ended_at`、`idempotency_key`、`effect_summary` | 工具调用的执行状态与副作用记录 |

这些表通过 `run_id`、`snapshot_seq` 和 `sha256` 关联；当前 SQLite schema 未声明外键约束。`parent_run_id` 表示运行之间的父子关系，与按 `conversation_id` 分组是两个不同维度。

快照在逻辑上包含完整历史，但物理存储可以复用已有消息：`snapshot_message_refs.position` 保留顺序，`sha256` 指向 `snapshot_messages` 中的正文。此时 `snapshots.messages` 保存存储标记；读取时由框架还原为 `list[ModelMessage]`。

最后区分两个状态：`snapshots.state="complete"` 表示消息中的工具调用已有对应结果，不等于整次运行成功。恢复最近成功上下文时，还需要检查该运行存在 `run_completed` 事件。`tool_effects.status` 为 `started`、`completed` 或 `failed`；进程中断后仍停在 `started` 的调用，外部操作是否已生效需要另行确认。

### 1.4 System Prompt
### 1.5 Tools Seach
### 1.6 MCP
### 1.7 Skills
--------
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
