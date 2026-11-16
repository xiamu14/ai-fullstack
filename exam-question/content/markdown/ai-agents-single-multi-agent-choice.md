# 什么时候值得拆成多 Agent

ID: single-multi-agent-choice
Library: ai-agents
Version: 2026-10-24.1

模块：决策编排 · 难度：L3

## 题干

同一个任务既可以用单 Agent 加工具，也可以拆成多个 Agent，如何决定是否拆分？

## 参考答案

1. 拆分收益：判断是否存在可独立处理的专业任务或并行工作；区分需要独立上下文的角色与普通工具调用。

2. 协调代价：计入通信上下文传递及结果整合成本；检查协调失败和错误传播的额外风险。

3. 对照验证：以单 Agent 作为可比较的基线；只有质量延迟或隔离收益足以覆盖协调代价时再采用多 Agent。

题目、答案与细则由整理者依据已保存正文补充，不是原作者的标准答案。原帖只提供问题或观点时，工程解法属于整理者补充；宣传数字、产品版本及性能承诺未作为已验证事实。

## 评分细则

### 拆分收益（权重 1）

0. 未涉及拆分收益，或主张与本考点相反的做法
1. 只泛泛提及拆分收益，没有说明以下任何具体要点
2. 清楚说明以下任一要点：判断是否存在可独立处理的专业任务或并行工作；区分需要独立上下文的角色与普通工具调用
3. 涉及以下两个要点，但其中一个说明不完整：判断是否存在可独立处理的专业任务或并行工作；区分需要独立上下文的角色与普通工具调用
4. 完整说明以下两个要点，允许同义表述及合理替代方案：判断是否存在可独立处理的专业任务或并行工作；区分需要独立上下文的角色与普通工具调用

### 协调代价（权重 1）

0. 未涉及协调代价，或主张与本考点相反的做法
1. 只泛泛提及协调代价，没有说明以下任何具体要点
2. 清楚说明以下任一要点：计入通信上下文传递及结果整合成本；检查协调失败和错误传播的额外风险
3. 涉及以下两个要点，但其中一个说明不完整：计入通信上下文传递及结果整合成本；检查协调失败和错误传播的额外风险
4. 完整说明以下两个要点，允许同义表述及合理替代方案：计入通信上下文传递及结果整合成本；检查协调失败和错误传播的额外风险

### 对照验证（权重 1）

0. 未涉及对照验证，或主张与本考点相反的做法
1. 只泛泛提及对照验证，没有说明以下任何具体要点
2. 清楚说明以下任一要点：以单 Agent 作为可比较的基线；只有质量延迟或隔离收益足以覆盖协调代价时再采用多 Agent
3. 涉及以下两个要点，但其中一个说明不完整：以单 Agent 作为可比较的基线；只有质量延迟或隔离收益足以覆盖协调代价时再采用多 Agent
4. 完整说明以下两个要点，允许同义表述及合理替代方案：以单 Agent 作为可比较的基线；只有质量延迟或隔离收益足以覆盖协调代价时再采用多 Agent

关键错误：多 Agent 数量越多，任务质量必然越高，可以不设基线且忽略协调成本。

## 来源

[花了 10 亿 Token 整理的 Agent 面试知识库](https://www.xiaohongshu.com/explore/6a2571ca000000001603cfcc)，万川出海，2026-06-07T13:27:38.000Z，仅正文。

最近一直在系统学习 AI Agent，最大的感受就是：
资料很多，但太散了。
Agent Loop、Context Engineering、RAG、MCP、多 Agent、LangGraph……每个概念都看过一点，真正面试或者做项目时，却很难把它们串成一个完整系统。
所以我做了一个开源知识库：Agent Camp。
它不是简单堆文章，而是按照“面试会怎么问、工程上怎么做”组织内容，目前已经整理了 140+ 篇：
LLM、Prompt、Context Engineering
RAG、Function Calling、MCP
Agent Loop、Planning、Memory、Skills
Workflow 与 Agent 的边界
Supervisor、Swarm、Orchestrator-Worker
源码解析
Agent Eval、Observability、Harness、安全与成本优化

我尤其想解决一个问题：
不只告诉你“是什么”，还要讲清楚“为什么这么设计”。
比如：
Tool 和 Agent 到底有什么区别？
多 Agent 一定比单 Agent好吗？
Search Agent 为什么还需要自己的 Agent Loop？
Workflow 和 Agent 应该怎么选？

Agent 跑长任务时，如何避免上下文污染和目标漂移？
比较适合：
准备 Agent / LLM 应用工程师面试
正在做 RAG、MCP、多 Agent 项目
学过很多概念，但还没有形成体系

项目已经开源，搜索：
yibo365/agent-camp
还在持续更新，欢迎 Star
#AIAgent[话题]# #大模型[话题]# #人工智能[话题]# #Agent开发[话题]# #多Agent[话题]# #RAG[话题]# #MCP[话题]# #ClaudeCode[话题]# #程序员面试[话题]# #开源项目[话题]# #AI工程师[话题]#

[Stanford把Agent工程压成仨词](https://www.xiaohongshu.com/explore/6a9b53f300000000250372ca)，geek007，2026-09-04T23:27:47.000Z，仅正文。

刷到 Stanford 新课 CS329Z: Engineering AI Agents 的讨论，原帖作者没复述课程介绍，去拆了 syllabus，拆出来的东西挺值得记。

开篇课就把 Agent Engineering 的核心工程问题概括成三个词：Decomposition、Data、Evaluation。RAG、Tool Use、MCP、Agent Framework 这些都在前半程，定位是基础能力。后半程从 Agent Data、Trajectory、Memory、Optimization 讲到 Evaluation、Coding Agent、Long-running Agent、Reliability——重头戏在后面。

作业设计也顺着这条线。作业①是从零搭一个 Agent，作业②直接改成 Evaluate an Agent，自己设计 benchmark、grader、LLM-as-Judge、做 error analysis。Evaluation 连着讲两周。

一个细节：课里专门区分 pass@k 和 pass^k。前者是多试几次能不能成一次，后者是连续跑很多次能不能都成。对 Agent 这是两种可靠性，长任务要的是后者。

Multi-Agent 那节讲得也克制，orchestration、handoff、collaboration 之外，专门讨论协调失败和错误传播，reading 里放了篇《Don't Sleep on Single-agent Systems》。课程没把「更多 Agent」默认成「更好的系统」。

把这门课看成 Stanford 给 2026 年 Agent 技术栈拍的切片，挺准。工具调用那些正在变成底座，往后真正难的是数据怎么来、系统怎么评、能不能在长时间真实环境里稳定跑。这几问大概就是接下来一两年的主线。

𝕏@Xudong07452910

#AIAgent
#Stanford
#大模型
#AI编程
#程序员
