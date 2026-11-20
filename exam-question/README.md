# 本地面试题库

Bun + TanStack Start（首屏 SSR、后续单页交互），BoardUI + Tailwind v4 + Motion，PostgreSQL 17。

当前 AI Agents：**163 题，覆盖全部 145 篇有效正文**。逐篇对应见 [整理清单](docs/全量正文题目整理.md)。

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

访问 <http://127.0.0.1:3006>。PostgreSQL 仅绑定 `127.0.0.1:54339`。Compose 项目 `ai-fullstack-exam-question` 复用外部卷 `app_interview-data`，`db:down` 会保留此卷。仅在全新环境中需要初始化空库时，先执行 `docker volume create app_interview-data`。

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
- `bun run collect <target>` 和 `bun run read:notes <target>` 使用 `scripts/collection/` 内的采集脚本。`target` 为已有 CDP Proxy 页面标识；采集前需自行连接浏览器及 Proxy。
- `bun run read:images` 使用 Python 3、Tesseract 和 `sources/tessdata/` 中的 `chi_sim.traineddata`、`eng.traineddata` 识别图片；本站 V1 题目整理只使用正文，不依赖图片或视频。

首批 20 题来自 8 篇有独立文字证据的已有帖子。参考答案与细则由本次整理者补充，未冒充原作者答案。审核依据见 [正文审核](docs/正文审核.md)，用户尚未独立复核。

## 评分验证

只调用 OpenRouter Decisions API 的 `typesafe/jev-1.14`，无替代模型或模拟评分。密钥仅在服务端读取。传出数据为题干、评分依据和答案，不传采集凭证。

```sh
bun run evaluate
```

该命令评测 `content/evaluation/` 下全部答案，并为 10 份答案各重复 3 次；会产生计费请求。首批历史运行是 90 份答案加 30 次重复，共 120 次请求。题目按开发集、留出集划分，同题答案不跨集合。原始响应与报告保存到 `reports/<时间>/`。只有开发集、留出集和重复测量均通过，才更新 `content/calibration.json`。

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

## 旧正文迁移

2026-10-24 已将 145 篇符合条件的正文来源关联到 AI Agents，新增 137 篇，原有 8 篇未覆盖；核验后删除对应旧 JSON，119 篇未采用记录保留。视频只使用独立正文。题目与学习记录不受影响；没有把来源帖自动认定为可评测题。详见 [逐篇迁移记录](docs/正文来源迁移.md)。

迁移命令：

- `bun run sources:review`：每帖最多调用 Jev 一次；先落请求标记，再发送。失败、超时或中断只记录，不自动或手动重跑请求；再次运行命中已有记录，不再请求。低置信度条目保留 pending，复核完成前不导入。
- `bun run sources:import`：只导入 include 记录；有冲突时停止，保护已有来源；回读核对正文哈希。
- `bun run sources:verify`：核对数据库和旧文件，输出验证清单。
- `bun run sources:backup-check`：读取已有私有备份，恢复到独立临时库验证；不替换工作库。
- `bun run sources:cleanup`：仅在备份恢复证明有效、数据库与旧文件哈希一致时清理已迁移 JSON；可重跑，不扩大删除范围。

`read:notes` 现同时查询数据库已保存的 source ID 和本地未迁移 JSON，避免清理后重新抓取。该脚本使用 Bun 执行，须在 app 目录运行以加载 .env。采集脚本位于 `scripts/collection/`，原始索引、正文和媒体位于 `sources/`，来源迁移脚本也读取此目录。`sources/` 含个人收藏和访问参数，已忽略 Git 跟踪，迁移机器时需单独复制。

私有备份包含旧记录，可能带历史采集访问参数，不提交 Git、不发送模型。恢复单篇旧文件可从 notes.tar.gz 提取到原 notes 目录；数据库回退使用 database.sql，会替换当前数据，执行前需保存后续新作答。

## 新题入库

2026/10/24 已从保存正文整理并新增 32 题，实际题库共 **52 题**，覆盖 7 个模块。原有 20 题及 7 份草稿保留。新题包含参考答案、3 项考点及各项 0–4 分细则和原帖正文证据；每个考点按 0–4 分分级。题目与答案为整理者补充，尚待用户独立复核。

```sh
bun run questions:evaluate
bun run import
bun run export:md
```

`questions:evaluate` 只验证本批 32 题的 160 份答题样本，不重跑正文判定。固定既有模型快照和阈值，不重新校准；请求前保存标记，失败、超时或中断不重试，再次运行复用已保存结果。只有达到验收条件的题目才标为 reviewed，由 import 新增入库。已请求样本内容发生变化时停止，避免覆盖原始验证证据。

32 题全部通过：159/160 份答案给出确定总分，平均绝对误差 2.17 分，关键错误漏报、误报和注入失败均为 0。详见 [新题验证与入库核对](reports/question-expansion-2026-10-24/report.md)。这是本批整理样本的结果，不代表总体准确率。145 篇来源已保存，并非每篇都是独立面试题；本批没有机械地逐帖出题。

## 全量正文整理

已完成全部 145 篇有效正文的题目整理，新增 111 题，实际题库共 **163 题**。原有 52 题的题干、答案和细则均保留；其中 agent-loop 修正来源并升级版本，其余 51 题完全不变。8 份草稿、作答记录和来源正文保持不变。

```sh
bun run questions:evaluate:batches
bun run import
bun run questions:verify:coverage
bun run export:md
```

四个批次并发评分，每批最多 4 个请求，总并发最多 16。题目清单分别在 content/question-completion-a.json 至 question-completion-d.json。每份答题样本最多请求一次，先持久化请求标记，失败、超时或中断不重试；重复运行读取已有记录。不会重新判断正文。

新增题对应 555 份答题样本，111 题全部通过逐题验收。551 份有确定评分，4 份不确定；关键错误漏报、误报和注入失败均为 0。模型快照与评分阈值沿用既有配置，未重新调参。内容、标签仍待用户独立复核，不能将这批结果理解为总体准确率。

questions:verify:coverage 会核对数据库中每篇正文的哈希、题目关联、题内完整证据、逐批评分结果、题目文件与实际入库内容，以及应用目录是否展示全部题目。source-coverage.json 为 145 篇正文的逐篇清单，intent-source-topic-coverage.json 为原帖 32 道意图识别问题的逐项映射。详见 [全量整理验证报告](reports/question-completion-2026-10-24/report.md)。

评分缓存指纹绑定题干、答案、细则、关键错误、样本标签及评分配置；仅更正来源或版本不会重发请求，改变评分内容仍会停止并保护原始记录。旧指纹已逐份验证后保留为 artifactFingerprint，迁移未发起新请求。所有代码、来源、题目、答题 fixture 与报告纳入版本管理；密钥和私有数据库备份不纳入。

## 采集依赖与范围

2026-11-05 已将旧采集脚本和资料迁入本项目，删除外部资料目录和旧 Markdown 笔记。
从 `app` 运行采集命令；先启动数据库，并准备已登录的收藏页和监听 `localhost:3456` 的 CDP Proxy（提供 eval、navigate、scroll、screenshot 接口）。浏览器、Proxy、Python 3 与 Tesseract 是外部运行依赖。遇到验证码时停止，不绕过验证。

图片识别的本地语言模型放在 `sources/tessdata/`；新环境可安装 Tesseract 后执行：

```sh
mkdir -p sources/tessdata
curl -fL https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/chi_sim.traineddata -o sources/tessdata/chi_sim.traineddata
curl -fL https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/eng.traineddata -o sources/tessdata/eng.traineddata
```

本次只迁移现有能力：正文采集与来源审核仍限定 2026-01-01 至 2026-10-22，审核报告仍使用历史批次目录。整理者需将来源整理成 `content/questions/` 内含答案、评分细则的题目 JSON，再评测、审核和导入；没有自动出题流水线。视频不做转录。
