# 代码文件约束

- 本仓库所有手写代码文件（包括测试和脚本）均不得超过 500 行，空行和注释计入总行数。
- 接近上限时，按职责拆分文件，保持调用关系清晰；不得通过压缩多条语句或删除必要说明规避限制。
- 第三方依赖、虚拟环境、生成文件和锁文件不计入此限制。
- 提交改动前检查新增和修改的代码文件行数。
- 只捕获能够处理的具体异常，禁止裸 `except`、`except Exception` 和 `except BaseException`；编程错误继续抛出，取消信号不得吞掉。
- 应用层和课程沿用 Pydantic AI 的 `conversation_id`（会话标识）与 `run_id`（一次 Agent 运行标识），不另设 `turn_id` 别名或生成另一套 ID；课程文档须注明术语来源并链接 Pydantic AI 官方文档。

# 课程文档范围

- `docs/` 是 Agent 开发课程，只讲解 Agent 的原理、框架、工具、上下文、记忆、会话持久化、运行控制、评测等相关知识。
- 以后不得在 `docs/` 添加 TUI/UI 的实现、框架、样式、布局、组件、交互、快捷键或界面操作说明，也不得混入相关代码分层和测试说明。
- CLI 的参数、启动步骤及界面使用说明放在对应项目的 `README.md`；界面源码与许可证来源放在实现目录，不写入课程文档。

# TUI 范围

- TUI 必须沿用 Toad 的原始样式、默认 Dracula 主题和对应组件结构，不自定义配色、间距、边框或布局样式。仅摘录本项目使用的 TUI 规则，并在 coder-cli/tui/TOAD-NOTICE.md 记录来源、保留上游许可证。
- 不引入 Toad 的 ACP、Agent 管理、多会话并行、侧栏、商店、权限系统或其他无关代码；`--sessions` 仅复用会话表格的 TUI 样式，不接入 Toad 会话存储或恢复逻辑；Agent 执行继续使用现有 Pydantic AI Harness。
- CLI 默认直接进入对话 TUI；`--sessions` 查看本项目已保存会话并支持复制 ID，`--help` 显示参数说明。这些均为 CLI 功能，不给 Agent 增加 slash 指令系统。不提供位置参数 prompt 或单次命令模式。
- 会话参数为可选的 `--sessionId`：不传时由 Agent 在首轮运行生成会话 ID，成功后从 `result.conversation_id` 获取并沿用，传入时使用指定 ID。不添加 `--session`、`--sesionId` 等别名。
- 传入已有 `--sessionId` 时，必须加载该会话最近一次成功轮次的完整消息快照（包括工具调用和结果），传给 Agent 的 `message_history` 并还原界面；不能只传 ID。历史读取失败时明确报错，不静默改用空历史。

- Agent 构建与 `message_history` 恢复统一由 `create_agent(session_id)` 负责，返回准备好的会话运行对象。TUI 层命名为 `ChatShell`，只展示消息和处理交互，不读取或恢复会话数据；`main.py` 只解析参数、调用工厂并启动外壳。
