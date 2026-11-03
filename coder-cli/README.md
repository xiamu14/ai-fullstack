# coder-cli

使用 Pydantic AI Harness 的 Coding Agent。启动后直接进入 Textual TUI，在同一进程中连续对话。

```bash
uv sync --locked
cp -n .env.example .env
# 在 .env 填写 OPENAI_BASE_URL、OPENAI_API_KEY、MODEL_NAME。
```

先在另一个终端启动现有天气 MCP 服务：

```bash
cd ../mcp_server/weather
uv sync --locked
uv run python weather.py
```

回到 `coder-cli` 目录启动：

```bash
uv run python main.py
# 可选：恢复已保存会话；未知 ID 开始空会话：
uv run python main.py --sessionId demo
```

查看帮助和已保存会话（不需要模型配置，也不会请求模型）：

```bash
uv run python main.py --help
uv run python main.py --sessions
```

会话列表显示完整 `sessionId` 和 `title`，按 ↑ / ↓ 选行，C 或 Copy sessionId 按钮复制 ID，Esc / Q 退出。macOS 使用系统剪贴板，其他终端通过 OSC 52 发送复制请求。非交互终端输出制表符分隔文本。标题优先使用已有 metadata.title，否则取首条用户消息的前 80 个字符；无消息时显示 Untitled session。同一会话合并为一行，最近活动的排在前面。

`--sessions` 和 `--sessionId` 不能同时传入。这些是 CLI 参数，不给 Agent 添加 `/help` 或其他 slash 指令。

不接受位置参数 prompt、`--session` 或 `--sesionId`。需要交互终端，不能通过管道输入。模型名使用 `MODEL_NAME`。模型须支持工具调用和流式响应。

在输入区输入任务，例如：

```text
在 hello 目录初始化一个无第三方依赖的 Python 项目，创建 pyproject.toml、README.md 和 main.py。
main.py 运行时只输出 hello world。读取 main.py，再运行它确认结果。
```

- Enter 发送；Shift+Enter 或 Ctrl+J 换行（部分终端不能区分 Shift+Enter，使用 Ctrl+J）。
- Alt+↑ / Alt+↓ 回选本次启动后的输入，返回末尾时恢复未提交草稿。
- PageUp / PageDown、鼠标滚轮回看消息；回到末尾后继续自动跟随。
- Ctrl+C 停止本轮；Ctrl+Q 退出；Esc 聚焦输入。
- 执行中可以编辑下一条草稿，当前轮结束后再发送。

界面沿用 [Toad](https://github.com/batrachianai/toad/tree/main/src/toad) 的原始 Dracula 主题与 TUI 样式，保留输入、滚动消息、Markdown、工具结果和底部信息栏所需结构；不自定义配色、边框或间距。未引入 ACP、多会话、侧栏或独立 shell 执行器。样式来源与上游 AGPL-3.0 许可证见 [TOAD-NOTICE.md](tui/TOAD-NOTICE.md)。代码分层与多轮流程见 [第五章](../docs/05-harness.md)。

`LocalWorkspace` 不是沙箱，Coder 能修改文件和执行本机命令，只用于可信的本地练习。停止、失败或退出不会回滚已经执行的工具操作。

## 记忆与历史

笔记保存在 `workspace/.agent-memory/main/`，运行历史保存在 `workspace/sessions.db`。同一 workspace 的任务共享笔记，历史按会话 ID 分开检索。

在同一个 TUI 中依次发送：

```text
记住：本项目使用中文回答。请保存到记忆。
搜索记忆和之前的对话，告诉我本项目的回答语言。
```

同一进程内，下一轮自动传入上一轮完整模型消息，包括工具调用与结果。不传 `--sessionId` 时，CLI 不生成 ID；首轮运行由 Agent 创建会话，成功后获取 `result.conversation_id` 并在底部信息栏显示、在后续轮次沿用。首轮成功前显示“新会话”。传入已有 `--sessionId` 时，启动前从 SQLite 加载最近一次成功轮次的完整消息快照（包含工具调用与结果），作为 `message_history` 传入，并在界面还原消息和工具结果。未知 ID 按指定 ID 开始空会话。历史读取失败时明确退出，不静默使用空历史。

笔记由模型调用工具写入，指令不能保证每次都写；请检查笔记文件或工具结果。超过 60 条模型消息时尝试摘要旧历史，保留近期约 20 条；摘要不会自动成为长期笔记。上下文压缩不删除界面中已展示的消息。失败或取消的轮次不提交到内存模型历史，但框架可能已持久化本轮的执行步骤；恢复时跳过这些未成功的轮次，避免自动重跑未完成工具。重启后界面展示恢复快照中仍保留的消息，压缩前原文仍可通过历史检索回查。

## 验证与观测

```bash
uv run python -m unittest discover -s tests -v
```

离线测试不请求真实模型 API；验证真实 Coder 文件操作、记忆、SQLite 历史检索、多轮流式工具调用，以及 Textual 无界面模式下的输入、失败恢复、取消和滚动行为。

Logfire 终端输出已关闭，避免干扰 TUI。设置 `.env` 中的 `LOGFIRE_TOKEN` 后，可在项目 Live 页面查看追踪；未配置时不发送。追踪包含任务、模型回复、工具参数及结果。

底部信息栏显示会话 ID，执行时显示忙碌状态；悬停可查看本轮逐请求和累计缓存统计。读取量大于 0 表示服务商报告命中，写入量不代表命中；读写已包含在输入 token 内，0 也可能是兼容接口没有返回统计。费用仅在模型定价可识别时显示，以服务商账单为准。
