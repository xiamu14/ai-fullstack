# coder-cli

使用 Pydantic AI Harness 的 Coding Agent。启动后直接进入 Textual TUI，在同一进程中连续对话。

执行期间仍可按 Enter 发送补充消息，消息在当前工具结束后的模型请求中生效。Agent 提问或等待授权时，直接在输入框填写选项编号、名称或文字回答；Ctrl+C 停止当前运行。收到授权反馈后，Agent 还需验证实际登录状态。

```bash
uv sync --locked
cp -n .env.example .env
# 在 .env 填写 OPENAI_BASE_URL、OPENAI_API_KEY、MODEL_NAME。
```

MCP 是可选配置，默认不连接外部服务。要使用天气示例，先在另一个终端启动服务：

```bash
cd ../mcp_server/weather
uv sync --locked
uv run python weather.py
```

回到 `coder-cli` 目录启动：

```bash
uv run python main.py
# 指定已存在的目录，支持绝对或相对路径：
uv run python main.py --path ../my-project
uv run python main.py --path /absolute/path/to/project
# 可选：恢复已保存会话；未知 ID 开始空会话：
uv run python main.py --sessionId demo
```

查看帮助和已保存会话（不需要模型配置，也不会请求模型）：

```bash
uv run python main.py --help
uv run python main.py --sessions
```

会话列表显示缩略 `sessionId`、`title` 和 `workspace`；长 ID 显示前 8 位与后 4 位，中间省略，复制和删除仍使用完整 ID。按 ↑ / ↓ 选行，C 或 Copy sessionId 按钮复制 ID，D 直接删除选中会话，Esc / Q 退出。macOS 使用系统剪贴板，其他终端通过 OSC 52 发送复制请求。非交互终端输出制表符分隔的完整 ID、标题和工作目录。标题优先使用已有 metadata.title，否则取首条用户消息的前 80 个字符；无消息时显示 Untitled session。同一会话合并为一行，最近活动的排在前面。

删除会话会清理会话登记，以及该会话及子运行的事件、消息快照、工具执行记录和快照幂等记录。共享消息正文仍保留供其他会话使用；项目文件、共享记忆及项目概览缓存不受影响。删除失败时显示错误并保留列表行。

`--sessions` 和 `--sessionId` 不能同时传入。这些是 CLI 参数，不给 Agent 添加 `/help` 或其他 slash 指令。

新会话默认以执行命令时的当前目录作为工作目录；相对 `--path` 也基于该目录解析，支持 `~`。只要传入 `--sessionId`，就忽略 `--path`：已有会话沿用保存的目录，未知 ID 使用当前目录。目录不存在或不是目录时明确报错。`--sessions` 始终查看固定数据库中的所有会话。

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

## 代码结构

```text
main.py             # CLI 入口
agent/              # Agent 构建与多轮对话运行
context/            # 项目概览、来源提取与增量缓存
storage/            # 会话查询、消息历史与工作目录恢复
tools/              # 自定义工具
tui/                # 终端交互
prompts/            # 固定指令文本
skills/             # 按需加载的技能
tests/              # 测试
```

## 项目概览

固定规则保存在 `prompts/system.md`。启动和每轮新请求会检查有限的项目清单、架构文档及当前工作目录的 AGENTS.md，按工作目录复用 `workspace/project-context/` 下的缓存；正文未变化时不重新读取。缓存是可重建的项目概览，不代替具体任务中的代码搜索和阅读。

目录最多两层、100 条可见目录项，单来源最多读取 32 KiB、每轮总计 128 KiB，动态指令最多 8,000 字符。依赖目录、构建产物、符号链接和 Git 忽略路径不会自动遍历，超过预算的部分明确标记省略。Git 状态只显示已跟踪文件，未跟踪文件需在具体任务中按需查询。首次启动或缓存失效时仍只采集限定范围。

## 记忆与历史

笔记保存在实际工作目录的 `.agent-memory/main/`，运行历史固定保存在本程序目录下的 `workspace/sessions.db`，不随启动目录或 `--path` 改变。已有旧会话没有目录记录时，沿用原来的 `coder-cli/workspace/`。同一 workspace 的任务共享笔记，历史按会话 ID 分开检索。

在同一个 TUI 中依次发送：

```text
记住：本项目使用中文回答。请保存到记忆。
搜索记忆和之前的对话，告诉我本项目的回答语言。
```

同一进程内，下一轮自动传入上一轮完整模型消息，包括工具调用与结果。不传 `--sessionId` 时，由 `create_agent` 使用 Pydantic AI 的 `Conversation` 生成 ID，立即保存空会话和工作目录，并在底部显示该 ID。即使没有发送消息就退出，也可以通过 `--sessions` 找到并恢复它。后续运行沿用同一个 `conversation_id`；首条消息用于生成列表标题。传入已有 `--sessionId` 时，由 `create_agent(session_id, path)` 从 SQLite 异步加载最近有快照的顶层运行历史（包含失败、取消和未完成的进度），工厂返回准备好的会话运行对象；`ChatShell` 只展示已有消息和工具结果、处理输入交互，不加载数据库。未知 ID 按指定 ID 开始空会话。历史读取失败时明确退出，不静默使用空历史。

笔记由模型调用工具写入，指令不能保证每次都写；请检查笔记文件或工具结果。超过 60 条模型消息时尝试摘要旧历史，保留近期约 20 条；摘要不会自动成为长期笔记。上下文压缩不删除界面中已展示的消息。失败或取消后的下一次请求会重新加载最新快照，重启后也保留已持久化的未完成进度。挂起的工具调用通过框架标记为 interrupted，不自动重放；外部操作是否已经生效仍需核实。重启后界面展示恢复快照中仍保留的消息，压缩前原文仍可通过历史检索回查。

## 验证与观测

```bash
uv run python -m unittest discover -s tests -v
```

离线测试不请求真实模型 API；验证真实 Coder 文件操作、记忆、SQLite 历史检索、多轮流式工具调用，以及 Textual 无界面模式下的输入、失败恢复、取消和滚动行为。

Logfire 终端输出已关闭，避免干扰 TUI。设置 `.env` 中的 `LOGFIRE_TOKEN` 后，可在项目 Live 页面查看追踪；未配置时不发送。追踪包含任务、模型回复、工具参数及结果。

底部信息栏显示会话 ID，执行时显示忙碌状态；悬停可查看本轮逐请求和累计缓存统计。读取量大于 0 表示服务商报告命中，写入量不代表命中；读写已包含在输入 token 内，0 也可能是兼容接口没有返回统计。费用仅在模型定价可识别时显示，以服务商账单为准。

## 外部 MCP

可直接要求 Agent 配置 MCP；它会按需加载内置 [mcp-config Skill](skills/mcp-config/SKILL.md)，使用 MCP 能力统一提供的有效配置路径。

## Skills

使用 Pydantic AI 原生 `Skills` 加载内置 `skills/` 和用户全局 `~/.agents/skills/`。内置技能优先；全局同名技能会被跳过并提示。全局目录不存在时不影响启动。

外部技能可使用 [Skills CLI](https://github.com/vercel-labs/skills) 安装和更新：

```bash
npx skills add <owner/repo> -g
npx skills check
npx skills update
```

安装时确认技能位于 `~/.agents/skills/<技能目录>/SKILL.md`。每次 Agent 运行开始时重新发现技能，因此安装或更新后，下次发送消息即可生效；当前运行不刷新。Skills 只加载说明，不自动安装技能依赖的命令、MCP 服务或凭据。

空闲时在输入框键入 `/`，搜索技能名称或描述，用 ↑ / ↓ 选择、Enter 插入引用、Esc 关闭；再填写任务参数并提交。每条消息可主动引用一个技能，技能名显示为 `/技能名`。只有从列表选择才是主动引用，直接粘贴的绝对路径仍作为普通文本。删除或修改引用前缀会取消该引用。

列表只显示允许用户调用的技能（`user-invocable` 不为 false）；`disable-model-invocation: true` 只禁止模型自动加载，不禁止用户主动调用。提交时重新读取并校验技能，原生 `render()` 替换 `$ARGUMENTS` 或追加参数，模型无需先调用 `load_capability`。界面显示原始引用与参数，历史保存模型实际接收的技能说明。执行中的输入继续作为反馈，不展开新技能。
