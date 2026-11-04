## 3. Multi-Agent
减少 Token 消耗（将不同任务交付不同模型，且不同 agent 专注不同任务），提高速度；需要 router 设计（参考 Amp）。
## 4. Sub-Agent
降低 context window 长度（防止 context 腐败），难点是交付和反馈，并行和串行的运行流；重点在上下文隔离
