# Memory

- EvoLink CLI 已配置（2026-11-04）：`npm install -g @evolinkai/cli`（v0.13.0），OAuth 登录成功，凭据存 macOS 钥匙串，服务端 https://mcp.evolink.ai/mcp。余额约 630.3 credits（≈$9.27）。技能装在 `~/.openclaw/skills/evolink-cli/` 和 `~/.hermes/skills/evolink-cli/`。验证命令：`evolink balance --json`。生成流程：`evolink models search` → quote（estimate/approve）→ `evolink generate image|video|audio --quote ID --confirm --wait` → `evolink download TASK_ID --output FILE`。
- 本会话天气工具只支持美国地区；查中国天气用 open-meteo API（web_fetch）。
# Memory

- EvoLink 海报生成实测（2026-11-04）：`gemini-nano-banana-2.1` + 参考图（upload 后 files.evolink.ai URL）+ size 2:3 + quality 4K，任务 `task-unified-1793754524-ivi5e9a5`，70 秒完成，实扣 7.4238 credits（≈$0.109；2K 版约 3.19 credits）。成品 `poster-popart-memphis.png`（3392×5056，18.5MB，波普×孟菲斯风格达标）。流程：`estimate --input-file`（stdout 单独重定向到文件再解析，避免 stderr 进度条污染 JSON；quote_id 在顶层字段）→ 用户确认 → `generate image --quote ID --confirm` → `tasks wait TASK_ID --json` → `download TASK_ID --output`。大图内联预览需 ≤5MB：`sips -s format jpeg -Z 1200` 压预览图，且预览图必须放工作区内才能 read_file。
- EvoLink 已配置完成（2026-11-04）：`@evolinkai/cli` v0.13.0 全局安装，OAuth 登录成功（凭据在 macOS 钥匙串，token 自动续期），技能装在 `~/.claude`、`~/.openclaw`、`~/.hermes` 的 `skills/evolink-cli/`（status current）。生成后余额约 623 credits。用户已确认走 **CLI 方式**（shell 调 evolink 命令），不再注册 coder-cli MCP（mcp.evolink.ai 只收 OAuth Bearer，静态 header 接入需 dashboard API key，已放弃）。生成流程：`models search` → `estimate`（quote，30 分钟内有效）→ `generate --quote ID --confirm --wait` → `download`。验证：`evolink balance --json`。
- 本会话天气工具只支持美国地区；查中国天气用 open-meteo API（web_fetch）。

