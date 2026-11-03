## 1. Harness 
Agent 所有核心已经单独讲解完。在核心之上再补充工程化代码，以及权限、安全护栏，可观测性与评测就是一套 Harness。Pydantic AI 是 Agent Framework，再补充实际 Agent 场景（比如 coding，客户系统）工程系统，就是 Agent Harness（智能运行层），如 Claude Code，DeepSeek Harness(dsh)，OpenClaw 等。

> Agent = Model + Harness

## 1.1 多轮对话
实现可交互的用户输入系统和显示 Agent result 的 TUI 界面。同一进程内连续发送多轮消息，下一轮显式传入上一轮的 `message_history`。

### 启动与交互

在 `coder-cli` 目录配置 `.env` 并启动天气 MCP 服务后运行：

```bash
uv sync --locked
uv run python main.py
# 恢复指定会话的消息历史：
uv run python main.py --sessionId xxx
```

`--sessionId` 是可选参数；不传时由 Agent 在首轮运行生成会话 ID，成功后从 `result.conversation_id` 获取并沿用，传入时使用指定 ID。不提供位置参数 prompt 或单次命令模式。完整准备步骤见 [README](../coder-cli/README.md)。

界面沿用 Toad 原始 Dracula 主题与 TUI 样式，保留输入框、滚动消息、工具结果面板和底部信息栏，不自定义配色、边框、间距或布局样式。仅移植本次展示所需的组件结构，不引入 ACP、侧栏、商店或多会话系统；来源和上游许可证见 [TOAD-NOTICE.md](../coder-cli/tui/TOAD-NOTICE.md)。

### CLI 帮助与会话列表

```bash
uv run python main.py --help
uv run python main.py --sessions
```

`--help` 由 argparse 显示参数说明；`--sessions` 直接读取本项目 SQLite 历史，不创建 Agent、不调用模型、不要求 `.env`。同一会话合并为一行，按最近活动排序，显示 sessionId 与 title。title 优先使用已有 metadata.title，否则取首条用户消息的前 80 个字符。没有历史时提示空列表，不创建数据库。

交互终端沿用 Toad 会话表格的原始样式，↑ / ↓ 选行，按 C 或点击 Copy sessionId 复制完整 ID，Esc / Q 退出。macOS 使用 pbcopy，其他终端使用 OSC 52。非交互终端输出完整 ID 和标题文本。列表只查看和复制，不恢复、删除或切换会话；`--sessions` 与 `--sessionId` 互斥。不在 Agent 中引入指令系统。

### 代码分层

```text
coder-cli/
├── main.py                 # 严格解析参数、校验终端、启动 TUI
├── agent_runtime.py        # 配置模型、Coder、Skills、MCP、记忆与持久化
├── conversation.py         # 原生模型历史、执行一轮、脱敏与缓存统计
├── sessions.py             # 读取会话 ID/标题、加载最近成功轮次的完整消息
├── tui/
│   ├── app.py              # 布局、事件协调、异步任务、流式回复
│   ├── sessions.py         # 独立的 CLI 会话查看与复制界面
│   ├── prompt.py           # 多行输入、提交、输入记录与草稿
│   ├── highlighted_textarea.py # Toad 原始 Markdown 输入高亮
│   ├── messages.py         # 用户/Agent/错误消息、滚动容器
│   ├── tools.py            # Toad 工具结果呈现，接收 Pydantic AI 工具事件
│   ├── turn.py             # 按事件顺序展示文本与工具块
│   ├── throbber.py         # Toad 原始渐变忙碌条
│   └── toad-*.tcss         # Toad 原始样式摘录（来源与许可见 TOAD-NOTICE.md）
└── tests/                  # 入口、会话、TUI 和现有能力的离线回归
```

TUI 调用 `Conversation.send()`，由它使用 `agent.run(..., event_stream_handler=...)` 完成流式模型与工具执行；原有 `UsageLimits(request_limit=10)` 和模型请求超时 30 秒继续生效。

### 三种历史

| 状态 | 内容 | 生命周期 |
| --- | --- | --- |
| 模型上下文 | 原生 `ModelMessage`，包括工具调用和结果 | 成功后用 `result.all_messages()` 替换并由 StepPersistence 持久化，下一轮和重启恢复时传入 `message_history` |
| 界面消息 | 用户输入、Agent Markdown、工具调用与结果、失败或停止提示 | 当前窗口内独立于模型上下文压缩；重启时从恢复快照重建 |
| 输入记录 | 用户提交的文本和未提交草稿 | 当前 TUI 生命周期，供快捷键回选 |

复用同一个 Agent 实例不会自动记住上一轮；真正维持多轮上下文的是显式传递完整模型消息。历史必须替换，不能把包含旧消息的 `all_messages()` 再追加到旧列表中。

传入 `--sessionId` 时使用指定 ID；不传时首轮的 `conversation_id` 为 `None`，由 Agent 生成 ID，成功后从 `result.conversation_id` 获取，后续轮次沿用。`StepPersistence` 保存完整原生消息快照。传入已有 ID 时，入口按该会话筛选顶层运行，从最近一次标记 `run_completed` 的轮次加载完整快照，包括工具调用、工具结果和压缩摘要；既用于下一轮模型请求，也重建界面消息与工具结果。失败、取消、未完成和子 Agent 轮次不覆盖最近成功上下文。未知 ID 开始空会话；数据库或快照读取失败时退出，不能静默重置历史。重启界面展示快照仍保留的消息，压缩前原文按需通过历史检索回查。笔记、历史检索和摘要压缩继续沿用[第四章](./04-memory.md)的能力。

模型和工具在异步 Worker 中执行，界面显示忙碌状态并逐步渲染文本；完成后以最终 `result.output` 替换预览。失败信息脱敏后显示，用户可继续输入。失败或取消不会覆盖上一轮成功的内存模型上下文；已执行的工具操作和已持久化的步骤不会回滚。

Logfire 关闭终端输出，保留按 Token 配置的远端追踪。底部信息栏显示会话 ID 与忙碌状态，悬停查看本轮逐请求和累计缓存统计。

### 验证

```bash
uv run python -m unittest discover -s tests -v
```

测试使用 FunctionModel 验证真实流式工具执行和多轮历史，通过 Textual `run_test()` 验证多行输入、输入回选、失败恢复、取消与滚动；同时保留原有真实文件、SQLite 和 MCP 回归。


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
