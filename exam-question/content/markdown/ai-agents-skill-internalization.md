# 外部 Skill 与能力内化有何区别

ID: skill-internalization
Library: ai-agents
Version: 2026-10-24.1

模块：模型交互 · 难度：L3

## 题干

推理时读取 Skill 和通过训练将技能内化到模型参数有什么区别？哪些信息仍适合放在外部？

## 参考答案

1. 机制区分：读取外部 Skill 依赖本次上下文且不自动改变模型参数；训练内化通过参数更新形成可复用的行为能力。

2. 内外分工：稳定通用的程序性策略可以作为内化候选；经常变化或特定任务的事实更适合外部状态。

3. 收益验证：比较有无外部 Skill 时的任务表现；结合上下文与训练成本检验内化后的泛化和依赖程度。

题目、答案与细则由整理者依据已保存正文补充，不是原作者的标准答案。原帖只提供问题或观点时，工程解法属于整理者补充；宣传数字、产品版本及性能承诺未作为已验证事实。

## 评分细则

### 机制区分（权重 1）

0. 未涉及机制区分，或主张与本考点相反的做法
1. 只泛泛提及机制区分，没有说明以下任何具体要点
2. 清楚说明以下任一要点：读取外部 Skill 依赖本次上下文且不自动改变模型参数；训练内化通过参数更新形成可复用的行为能力
3. 涉及以下两个要点，但其中一个说明不完整：读取外部 Skill 依赖本次上下文且不自动改变模型参数；训练内化通过参数更新形成可复用的行为能力
4. 完整说明以下两个要点，允许同义表述及合理替代方案：读取外部 Skill 依赖本次上下文且不自动改变模型参数；训练内化通过参数更新形成可复用的行为能力

### 内外分工（权重 1）

0. 未涉及内外分工，或主张与本考点相反的做法
1. 只泛泛提及内外分工，没有说明以下任何具体要点
2. 清楚说明以下任一要点：稳定通用的程序性策略可以作为内化候选；经常变化或特定任务的事实更适合外部状态
3. 涉及以下两个要点，但其中一个说明不完整：稳定通用的程序性策略可以作为内化候选；经常变化或特定任务的事实更适合外部状态
4. 完整说明以下两个要点，允许同义表述及合理替代方案：稳定通用的程序性策略可以作为内化候选；经常变化或特定任务的事实更适合外部状态

### 收益验证（权重 1）

0. 未涉及收益验证，或主张与本考点相反的做法
1. 只泛泛提及收益验证，没有说明以下任何具体要点
2. 清楚说明以下任一要点：比较有无外部 Skill 时的任务表现；结合上下文与训练成本检验内化后的泛化和依赖程度
3. 涉及以下两个要点，但其中一个说明不完整：比较有无外部 Skill 时的任务表现；结合上下文与训练成本检验内化后的泛化和依赖程度
4. 完整说明以下两个要点，允许同义表述及合理替代方案：比较有无外部 Skill 时的任务表现；结合上下文与训练成本检验内化后的泛化和依赖程度

关键错误：只要推理时读过一次 SKILL.md，就等于模型参数已经永久学会其中全部能力。

## 来源

[SKILL0：Agent Skill 从调用走向内化](https://www.xiaohongshu.com/explore/6a0a6a0b00000000080335e1)，卡卡螺丝，2026-05-18T01:23:23.000Z，仅正文。

个人观点：大模型后续middle train，各类具备实际价值的复杂技能，都将逐步完成模型内部化融合与固化

当前Agent Skill的主流范式，仍然是推理时加载：把任务相关的SKILL.md、脚本、模板或历史经验放进上下文，让模型按需调用。这条路线在工程上有效，Claude Agen tSkills也采用类似思路；近期SkillRL、Skill Graph等工作则尝试构建Skill Bank，或把技能组织成可组合的图结构

但这里有一个更深的问题：如果技能始终作为外部上下文存在，模型到底是在学会技能，还是只是在照着说明书执行？这种范式会受到三类限制：检索噪声可能引入无关技能；多轮任务中技能文本会持续消耗上下文；agent能力没有真正进入policy本身

SKILL0的思路是把AgentSkillInternalization明确作为训练目标。它提出In-ContextReinforcementLearning：训练阶段仍然给模型skillcontext，让agent在rollout中借助技能完成工具调用和多步决策；但这些技能只是脚手架，最终要被移除。模型需要在RL中把程序性知识、行动模式和任务策略吸收到参数中

论文的核心机制是Dynamic Curriculum，评估每个skillfile对当前policy的on-policy helpfulness：比较同一类子任务在有/无该技能时的表现差异。仍然有帮助的技能会暂时保留，收益下降的技能会随着逐步收缩的skillbudget被撤掉，直到推理时完全不需要skill context

结果上，SKILL0在7B模型上ALF World达到89.8，Search-QA达到44.4；相对Agent OCR分别提升+9.7和+6.6，并把上下文成本控制在低于0.5ktokens/step

长远来看，技能库适合快速扩展能力，但长期稳定、低成本、可泛化的能力，应该被逐步蒸馏进模型行为。未来更强的Agent系统，可能会同时保留外部技能生态和内部化训练机制：前者负责快速适配新任务，后者负责把高频可靠的技能沉淀为模型自身能力
#人工智能[话题]# #agent[话题]# #强化学习[话题]# #skill[话题]# #agentskill[话题]# #论文阅读[话题]#  #buildinpublic[话题]#

[Meta：Agent 变强之后，还需要 Harness 吗？](https://www.xiaohongshu.com/explore/6acd5836000000001b02d582)，EvelynN，2026-10-12T21:59:18.000Z，仅正文。

最近终于发布了EvoHarness-RL完整版🎉

我们研究的问题是：

当long-horizon agent的policy model变强后，还需要外部memory、state tracker、progress log和skill library，也就是agent harness吗？

现有harness多由人工设计：何时写入memory、recall或记录progress，通常依赖prompt、rule和heuristic。我们进一步探索：

能否让Agent自己学会哪些信息应internalize到模型参数，哪些应externalize到harness，以及何时值得调用harness？

我们提出EvoHarness-RL，将不同环境中的harness统一为共享的Belief-Progress-Experience interface。

同一policy同时决定environment action和harness action。训练时先通过SFT学会how to use the harness，再通过cost-aware RL学习when the harness is worth using。

我们发现，harness在RL早期能帮助agent更快产生成功轨迹和有效learning signal，提高rollout efficiency；但随着policy变强，模型对harness的依赖会下降，这一现象被称为Harness Annealing。

稳定的coordination pattern会被internalize，而episode-specific、environment-dependent或可跨任务复用的信息则保留在外部。模型逐渐学会什么值得internalize，什么值得externalize，并在不同环境中形成独特的model–harness division of labor。

paper已放出 代码已开源[派对R]

📄 Paper: arxiv 2608.05446
🌐 Project page: evoharnessrl.github.io
💻Code: EvoHarnessRL/EvoHarness-RL

#AI[话题]# #AIAgent[话题]# #LLM[话题]# #大模型[话题]# #强化学习[话题]# #AgentMemory[话题]# #SelfEvolvingAgent[话题]# #科研[话题]#
