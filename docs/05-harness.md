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

`StepPersistence(capture_frontier=True)` 在模型请求前、模型回复后和工具完成等边界保存原生快照。失败、取消或未完成的运行也可能包含有效进度，不能只按 `run_completed` 筛选历史。

数据库选择最近有快照的顶层运行，只读取一个 `run_id`，再加载一份最新快照；成功运行缺少快照时仍明确报错：

```sql
SELECT r.run_id FROM runs AS r
WHERE r.conversation_id = ? AND r.parent_run_id IS NULL
  AND (
    EXISTS (SELECT 1 FROM snapshots AS s WHERE s.run_id = r.run_id)
    OR EXISTS (
      SELECT 1 FROM events AS e
      WHERE e.run_id = r.run_id AND e.kind = 'run_completed'
    )
  )
ORDER BY r.started_at DESC, r.rowid DESC
LIMIT 1;
```

没有快照的启动失败不会遮住已有进度。会话 ID 使用参数绑定；查询放到工作线程执行。复用部分复合索引，按时间倒序寻找记录，避免临时排序：

```sql
CREATE INDEX IF NOT EXISTS idx_runs_top_conversation_started
ON runs(conversation_id, started_at)
WHERE parent_run_id IS NULL;
```

`EXISTS` 使用框架已有的 `snapshots(run_id, seq)`、`events(run_id, seq)` 索引。可用 `EXPLAIN QUERY PLAN` 验证没有 `USE TEMP B-TREE FOR ORDER BY`。索引排序原理见 [SQLite Query Planner](https://www.sqlite.org/queryplanner.html#multi_column_indices)。

```python
from pydantic_ai.messages import repair_messages

snapshot = await store.latest_snapshot(run_id=run_id, include_interrupted=True)
if snapshot is None:
    raise ValueError("运行缺少消息快照")
history = repair_messages(snapshot.messages)

result = await agent.run(
    "继续完成上次的任务。",
    conversation_id=saved_id,
    message_history=history,
)
```

`repair_messages()` 为未返回结果的工具调用补上 `outcome="interrupted"`，保留原有消息并阻止恢复时自动重放。interrupted 不代表操作没有执行：文件写入、发信等副作用需查验工具执行记录和实际结果，不能盲目重试。

同一进程内失败后继续请求，也要先恢复最新快照，避免用旧的成功历史覆盖未完成进度。历史读取失败时明确报错，不静默使用空历史。恢复只包含已持久化的消息，进程终止前尚未写入的流式片段无法找回。[Pydantic AI Step Persistence](https://pydantic.dev/docs/ai/harness/step-persistence/)

消息恢复与历史检索不同：前者恢复当前上下文，后者按需找回压缩前的原文；见[第四章](./04-memory.md)。

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

会话和运行需要分开保存：一个会话可以暂时没有运行，而每次 `agent.run()` 才产生一个 `run_id`。仅从 `runs` 聚合会话，会遗漏尚未发送消息的空会话。

因此，应用层增加 `sessions` 登记表，保存会话身份、工作目录和创建时间。ID 使用 Pydantic AI 的公开 `Conversation` 类型生成，随后交给各次运行沿用：

```python
from pydantic_ai.conversation import Conversation

conversation = Conversation()
conversation_id = conversation.conversation_id
# 将 conversation_id、工作目录和创建时间保存到会话登记表。
# 后续运行使用 agent.run(..., conversation_id=conversation_id)。
```

保存空会话不需要调用模型，也不应插入一条虚假的运行记录。运行过程与快照仍由框架的 `StepPersistence` 保存。

```text
sessions.conversation_id：同一会话，可以有零到多次运行
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
| 会话 ID | `sessions.conversation_id`；运行通过 `runs.conversation_id` 关联，应用中的 `session_id` 对应该值 |
| 标题 | 优先读取运行的 `metadata.title`，否则从首条用户消息提取；没有独立标题列 |
| 工作目录 | 会话登记表的 `workspace`；运行的 `metadata.workspace` 同时记录执行目录 |
| 消息历史 | 最近有快照的顶层运行，包含未完成进度 |
| 运行结果状态 | 从 `events.kind` 判断，例如 `run_completed`、`run_failed`；没有独立 session 状态列 |

会话列表合并会话登记与运行记录，按最近活动排序；还没有消息时使用默认标题，出现消息后再提取标题。旧的运行记录即使没有会话登记，也可以继续按 `conversation_id` 聚合。运行 metadata 中仍保留工作目录：

```json
{"workspace": "/absolute/path/to/project"}
```

#### SQLite 表结构

下表列出当前存储使用的表与字段。`sessions` 是应用层登记表，其余表沿用框架的运行持久化结构。`TEXT` 用于标识、时间和序列化 JSON，`INTEGER` 用于序号与步骤编号。

| 表 | 主键 | 其他字段 | 保存什么 |
| --- | --- | --- | --- |
| `sessions` | `conversation_id` | `workspace`、`created_at` | 独立于模型运行的会话身份与工作目录 |
| `runs` | `run_id` | `conversation_id`、`parent_run_id`、`agent_name`、`metadata`、`started_at`、`registration_id` | 一次运行的身份、归属与附加信息 |
| `events` | `seq`，自增 | `run_id`、`kind`、`step_index`、`timestamp`、`conversation_id`、`parent_run_id`、`agent_name`、`tool_call_id`、`tool_name`、`error`、`metadata`、`idempotency_key` | 按顺序追加的过程事件 |
| `snapshots` | `seq`，自增 | `run_id`、`step_index`、`conversation_id`、`parent_run_id`、`agent_name`、`timestamp`、`state`、`messages`、`idempotency_key` | 可恢复的消息历史快照 |
| `snapshot_messages` | `sha256` | `message` | 按内容哈希去重的原生消息 JSON |
| `snapshot_message_refs` | (`snapshot_seq`, `position`) | `sha256` | 一个快照中的消息顺序与内容引用 |
| `snapshot_idempotency_keys` | (`run_id`, `idempotency_key`) | 无 | 防止同一次快照写入被重复保存 |
| `tool_effects` | (`run_id`, `tool_call_id`) | `tool_name`、`status`、`started_at`、`ended_at`、`idempotency_key`、`effect_summary` | 工具调用的执行状态与副作用记录 |

这些表通过 `run_id`、`snapshot_seq` 和 `sha256` 关联；当前 SQLite schema 未声明外键约束。`parent_run_id` 表示运行之间的父子关系，与按 `conversation_id` 分组是两个不同维度。

快照在逻辑上包含完整历史，但物理存储可以复用已有消息：`snapshot_message_refs.position` 保留顺序，`sha256` 指向 `snapshot_messages` 中的正文。此时 `snapshots.messages` 保存存储标记；读取时由框架还原为 `list[ModelMessage]`。

最后区分两个状态：`snapshots.state="complete"` 表示消息中的工具调用已有对应结果，不等于整次运行成功。恢复历史不要求存在 `run_completed` 事件；挂起的工具调用先补为 interrupted，再交给模型继续。`tool_effects.status` 为 `started`、`completed` 或 `failed`；进程中断后仍停在 `started` 的调用，外部操作是否已生效需要另行确认。

### 1.4 System Prompt
System Prompt 分成两层：固定的角色与通用规则，以及会随项目变化的概览。分层思路参考[项目感知与上下文组织设计](https://fivwvysqdz.feishu.cn/wiki/D079wzybGiVdxnkbQ6kcwB12nIb)，组装使用 [Pydantic AI 的 instructions](https://pydantic.dev/docs/ai/api/pydantic-ai/agent/#pydantic_ai.agent.Agent.instructions)。

#### 固定层：角色与通用规则

固定层统一描述协作方式、任务范围、先调查再修改、工具使用和验证要求。完整文本保存在 [system.md](../coder-cli/prompts/system.md)，与 Python 代码分开维护；同一个 Agent 的后续运行复用这段文本。

工具相关指令必须匹配实际注册的工具。框架提供文件读取、搜索和 shell 能力时，就使用这些工具；不能仅在 prompt 里写一个工具名称，便假定 Agent 拥有该工具。

固定文本放在动态信息之前，避免把时间、Git 状态等变化值混入固定规则。这样可以保持前缀稳定；模型服务是否命中 prompt cache 仍取决于服务商，不等于应用已经缓存项目状态。

#### 动态层：项目概览

项目概览帮助 Agent 判断应该去哪里查，而不是预先读取所有代码。

| 信息 | 允许的来源 | 提取范围 |
| --- | --- | --- |
| 项目名称、语言和框架 | 项目根目录及可见一级模块中的项目清单 | 如名称、简述、运行时、脚本名称和已声明的框架；不读取依赖安装目录 |
| 模块分布 | 浅层目录项 | 最多两层、100 条可见目录项；不递归生成完整文件树 |
| 架构与职责 | README、ARCHITECTURE 文档 | 简介和明确的架构、结构、模块说明，保留来源路径 |
| 项目规则 | 所选工作目录中的 AGENTS.md | 以工作目录为边界，避免把宿主仓库的规则混入嵌套的独立练习项目 |
| 当前工作状态 | Git 分支、HEAD 和已跟踪文件的状态 | 不读取 diff 正文，不递归枚举未跟踪文件或子模块内容 |

没有文档依据时，只报告配置与目录事实，不把目录名推断成架构结论。函数实现、调用链、接口参数等细节在具体任务中通过文件工具加载。

**持久化缓存与增量更新**

缓存以规范化的工作目录为键，而不是按 session 存储。因此，同一项目的多个会话能够共享已经提取的概览。缓存保存来源指纹、内容摘要、提取片段和浅层目录项，不复制整个项目文件。

```text
启动或新一轮用户请求
        ↓
检查已知来源的文件指纹、浅层目录元数据
        ↓
未变化 → 复用缓存片段
已变化 → 只读取变化来源，替换对应片段
新增或删除 → 更新对应目录和来源
        ↓
刷新轻量 Git 状态，组装本轮项目概览
```

文件指纹使用修改时间、元数据变更时间、大小和 inode。指纹不变时不打开正文；指纹变化后才按读取预算计算内容摘要，正文未变则继续复用提取结果。目录使用自己的元数据判断是否需要重新列举，不因某个业务文件的正文变化而遍历整个项目。

缓存通过临时文件和原子替换写入；无变化时不重写。缓存格式版本不符或内容损坏时，只重新采集允许范围内的信息，不升级为全项目扫描。Git 状态单独刷新，切换提交不会直接触发所有来源重读。

#### 预算与排除规则

每个来源最多读取 32 KiB，每轮更新总计最多读取 128 KiB；尚未处理的来源保留待更新标记，下一轮可以继续处理。动态层最多注入 8,000 个字符，超限的片段标记省略，任务需要时再读取原文件。

遍历前排除依赖、环境、构建产物和缓存目录，例如 `node_modules`、`.venv`、`vendor`、`dist`、`target`；不跟随符号链接。Git 项目同时遵守 `.gitignore`，工作目录中的 AGENTS.md 仍作为项目规则读取。锁文件、数据库、二进制和密钥文件不作为自动正文来源。

Git 命令设置超时和输出上限。采集失败时标记信息不可用，不把失败解释为工作区干净，也不通过全量读取来补偿。单个来源超过读取上限时只提供有界信息，不能把截断内容当作完整事实。

#### 接入运行流程

固定层注册为静态 instructions，项目概览注册为带名称的动态 instructions。Pydantic AI 会在模型请求时求值动态函数，因此应用还按 `run_id` 复用本轮结果：一轮中的多次模型请求和工具调用不重复检查项目，下一轮用户请求再做增量刷新。

动态层使用框架的 `on_change="rewrite"` 更新当前指令，不把新概览反复追加为普通历史消息。具体任务读取到的代码和工具结果仍通过 `message_history` 保持多轮上下文。

验证时应检查实际文件打开与目录遍历，而不只检查摘要文字：重复启动应复用正文缓存，修改一个清单只读取该来源，新增模块只更新对应结构，依赖目录始终不被进入；再验证同轮复用、跨轮刷新与不同工作目录隔离。

### 1.5 Tools

工具定义通过模型 API 的 `tools` 字段发送，包含 `name`、`description` 和参数 JSON Schema；它们不是 Python 实现，也不等同于 Agent 的 `instructions`。默认发送当前可用工具的完整定义，普通工具与本地连接的 MCP 工具均如此。

#### 渐进披露

工具多时，先发现相关工具，再加载其定义。工具路由从“在全部工具中选择”变为“搜索候选工具 → 选择工具与参数”。

```mermaid
flowchart LR
    A[用户任务] --> B[search_tools]
    B --> C[匹配 name 和 description]
    C --> D[披露候选工具的完整 Schema]
    D --> E[模型选择并调用工具]
```

Pydantic AI 2.64.0 中，普通工具设置 `defer_loading=True`；框架自动提供 ToolSearch，无需单独注册。以下沿用已配置的 `model` 和已有工具函数：

```python
from pydantic_ai import Agent, Tool

agent = Agent(model, tools=[
    Tool(get_weather, defer_loading=True),
    Tool(send_email, defer_loading=True),
])
```

MCP 工具集可逐个按需发现；这与加载整组 capability 是两个粒度：

```python
from pydantic_ai.mcp import MCPToolset

mcp = MCPToolset("http://127.0.0.1:8000/mcp")
agent = Agent(model, toolsets=[mcp.defer_loading()])
```

[可运行示例](../coder-cli/examples/tool_disclosure.py) 用模拟 HTTP 响应捕获 OpenAI Chat 请求，不调用在线模型。分别打印启用前、发现前、发现后的 `tools` 与 `messages`：

```bash
# 在 coder-cli 目录运行
uv run python examples/tool_disclosure.py
```

请求变化如下（仅摘录名称；脚本打印完整描述与参数）：

```text
启用前       tools: get_weather, send_email
启用后
  发现前     tools: search_tools
  模型调用   search_tools(queries=["weather"])
  搜索结果   {"discovered_tools": [{"name": "get_weather"}]}
  发现后     tools: get_weather, search_tools
```

| 影响 | 全量定义 | 渐进披露 |
|---|---|---|
| 工具定义的输入 token | 全部工具的描述与 Schema | 发现入口 + 已披露工具；另有搜索交互开销 |
| 工具路由 | 每步面对全部工具 | 先缩小候选集，减少无关工具干扰；检索遗漏也会导致选不到工具 |

工具越多、Schema 越长、单项任务需要的工具越少，节省空间越大。少量工具不一定节省 token；发现通常增加一次模型请求。名称与描述需明确用途和边界；减少候选不保证路由正确，应验证检索召回和调用成功率。

上述请求形状对应 OpenAI Chat 的本地搜索路径。支持原生 tool search 的接口可能仍接收带延迟标记的完整定义，由服务端控制模型可见性；不能把 HTTP 请求大小直接当作模型上下文 token。Prompt cache 也不等同于渐进披露。

来源：[Pydantic AI Tool Search](https://pydantic.dev/docs/ai/api/pydantic-ai/capabilities/#pydantic_ai.capabilities.ToolSearch)、[Toolset Deferred Loading](https://pydantic.dev/docs/ai/tools-toolsets/toolsets/#deferred-loading)。

#### MCP：注册与调用

MCP 将外部服务的工具定义与调用接入 Agent。注册是应用读取服务配置；工具发现通过 MCP 的 `tools/list` 完成，不需要额外的 `register` 协议。

| 传输 | 配置入口 | 生命周期 |
|---|---|---|
| HTTP | `url`、`headers` | 客户端连接已启动的服务 |
| stdio | `command`、`args`、`env`、`cwd` | 框架启动本地子进程，结束或取消时回收 |

```json
{"mcpServers":{"local-tools":{"command":"python","args":["server.py"],"cwd":"/path/to/project"}}}
```

两种传输共用工具发现、工具白名单和渐进披露；每个服务只选 `url` 或 `command`。stdio 发现工具时就可能执行启动命令，因此配置必须来自可信来源。

```mermaid
flowchart LR
    A[服务配置] --> B[每次模型请求前检查配置]
    B --> C[校验配置与传输策略]
    C --> D[MCP tools/list]
    D --> E[search_tools 发现候选]
    E --> F[披露 Schema]
    F --> G[MCP tools/call]
```

沿用框架动态 toolset 的默认行为：每次模型请求前检查配置，新增服务先变为可发现，无需等待下一轮用户消息。配置未变化时复用当前连接。`defer_loading` 控制完整工具定义何时对模型可见，不代表工具发现一定不连接 MCP 服务。

[动态工厂](https://pydantic.dev/docs/ai/tools-toolsets/toolsets/#dynamically-building-a-toolset)按模型请求求值；返回当前配置对应的工具集：

```python
from pydantic_ai.toolsets import DynamicToolset

# build_current_mcp(ctx) 读取配置，返回 MCPToolset 或 CombinedToolset。
agent = Agent(model, toolsets=[DynamicToolset(build_current_mcp)])
```

MCP 连接使用受控客户端：

```python
from pydantic_ai.mcp import MCPToolset

toolset = MCPToolset(
    server_url, id="weather", http_client=policy_client,
    init_timeout=5, read_timeout=30,
    include_instructions=False,
    max_retries=0, tool_error_behavior="failed",
)
agent = Agent(model, toolsets=[toolset.prefixed("weather").defer_loading()])
```

| 约束 | 作用 |
|---|---|
| 工具白名单 | 限定可发现、可调用的工具名 |
| 网络白名单 | 限定 HTTP MCP 连接的 scheme、host、port |
| SSRF 防护 | 校验全部 DNS 结果并固定连接地址；拒绝未授权内网、云元数据和重定向 |
| Timeout | 分别限制连接、初始化、请求读取和工具调用总时长 |
| Retry | 仅重试连接建立失败；请求已发送后的超时可能意味着执行结果未知，不自动重放 |

Pydantic AI 提供配置加载、发现、工具列表缓存、渐进披露及超时接口；配置变化检查、网络白名单与 MCP 的 SSRF 防护由应用实现。工具纠错重试与 HTTP 连接重试是不同预算。外部服务的 instructions 不自动提升为 Agent 指令。

```text
coder-cli ──受控连接──> MCP 服务 ──服务自身的网络策略──> 外部 API
```

上述网络策略用于 HTTP MCP，只约束第一段链路。stdio 子进程的网络访问需由其自身或执行环境限制。MCP 服务内部请求需在服务端限制；它也不能替代 shell 等执行环境的网络隔离。[配置实验](../coder-cli/skills/mcp-config/SKILL.md)可验证：同次运行中添加配置后可发现、删除后不可调用、未授权地址连接失败。

参考：[Pydantic AI MCP Client](https://pydantic.dev/docs/ai/mcp/client/)、[Timeouts](https://pydantic.dev/docs/ai/core-concepts/timeouts/)、[OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)。

### 1.6 Skills

Skill 把任务流程封装成说明与资源。工具定义“能做什么”，Skill 定义“何时用、怎样做、怎样判断完成”。

#### Schema：元数据与执行说明

沿用 [Agent Skills 规范](https://agentskills.io/specification)：一个技能目录至少包含 `SKILL.md`，文件由 YAML frontmatter 与 Markdown 正文组成。

```text
web-download/
├── SKILL.md              # 触发条件、输入、执行入口、验收条件
├── scripts/download.py   # 确定性步骤
└── references/           # 可选：按需读取的细节
```

```markdown
---
name: web-download
description: 下载网页中指定图片。用于已提供网页 URL 和 CSS 选择器的任务；不用于普通网页阅读或批量爬取。
---

# 网页图片下载

输入：网页 URL、目标图片 CSS 选择器、工作目录内的输出目录。
缺少选择器时先询问，不猜测目标图片。

执行：使用本技能 scripts/download.py，按下方命令运行，不另写下载代码。
验收：仅当返回 status=saved 且目标文件存在、大小与 bytes 一致时报告成功。
失败：返回 status=failed 时报告 error 并停止，不更换工具重复下载。
```

| 字段 | 约定 |
|---|---|
| `name` | 必填，与目录名一致；1–64 字符，小写字母、数字和连字符；不以连字符开头或结尾，不连续使用连字符 |
| `description` | 必填，1–1024 字符；写任务、触发条件与排除范围，不堆同义词 |
| `license`、`compatibility`、`metadata` | 可选，分别描述许可证、环境要求和附加元数据；不代替依赖安装 |
| Markdown 正文 | 写清输入、执行入口、输出、验收和失败处理；参数校验由脚本或工具负责 |

当前 Harness 不执行 `allowed-tools`、`model`、`hooks` 等行为字段，会提示忽略。不能靠 frontmatter 授权工具、切换模型或自动注册 MCP；权限与运行时能力由应用配置。

#### 少 token、短执行路径、可验证

```mermaid
flowchart LR
    A[名称与简短描述] --> B[load_capability]
    B --> C[正文与技能目录]
    C --> D[直接调用已有脚本或工具]
    D --> E[检查结构化结果与产物]
```

| 目标 | 写法 |
|---|---|
| 少 token | description 只用于选技能；正文保留必要步骤；长参考从正文直接链接，按需读取；脚本返回状态、路径、大小或错误，不回传整页 HTML、二进制或完整日志 |
| 短执行路径 | 给一个明确入口和完整命令；固定步骤放脚本，避免“搜索脚本 → 阅读源码 → 临时重写”；路径以加载时给出的技能目录为基准，不猜安装位置；参考文件不层层跳转 |
| 可验证 | 定义成功字段与产物检查；失败返回明确原因；MCP 工具可发现不等于调用成功，脚本退出成功不等于产物满足要求 |

以 [web-download](../coder-cli/skills/web-download/SKILL.md) 为例，把 `<技能目录>` 替换为加载时提供的绝对路径，参数安全引用后直接执行：

```bash
uv run --locked --project "<技能目录>/../.." python "<技能目录>/scripts/download.py" '<网页 URL>' '<CSS 选择器>' --workspace . --output-dir outputs
```

这里 `../..` 指向本项目的依赖清单；外部技能应声明自己的依赖入口，不能假设安装位置相同。不要省掉输入校验与产物验收来减少调用，也不要自动重试结果未知的有副作用操作。

渐进加载仍有加载交互的开销；所有可见技能的名称和描述也占上下文。比较同一任务的总输入、输出 token、模型请求数与验收结果，不能仅凭 `SKILL.md` 更短就声称成本更低。

#### 常见的坑

| 坑 | 怎样处理 |
|---|---|
| 指令模糊 | description 明确触发条件，正文给输入与验收。例如下载任务必须拿到 URL 和选择器；不能只写“帮助下载图片” |
| 把声明当权限 | Skill 的 `allowed-tools` 被忽略，加载后仍可使用已注册的 Coder 工具。MCP 配置中的 `allowed_tools` 才由应用过滤；只读任务若需强制限制，必须在工具执行层控制，写“不要修改”不构成隔离 |
| 把输出长度当预算 | Skill 中写 `caps` 或“最多 1000 token”不会设置框架预算。当前 `request_limit=50` 只限制模型请求次数，`timeout=30` 也不限制 token；输出上限与运行累计预算需分别配置 |
| 静默降级 | 全局目录缺失可以跳过；格式无效的技能会被框架跳过并警告。任务依赖的技能或脚本不可用时，应报告原因，不改用默认流程假装完成，更不能用 `except Exception: pass` 隐藏错误 |

#### 工程接入

在 `agent/runtime.py` 中，沿用已配置的 `model` 和 `workspace`，将技能库加入 capabilities（其余能力省略）：

```python
from pathlib import Path
from pydantic_ai import Agent
from pydantic_ai.capabilities import LocalWorkspace
from pydantic_ai_harness import Skills
from pydantic_ai_harness.coder import Coder

agent = Agent(model, capabilities=[
    LocalWorkspace(workspace), Coder(),
    Skills(Path(__file__).resolve().parents[1] / "skills"),
    Skills(
        Path.home() / ".agents" / "skills",
        missing_directories="skip", duplicate_names="keep_first",
    ),
])
```

框架合并两份技能库，内置优先，全局同名项跳过并提示。每次 Agent 运行开始时重新发现；模型先看到名称与描述，调用 `load_capability` 后才收到正文和技能目录。资源不自动读取或执行，实际执行仍通过 Coder。全局安装与更新见[项目 README](../coder-cli/README.md#skills)。

MCP 配置路径由 MCP 能力统一提供，Skill 只引用 `mcp_config_path`；新增普通技能不增加专用 instructions。接入机制见 [Pydantic AI Skills](https://pydantic.dev/docs/ai/harness/skills/)。

需要限制消耗时，在运行入口配置，而不是增加 Skill schema 字段。以下为预算示例，数值需按任务校准：

```python
from pydantic_ai import UsageLimits

result = await agent.run(
    prompt,
    model_settings={"timeout": 30, "max_tokens": 1000},
    usage_limits=UsageLimits(request_limit=10, total_tokens_limit=20_000),
)
```

`max_tokens` 限制单次模型回复；`total_tokens_limit` 检查本次运行累计用量，回复返回后仍可能越过阈值，不能当作精确费用上限。见 [Pydantic AI UsageLimits](https://pydantic.dev/docs/ai/api/pydantic-ai/usage/#pydantic_ai.usage.UsageLimits)。


--------
## 2. 护栏
### 2.1 权限

Human-in-the-loop

用户中断

### 2.2 Token 预算

### 2.3 上下文隔离
sessions 并行
## 3. 决策模式
Planning 模式
Reflection 模式
Chain-of-Thought

## 4. Multi-Agent

## 5. Long-term Agent
Dsh Super Agent
> [dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype/tree/main)
