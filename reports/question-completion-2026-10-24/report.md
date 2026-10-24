# 全量有效正文整理与验证

145 篇有效正文全部建立题目关联，未整理正文为 0。保留原有 52 题，新增 111 题，数据库与应用目录均为 163 题。不是将一篇帖子机械对应一道题：相近内容合并，多个独立考点拆题；题目中的来源列表保留相应完整正文。

## 评分验证

四个独立批次并发运行，每进程最多 4 个请求，总并发不超过 16。没有重新运行正文判定。

本批 555 份答案均取得真实 Jev 响应，551 份有确定总分，4 份不确定，平均绝对误差 1.85 分。关键错误漏报、误报、提示词注入失败均为 0。每题 5 类答案，逐题验收全部通过；沿用原有模型快照与阈值，没有用本批样本重新校准。
API 返回用量中记录的本批费用合计 $0.039992。

|批次|题目|答题样本|确定总分|MAE|
|---|---:|---:|---:|---:|
|[A](../question-completion-a/report.json)|30|150|149|2.08|
|[B](../question-completion-b/report.json)|36|180|178|1.90|
|[C](../question-completion-c/report.json)|20|100|100|1.79|
|[D](../question-completion-d/report.json)|25|125|124|1.55|

不确定样本：`preference-dialogue-paraphrase`、`workspace-context-isolation-partial`、`engineering-tradeoff-evidence-complete`、`intent-injection-resilience-injection`。不确定样本没有按零分处理。

请求前保存标记，失败、超时或中断不重试。第二轮只请求新增 45 份答案，前 510 份复用记录；最终关闭密钥后再运行旧批与四个新批，全部复用缓存且无新增请求。原始响应和请求指纹保留，可根据同名 fixture 回查输入与标签。

## 覆盖和保留证明

- [逐篇正文—题目清单](../../docs/全量正文题目整理.md)：145 篇均有对应已审核题目；正文哈希和题内证据与数据库逐字段一致。
- [覆盖核对](coverage-verification.json)：数据库与应用目录同为 163 题，111 道新题文件和入库内容相同。
- [学习记录保留核对](preservation-verification.json)：原有题干、答案和细则均未改；8 份草稿、作答记录、145 篇来源完全未变。
- [来源更正](provenance-correction.json)：`agent-loop` 原先误关联图数据库正文，现改为两篇直接讲 Agent Loop 的帖子，版本升为 2026-10-24.2。其余 51 道旧题完全不变。
- [指纹迁移核对](fingerprint-migration.json)：逐份验证评分内容未变后，将 715 份记录的缓存绑定到实际评分输入；旧内容指纹另存为 artifactFingerprint。来源或版本更正不会引发无关重评分。
- 原帖包含的 32 道意图识别问题另有[逐项映射](../../content/intent-source-topic-coverage.json)，未按单一泛化问题草率覆盖。
- 重复导入新增 0 题。私有导入前后数据库备份在 backups/question-completion-2026-10-24/，不提交 Git。

## 验收范围

题目、答案和标签由整理者制定，尚待用户独立复核；这批验证不代表总体准确率。部分正文只有问题或观点，工程解法明确标为整理者补充，未把营销数字或未核实产品细节当作事实。

类型检查、Biome 格式检查、生产构建及重复导入检查通过。现有 3006 服务的 HTTP 响应为 200，并包含最新题目与 163 题数据；详见 [HTTP 核对](http-verification.json)。未进行浏览器或 Computer Use 视觉检查，未启动新 Web 服务。
