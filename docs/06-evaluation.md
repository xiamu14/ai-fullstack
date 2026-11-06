# 06 评测

在 Agent 时代：

- **模型（Models）** 是从海量数据与奖励信号中训练出来的；
- **智能体（Agents）** 是围绕评测指标（Evaluation）迭代开发出来的；
- **最终软件与操作结果（Software & Artifacts）** 是由智能体自主生成的。

这意味着，如果你无法用清晰、可自动验证的**评测（Eval）**来定义“什么叫把事情做对了”，你就既无法训练模型，也无法改进 Agent，更不敢把 Agent 生成的代码部署上线。**编写规格说明（Specification）与编写评测验证器（Evaluation）**合二为一。

## 6.1 评测实验

[第五章的 HTTP 实验](./05-harness.md#用-http-示例验证) 验证了严格规划能跑通。要判断它是否减少步骤遗漏，需要让基线和候选方案重复执行同一组任务，再比较结果。

## 1. 设计对照实验

选取小修复、多文件功能和重构任务。固定任务、验收标准、模型版本、预算及审批规则。每次从同一初始状态启动，先只改变一个变量，再比较有效能力的组合。

| 实验 | 要验证的收益 | 同时观察的代价 |
|---|---|---|
| 加任务计划 | 步骤遗漏、任务偏离是否减少 | 计划更新的 token 与工具调用 |
| 加验证反馈约束 | 验收通过与回归情况是否改善 | 检查耗时、修复次数 |
| 调节 Thinking | 困难任务成功率是否提高 | 总耗时、输入／输出与推理 token（接口提供时） |
| 加独立评审 | 是否发现前述流程遗漏的问题 | 额外请求、误报与修复成本 |

验收以实际改动和独立测试为准。计划状态和模型总结用于解释过程。

## 2. 用 Pydantic Evals 组织实验

`Case` 定义任务和预期结果，`Dataset.evaluate()` 运行用例并生成报告，`EqualsExpected` 比较实际值和预期值。[Pydantic Evals 官方文档](https://pydantic.dev/docs/ai/evals/)

下面以比较 Thinking 设置为例。示例中的 `run_case` 是待接入的评测入口，coder-cli 尚未实现这项评测。

```python
from pydantic_evals import Case, Dataset
from pydantic_evals.evaluators import EqualsExpected

dataset = Dataset(
    cases=[
        Case(
            name="patch_persists",
            inputs="修复 PATCH 返回新名称、GET 却读到旧值的问题",
            expected_output=0,  # 独立验收命令的退出码
        ),
    ],
    evaluators=[EqualsExpected()],
)

async def baseline(prompt):
    return await run_case(prompt, thinking=None)

async def candidate(prompt):
    return await run_case(prompt, thinking="medium")

for task in (baseline, candidate):
    report = await dataset.evaluate(task, max_concurrency=1)
    report.print()
```

```text
run_case(prompt, thinking)
  从同一份带缺陷的 mini_http 创建临时目录和新会话
  通过 create_agent / Conversation.send 运行现有 Harness
  Agent 结束后，由评测程序独立运行 test_patch_updates_name
  保存 run_id、耗时、result.usage 和测试退出码
  返回测试退出码，交给 EqualsExpected
```

`run_id` 沿用 [Pydantic AI 的运行标识](https://pydantic.dev/docs/ai/api/pydantic-ai/run/)。对照前先确认所用模型确实支持并区分两种 Thinking 设置。一个 PATCH 用例可验证评测入口，多任务、多次运行才用于比较通过率、耗时和 token。
