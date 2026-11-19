# coder-cli

使用 Pydantic AI Harness 的 Coding Agent。启动后直接进入 Textual TUI，在同一进程中连续对话。

执行期间仍可按 Enter 发送补充消息，消息在当前工具结束后的模型请求中生效。Agent 提问或等待授权时，直接在输入框填写选项编号、名称或文字回答；Ctrl+C 停止当前运行。收到授权反馈后，Agent 还需验证实际登录状态。

计划用于记录进度。工作区内普通文件读写按默认权限放行，shell 等工具按权限策略处理。

```bash
uv sync --locked
cp -n .env.example .env
# 在 .env 填写 OPENAI_BASE_URL、OPENAI_API_KEY、TAVILY_API_KEY。
# 在 provider.jsonc 选择 default_model 并定义模型的 provider。
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

不接受位置参数 prompt、`--session` 或 `--sesionId`。需要交互终端，不能通过管道输入。默认模型由 `provider.jsonc` 的 `default_model` 指定。模型须支持工具调用和流式响应。

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

当前使用原生 `LocalWorkspace` 的受限后端：文件工具检查实际路径，macOS 的 shell 与本地 MCP 子进程经过 `sandbox-exec`。这仍是本地开发工具，不是容器或虚拟机；停止、失败或退出不会回滚已经执行的工具操作。

## 工具权限

Harness 已升级至 0.65.0，Pydantic AI 为 2.65.0。工具统一经过原生 `Permissions` 扩展与 `HandleDeferredToolCalls`，审批复用现有问答交互；模型是否主动调用 `ask_user_question` 不影响审批门禁。

| 判定 | 默认行为 |
|---|---|
| 权限配置、运行存储、`~/.ssh`、`~/.aws` | 拒绝，普通批准不能覆盖 |
| 项目普通文件、已安装技能包的只读资源 | 允许；真实路径仍需通过边界检查 |
| `.env*`、`.git`、密钥文件、目录外文件 | 逐次询问；目录外文件用文件工具精确授权 |
| Super / Executor 的 shell | `auto` 模式仅自动放行可识别的本地读取和本地 Git。范围不明的删除硬拒绝，其他命令按目标及副作用判定 |
| MCP 调用和未分类工具 | 默认询问；命中明确放行规则才自动执行 |
| 本地 stdio MCP | 工具发现前先询问，再启动隔离进程；服务工具调用另行判定 |

审批显示完整参数和工作目录，凭据脱敏；“本次允许”才批准，自由文本、拒绝、5 分钟无回答或没有交互回调均不批准。Ctrl+C 取消等待并清理未执行的批准。工具串行执行；批准后重新检查参数、实际目标状态、权限配置和 MCP 配置，变化则拒绝旧批准。失败或重启恢复时只修复未完成调用，不复用旧批准、不自动重放；需要重新发起调用并批准。

权限配置默认读取 `~/.config/.ani bot/permissions.json`，不存在时使用上述默认规则；也可在启动前设置 `CODER_PERMISSION_CONFIG`。配置只从用户指定位置读取，不加载项目内权限文件。参照 [permissions.example.json](permissions.example.json) 手动配置；配置损坏、超限或包含未知字段时明确报错。

规则字段为 `tool`、`pattern`、`action`（`deny / ask / allow`），工具名与资源使用 glob 匹配；文件资源是规范化绝对路径，shell 资源是完整命令，其他工具默认使用工具名。可用 `argument` 指定外部工具参数，例如 `{"tool":"docs_search","argument":"query","pattern":"public:*","action":"allow"}`。优先级固定为硬限制 → deny → 受保护路径 → ask → 模式与 allow → 默认询问，不受数组排列影响。`auto` 放行普通项目文件；`read-only` 额外询问写入和所有命令；`full` 取消普通调用询问，但不覆盖硬拒绝与受保护资源。

只有可信配置中的 `ask` 规则显式设置 `remember: true` 时，适合的外部调用才提供“本会话允许相同调用”。记忆绑定会话、工作目录、工具、完整参数与配置版本，只保留在进程内；shell、写入与受保护资源不提供记忆。审批记录追加到会话数据库旁的 `permissions.jsonl`，包含原生会话/运行/工具调用 ID、时间、原因与调用指纹，不记录参数正文；执行结果由原生运行记录追踪。

默认 `sandbox: true`。模型发起的 Shell 在 macOS 沙箱内运行，禁止联网。写入限运行临时文件、明确审批目标及受规则约束的本地 Git 元数据。关闭隔离或隔离不可用时，模型 Shell 拒绝启动。本地 stdio MCP 单独判定启动权限，HTTP MCP 继续执行 origin、DNS 与云元数据检查。

当前关闭 Coder 的任务委派，避免出现未接入同一审批交互的子运行；保留已有 Pydantic AI 执行框架。升级不删除或迁移会话数据库，已验证旧版快照在新版继续运行；回退依赖需同时恢复 `pyproject.toml` 与 `uv.lock`。

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

### 并行与共享边界

| 范围 | 规则 |
|---|---|
| 同一会话 ID | 一次只运行一个请求，跨 CLI 进程也生效 |
| 相同或互相包含的工作目录 | 对话可以并行，读操作可共享锁，文件写入和 Shell 工具调用独占工作区锁 |
| 互不包含的工作目录 | 可分别运行；并行修改同一仓库时使用独立 Git worktree |
| 项目笔记 | 同一工作目录共享 `.agent-memory/main/`，不按会话复制 |
| 对话历史与审批状态 | 按会话隔离，项目笔记不会自动带入另一会话的聊天记录 |

会话锁覆盖最新历史读取、模型运行和持久化，同一会话有运行时会拒绝新的运行。工作区锁只覆盖实际工具操作与项目上下文读取；冲突作为工具失败返回，普通对话和联网查询可以继续。工作区繁忙时跳过项目概览刷新和记忆注入。Shell 工具返回后结束本次锁持有，已分离的后台进程仍由其自身管理。取消、失败和进程退出会释放锁；进行中的文件写入结束后才释放对应工作区锁。

锁使用 POSIX 文件锁，位于固定会话数据库旁的 `execution-locks/`，该目录禁止 Agent 工具访问。不支持文件锁的平台拒绝运行，不降级为无锁执行。这是同一本地存储下 coder-cli 实例之间的协调；不约束编辑器、其他程序或已批准访问的目录外资源，也不提供跨主机或模型 API 总量限制。

在同一个 TUI 中依次发送：

```text
记住：本项目使用中文回答。请保存到记忆。
搜索记忆和之前的对话，告诉我本项目的回答语言。
```

同一会话的下一轮在执行锁内加载最近持久化消息，包括工具调用与结果。不传 `--sessionId` 时，由 `create_agent` 使用 Pydantic AI 的 `Conversation` 生成 ID，立即保存空会话和工作目录，并在底部显示该 ID。即使没有发送消息就退出，也可以通过 `--sessions` 找到并恢复它。后续运行沿用同一个 `conversation_id`；首条消息用于生成列表标题。传入已有 `--sessionId` 时，由 `create_agent(session_id, path)` 从 SQLite 异步加载最近有快照的顶层运行历史（包含失败、取消和未完成的进度），工厂返回准备好的会话运行对象；`ChatShell` 只展示已有消息和工具结果、处理输入交互，不加载数据库。未知 ID 按指定 ID 开始空会话。历史读取失败时明确退出，不静默使用空历史。

笔记由模型调用工具写入，指令不能保证每次都写；请检查笔记文件或工具结果。超过 60 条模型消息时尝试摘要旧历史，保留近期约 20 条；摘要不会自动成为长期笔记。上下文压缩不删除界面中已展示的消息。失败或取消后的下一次请求会重新加载最新快照，重启后也保留已持久化的未完成进度。挂起的工具调用通过框架标记为 interrupted，不自动重放；外部操作是否已经生效仍需核实。重启后界面展示恢复快照中仍保留的消息，压缩前原文仍可通过历史检索回查。

## 验证与观测

```bash
uv run python -m unittest discover -s tests -v
```

离线测试不请求真实模型 API；验证真实 Coder 文件操作、记忆、SQLite 历史检索、多轮流式工具调用，以及 Textual 无界面模式下的输入、失败恢复、取消和滚动行为。

Logfire 终端输出已关闭，避免干扰 TUI。设置 `.env` 中的 `LOGFIRE_TOKEN` 后，可在项目 Live 页面查看追踪。追踪包含运行、模型请求、工具调用的类别、白名单内的内置工具名、数值用量和耗时。任务正文、模型回复、工具参数、结果和异常详情留在本地。

底部信息栏显示会话 ID，执行时显示忙碌状态；悬停可查看本轮逐请求和累计缓存统计。读取量大于 0 表示服务商报告命中，写入量不代表命中；读写已包含在输入 token 内，0 也可能是兼容接口没有返回统计。费用仅在模型定价可识别时显示，以服务商账单为准。

右侧 `Context ◑ 50%` 显示上下文窗口已用比例，圆形字符按占用变化。使用 Pydantic AI 原生 `context_window_used`，以最近一次响应的输入（含缓存）与输出 token 除以模型窗口容量；执行中定期刷新，恢复会话时也从已有响应读取。这是下次请求占用的估计，新增工具结果与上下文压缩会改变实际大小，不是整轮累计 token。窗口容量由模型 profile 与框架模型数据解析；容量或用量未知时显示 `--%`，不假定为 0%。

模型配置统一在程序目录的 `provider.jsonc` 管理，支持 `//`、`/* ... */` 注释和尾随逗号。`models` 的键是本地配置引用，`default_model` 引用其中一个键。可用 `model_name` 显式指定发给服务端的模型 ID，省略时使用配置键。OpenRouter 的模型 ID 应填写完整的上游 ID，例如 `openai/gpt-6.1-sol`。`provider` 指定服务接入方式，`protocol` 指定 API 协议。OpenRouter 必须显式指定协议；直接 OpenAI/Anthropic 接入可省略并沿用对应协议。`context_window` 和 `timeout`（秒，默认 30）可选。例如：

```json
{
  "default_model": "GLM-5.3-Flash-Event",
  "models": {
    "GLM-5.3-Flash-Event": {
      "provider": "openai",
      "context_window": 1048576
    },
    "claude-sonnet-4-6": {
      "provider": "anthropic"
    },
    "anthropic/claude-sonnet-4.6": {
      "provider": "openrouter",
      "protocol": "anthropic"
    }
  }
}
```

服务地址和凭据统一读取 `{PROVIDER}_BASE_URL` 与 `{PROVIDER}_API_KEY`，其中 PROVIDER 为 provider 的大写。缺少任一变量会明确报错。`provider: openai` 使用 OpenAIChatModel，适用于 GLM 等 OpenAI-compatible 服务；`provider: anthropic` 使用 AnthropicModel，读取 ANTHROPIC_BASE_URL 和 ANTHROPIC_API_KEY。模型名不会用于猜测服务或协议。

OpenRouter 的两种协议都读取 OPENROUTER_BASE_URL 和 OPENROUTER_API_KEY，例如地址填写 `https://openrouter.ai/api/v1`。`protocol: openai` 使用原生 OpenRouterModel / OpenRouterProvider，注入带配置地址的 OpenAI SDK client；`protocol: anthropic` 使用原生 AnthropicModel / AnthropicProvider 和 Anthropic SDK 的 Bearer token。Anthropic SDK 会自行添加 `/v1/messages`，因此适配时移除配置地址末尾的 `/v1`，同一地址可用于两种协议。Anthropic 直连按相同规则处理地址。角色通过档位引用本地模型配置键。

`context_window` 写入 Pydantic AI 原生 profile，省略时使用框架模型数据。配置损坏、未知协议、OpenRouter 缺少协议、直接服务与协议不匹配、默认模型不存在或无效容量、超时会明确报错。修改后重启生效。

## 外部 MCP

可直接要求 Agent 配置 MCP；它会按需加载内置 [mcp-config Skill](skills/mcp-config/SKILL.md)，使用 MCP 能力统一提供的有效配置路径。

## Multi-agent

默认与 **Super** 对话。内置角色使用 Pydantic AI Harness 的原生委派任务，结果回到
同一对话。输入以下固定角色请求可以在 Super 工作期间启动独立任务。

```text
/reviewer 审核会话恢复逻辑，给出证据与风险
/architect 设计取消和恢复的接口及验收条件
/executor 实施已批准的接口变更并运行受影响测试
```

Reviewer 和 Architect 可以直接读取和搜索普通项目文件，也可以查看 Git diff。
直接指派 Executor 时，默认可读写工作区内的普通文件。Super 从对话判断交接授权和范围，
信息明确时直接指派，有疑问时向用户澄清。Executor 的计划用于跟踪进度。
默认 `auto` 模式下，Super 和 Executor 的 Shell 命令在沙箱内运行。
默认放行的命令没有网络访问，Git 元数据写权限按命令规则授予。
显式询问或拒绝规则优先。关闭沙箱时，`auto` 模式恢复逐条询问。
受保护路径和用户配置的权限规则照常生效。
Super 和 Executor 都使用相同的工具权限规则。
角色内部可以根据任务难度与时长创建同角色分身。只读分身共享父工作区并行调查，
写入角色分身在父工作区串行执行。

从 Git 仓库根目录启动时，独立角色任务默认从 HEAD 创建 detached worktree，
读取已提交的代码。普通目录和仓库子目录直接使用当前工作目录，沿用工作区执行锁。
Super 在共享目录中发起的委派以前台方式执行；用户直接发起的任务可在后台运行，
Super 仍可回应与工作区无关的请求。
各任务拥有原生任务 ID、独立消息历史和 run_id。交付会显示角色、任务 ID、
run_id、工作目录和报告。后台任务成功、失败或取消后，Super 在当前运行结束后为该结果
启动独立的 run；前台委派仍在发起它的运行中直接返回结果。

可以引用已交付任务启动下一角色，`@` 后填写报告中的原生任务 ID。

```text
/executor @原生任务ID 按审核结论修复第1项，第2项暂缓
/reviewer @原生任务ID 审核 Executor 的实现
```

引用的来源必须已完成。来源使用 worktree 时，代码变更须先提交为明确检查点，
新角色基于该提交执行。来源使用共享目录时，新角色读取该目录的当前状态。
用户确认时展示对应 run_id 和完整交付内容。报告本身
不构成执行授权。Super 根据报告实施前也会请求确认。授权在重启后失效。

用户可以让 Super 查询后台任务、补充要求、继续中断任务或取消指定任务，
使用的是原生 list_tasks/message_task/delegate_task(resume=...)/cancel_task。
Ctrl+C 停止当前 Super 运行，独立后台任务继续；退出应用会取消并等待所有任务。
后台提问和审批显示在同一对话里，输入答案返回对应请求。

任务记录保存在固定数据库旁的 delegations 目录，运行快照继续保存在 sessions.db。
恢复 Super 会话时同时恢复原生任务记录。进程退出时未完成的任务标记中断，
继续前应检查已发生的副作用。worktree 缺失或基线不匹配时明确报错。
数据库位于原项目内部时，worktree 放在 ~/.cache/coder-cli/worktrees 下，避免
主工作区的执行锁阻塞独立任务；其他情况下保存在数据库旁的 worktrees 目录。
保留未整合的 worktree，删除会话也保留代码目录。需要整合时，明确要求 Super
审查并合入来源提交，现有计划与工具权限继续生效。

角色通过 `Role.model_tier` 选择 `ModelTier` 枚举中的档位。Super 和 Reviewer 使用 Medium，
Architect 使用 High，Executor 使用 Low。实际模型由 `provider.jsonc` 的 `model_tiers`
映射到 `models` 中的模型键。评测等直接调用模型工厂的入口使用 `default_model`。模型的协议、窗口
和超时统一从 provider.jsonc 读取。专业角色的模型在首次请求时解析，未使用的
provider 不要求凭据。.env 负责凭据和服务地址，旧 MODEL_NAME 值会被忽略。
专业角色默认无 Skills，可在内置 Role.skills 中指定仓库内技能目录；文件工具由
Role.file_tools 指定，还可用 Role.allowed_tools 限定整个角色的工具白名单。
Super 继续使用下述 Skills 来源。

## Skills

使用 Pydantic AI 原生 `Skills` 加载内置 `skills/` 和用户全局 `~/.agents/skills/`。内置技能优先；全局同名技能会被跳过并提示。全局目录不存在时不影响启动。

`web-download` 是全局外部技能，不随 coder-cli 分发。其脚本通过 `uv run --script` 使用独立依赖，并且只连接本机 Lightpanda；Lightpanda 缺失、检查失败或连接失败时退出，不回退到 Chromium。

外部技能可使用 [Skills CLI](https://github.com/vercel-labs/skills) 安装和更新：

```bash
npx skills add <owner/repo> -g
npx skills check
npx skills update
```

安装时确认技能位于 `~/.agents/skills/<技能目录>/SKILL.md`。每次 Agent 运行开始时重新发现技能，因此安装或更新后，下次发送消息即可生效；当前运行不刷新。Skills 只加载说明，不自动安装技能依赖的命令、MCP 服务或凭据。

空闲时在输入框键入 `/`，搜索技能名称或描述，用 ↑ / ↓ 选择、Enter 插入引用、Esc 关闭；再填写任务参数并提交。每条消息可主动引用一个技能，技能名显示为 `/技能名`。只有从列表选择才是主动引用，直接粘贴的绝对路径仍作为普通文本。删除或修改引用前缀会取消该引用。

列表只显示允许用户调用的技能（`user-invocable` 不为 false）；`disable-model-invocation: true` 只禁止模型自动加载，不禁止用户主动调用。提交时重新读取并校验技能，原生 `render()` 替换 `$ARGUMENTS` 或追加参数，模型无需先调用 `load_capability`。界面显示原始引用与参数，历史保存模型实际接收的技能说明。执行中的输入继续作为反馈，不展开新技能。

## 外部 Hook

通过启动进程的环境变量 `CODER_HOOK_CONFIG` 指定 JSON 配置的绝对路径。工作目录和项目 `.env` 不自动加载 Hook。省略变量时读取默认目录的 `hooks.json`，缺失时仅使用内置 Hook。

```json
{
  "hooks": [
    {"tool": "shell", "remove_prefix": "DEBUG: polling", "extra_chars": 1024}
  ]
}
```

支持 `shell` 和 `web_fetch` 文本结果，每个工具最多一条规则。`remove_prefix` 匹配行首。`extra_chars` 默认为 0，可申请对默认 4096 字符后的额外片段做过滤，最多 4096 字符。HTTP JSON 和 HTML 文本不使用外部行过滤。框架 WebFetch 返回的结构化结果或 BinaryContent 直接保留，不应用文本行过滤。

Hook 审批与工具审批独立。选择「以后都允许」会保存授权，之后在同一工作目录、配置路径和规则下无需再询问，重启后仍有效。将规则的 `extra_chars` 设为 0 可停止使用额外范围。配置不支持导入 Python、执行命令、读写文件或联网，包含未支持字段时会报错。

## 网页工具与 GAIA 验证

`web_fetch` 使用 Pydantic AI `WebFetch(native=False, local=True)`，保留本地权限与 Hook 执行链，HTML 转 Markdown。`web_search` 使用 `tavily-python`，从 `.env` 的 `TAVILY_API_KEY` 读取密钥，返回最多五个来源的标题、URL 和摘要。搜索不请求 Tavily 代答。原生 WebFetch 的私网访问保护和下载预算保持默认值。

GAIA 首轮使用独立的 **web-only Pydantic AI 基线**，只配备上述两项工具，不包含完整 coder-cli Harness 的规划、文件、shell、记忆和交互能力。它不作为完整 coder-cli 或全量 GAIA 的成绩。每题使用新 conversation，无历史继承；标准答案和标注只在评分进程使用。

先在 [GAIA 数据页](https://huggingface.co/datasets/gaia-benchmark/GAIA) 接受访问条件，再用 Hugging Face 本地登录凭据或 `.env` 中的 `HF_TOKEN`：

在 `coder-cli` 目录执行：

```bash
uv sync --locked --group eval
# 仅预览题单。无参数列出全量 validation 的 165 个任务 ID
uv run --group eval python -m evaluation.gaia_data
# 固定 10 道只需文本的任务
uv run --group eval python -m evaluation.gaia --subset text
# 从有附件的 Level 2 题中取前 3 道，可把同一组参数传给 gaia_data 预览
uv run --group eval python -m evaluation.gaia --level 2 --attachment with --limit 3
# 无参数实际运行全量 validation，会调用模型和搜索服务
uv run --group eval python -m evaluation.gaia
```

两个入口共用 `--subset {all,text}`、`--level {1,2,3}`、`--attachment {any,with,without}` 与 `--limit N`。默认选所有等级和附件状态。普通筛选按任务 ID 排序，`text` 按 `evaluation/gaia_text_subset.json` 中审核过的顺序。零匹配或数量超过可用任务会报错。数据与附件均锁定到同一个 revision。单个附件预算 32 MiB，UTF-8 文本直接送入提示，其余文件通过模型的二进制输入传入。模型无法处理的格式计入错误。

每题默认 `--timeout 180 --request-limit 20`，工具调用上限为 30。运行保存到 仓库根目录的 `benchmark/gaia/<UTC时间>/`。测试标题自动使用短 commit 和北京时间，如 `02b9fc66 · 11-06 08:56`，与 Dashboard 展示一致。页头点击“复测命令”可复制复测命令，修改代码后复跑会自动生成新标题，每次运行独立留档。打开固定的 [Benchmark Dashboard](../benchmark/gaia/index.html) 查看最新结果分布、类别表现、同题单测试选择、Agent commit 与配置版本和逐题表格。默认定位最新测试，侧栏可切换历史测试。比较自动选用当前测试之前最近一次同题单、不同 Agent 配置指纹的记录。没有符合条件的记录时显示空状态。各版本保留可离线打开的快照。配置记录模型、依赖、源码指纹、Git 提交、数据和评分版本。错误与未完成题均保留在计划题数中。

报告包含受限题目、参考答案与模型消息，仅供本地私有查看。网页内容会随时间变化。


Dashboard 的测试历史表与逐题表记录耗时、Token（输入加输出）、LLM 请求数和工具执行数，均来自 Pydantic AI 的 RunUsage。累计指标在全部题目均有对应数据时展示，存在缺失时显示空值。比较区分别绘制四项指标，坐标轴独立。

GAIA 命令使用 `.env` 中的 `LOGFIRE_TOKEN` 或本机 Logfire 配置开启采集，结束前刷新上传。两张表的 Logfire 入口打开该次 Evals 评测，逐题 JSON 记录保留 case 的 trace_id 和 span_id。既有离线记录未关联云端评测时显示“未采集”。云端访问仍需对应项目权限。


启动 Dashboard，在仓库根目录运行并保持终端开启：

```bash
python3 -m http.server 8876 --bind 127.0.0.1 --directory benchmark/gaia
```

然后打开 [Dashboard](http://127.0.0.1:8876/)。评测终端会显示总进度条和每题开始、结束及耗时。
