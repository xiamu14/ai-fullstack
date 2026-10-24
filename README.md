# 本地面试题库

Bun + TanStack Start（首屏 SSR、后续单页交互），BoardUI + Tailwind v4 + Motion，PostgreSQL 17。

## 启动

在 `app` 目录执行：

```sh
bun install --frozen-lockfile
cp .env.example .env
```

配置 `.env`：`OPENROUTE_API_TOKEN` 为 OpenRouter 密钥；设置 `POSTGRES_PASSWORD`，并让 `DATABASE_URL` 使用同一个密码。现有本机 `.env` 已配置，请勿覆盖。

```sh
bun run db:up
bun run db:migrate
bun run import
bun run dev
```

访问 <http://127.0.0.1:3006>。PostgreSQL 仅绑定 `127.0.0.1:54339`，数据保存在 Compose 命名卷中。`db:down` 不删除数据卷。

生产运行：

```sh
bun run check
bun run format:check
bun run build
bun run start
```

先关闭开发服务，避免占用同一端口。生产启动时工作目录必须为 `app`。

代码格式化：`bun run format`。使用 Biome，统一两空格缩进、单引号与按需分号；自动生成的路由文件、题库数据和评测报告不参与格式化。

## 题库与采集

- 顶层为 library，初始题库 `ai-agents` / `AI Agents`。来源、题目、草稿、作答都按 library 隔离。
- 新建题库：`bun run library:add <id> <名称>`。ID 使用小写字母、数字和连字符。界面下拉框自动读取所有题库。
- 题目放在 `content/questions/*.json`，填写目标 `libraryId`。只有 `reviewed` 题目导入。
- `bun run import` 只新增题目，重复执行不覆盖数据库中的人工修订。修改已入库内容需明确审核并更新数据库内容及版本，不会自动覆盖。
- `bun run export:md` 将实际数据库中的题目导出到 `content/markdown/`，保留 ID、library、版本、来源及评分细则，每文件不超过 300 行，不导出作答。
- `bun run collect <target>` 和 `bun run read:notes <target>` 复用已有采集脚本。`target` 为已有 CDP Proxy 页面标识；采集前需自行连接浏览器及 Proxy。
- `bun run read:images` 保留原脚本入口；本站 V1 题目整理只使用正文，不依赖图片或视频。

首批 20 题来自 8 篇有独立文字证据的已有帖子。参考答案与细则由本次整理者补充，未冒充原作者答案。审核依据见 [正文审核](docs/正文审核.md)，用户尚未独立复核。

## 评分验证

只调用 OpenRouter Decisions API 的 `typesafe/jev-1.14`，无替代模型或模拟评分。密钥仅在服务端读取。传出数据为题干、评分依据和答案，不传采集凭证。

```sh
bun run evaluate
```

运行 90 份标注答案，加 10 份答案各重复 3 次，总计 120 次计费请求。题目按开发集、留出集划分，同题答案不跨集合。原始响应与报告保存到 `reports/<时间>/`。只有开发集、留出集和重复测量均通过，才更新 `content/calibration.json`。

最新报告见 [评分验证](reports/2026-10-24T01-12-37.977Z/report.md)。初始答案标签由整理者制定，需要用户独立复核；不把样本结果解释为总体准确率。修改题干、细则或模型后，应增加版本并重新评测。

答案上限 12000 字，不截断。浏览器即时保存草稿，并自动同步 PostgreSQL；提交先落库，再请求评分。重试保留作答 ID，重做创建新 ID。原始响应、当时的完整题目、细则与实际模型版本随作答保存。评分失败不记零分；不确定时不给总分；确认关键错误封顶 59 分。历史仅在题目版本、模型快照和评分策略均相同时比较。

## 备份恢复

先停止站点写入。备份不含 `.env`，请单独妥善保存密钥配置。

```sh
bun run backup > interview-backup.sql
```

恢复会替换当前数据库中的题库和学习记录。确认目标正确且已有备份后执行：

```sh
bun run restore < interview-backup.sql
```

已将备份恢复到独立验证库，核对题目与表结构后删除验证库，未替换工作库。

## 设计与检查

应用控件使用 BoardUI 官方源组件。BoardUI 基础 token 与字体定义保存在 `src/styles/*.ts`，由 Vite 虚拟样式入口交给 Tailwind 编译；没有额外 CSS 文件，页面使用 Tailwind 工具类。抽屉使用同一 React Aria 基础构建，提供焦点限制、Escape 关闭与关闭后焦点恢复；Motion 负责抽屉及内容切换，并尊重减少动态效果设置。

已执行类型检查、生产构建、HTTP SSR/资源检查、真实数据库提交与失败重试检查、重复导入及独立库备份恢复。未使用浏览器或 Computer Use 检查界面；布局、交互视觉与题目内容留给用户验收。
