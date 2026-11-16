# Agent 凭证如何管理

ID: secret-injection
Library: ai-agents
Version: 2026-10-24.1

模块：系统设计 · 难度：L3

## 题干

Agent 需要调用带 API Key 的外部工具。怎样管理凭证，避免密钥出现在模型上下文和日志中？

## 参考答案

1. 静态存储：凭证在受控存储中加密保存；限制能够读取凭证的主体与权限。

2. 运行注入：由执行层按需注入凭证；模型只获得凭证引用而非明文密钥。

3. 泄露治理：日志和返回内容需要脱敏；支持撤销或轮换凭证并记录使用审计。

题目、参考答案和分级细则由整理者依据已保存正文补充，不是原作者原题或逐字答案；原帖中的宣传数字及产品实现描述不作为未经验证的事实。

## 评分细则

### 静态存储（权重 1）

0. 未涉及静态存储，或主张与本考点相反的做法
1. 只泛泛提及静态存储，没有说明以下任何具体要点
2. 清楚说明以下任一要点：凭证在受控存储中加密保存；限制能够读取凭证的主体与权限
3. 涉及以下两个要点，但其中一个说明不完整：凭证在受控存储中加密保存；限制能够读取凭证的主体与权限
4. 完整说明以下两个要点，允许同义表述及合理替代方案：凭证在受控存储中加密保存；限制能够读取凭证的主体与权限

### 运行注入（权重 1）

0. 未涉及运行注入，或主张与本考点相反的做法
1. 只泛泛提及运行注入，没有说明以下任何具体要点
2. 清楚说明以下任一要点：由执行层按需注入凭证；模型只获得凭证引用而非明文密钥
3. 涉及以下两个要点，但其中一个说明不完整：由执行层按需注入凭证；模型只获得凭证引用而非明文密钥
4. 完整说明以下两个要点，允许同义表述及合理替代方案：由执行层按需注入凭证；模型只获得凭证引用而非明文密钥

### 泄露治理（权重 1）

0. 未涉及泄露治理，或主张与本考点相反的做法
1. 只泛泛提及泄露治理，没有说明以下任何具体要点
2. 清楚说明以下任一要点：日志和返回内容需要脱敏；支持撤销或轮换凭证并记录使用审计
3. 涉及以下两个要点，但其中一个说明不完整：日志和返回内容需要脱敏；支持撤销或轮换凭证并记录使用审计
4. 完整说明以下两个要点，允许同义表述及合理替代方案：日志和返回内容需要脱敏；支持撤销或轮换凭证并记录使用审计

关键错误：把 API Key 明文写入模型提示词和普通日志是推荐做法。

## 来源

[Envless — Agent 时代的密钥管理](https://www.xiaohongshu.com/explore/6a752e24000000003300a57b)，一目烟，2026-08-07T01:00:20.000Z，仅正文。

干掉 .env 文件！Envless — Agent 时代的密钥管理 🔒
✨ 一句话说清楚
Envless 是一个用 Zig 写的开源密钥管理工具——
你不再需要 .env 文件，不再需要服务器，不再需要 Vault。
一条命令存密钥，一条命令注入运行，process.env 照用不误。
🔄 传统模式 vs Envless
❌ 以前
· .env 文件明文存密钥
· 容易误提交到 Git
· 换机器要手动拷贝
· 泄露了才知道出事
✅ 现在
· 密钥 age+sops 加密存储
· .envless/ 目录天然 gitignore
· identity key 即身份，随走随用
· exec 注入，应用无感知切换

🏗️ 核心架构
envless init
→ 生成 identity.key + recipients
envless set KEY
→ age 公钥加密 → sops 写入 secrets/*.env.enc
envless exec -- CMD
→ sops 解密 → 注入 process.env → fork 子进程
MCP Server（可选）
→ JSON-RPC 2.0 over stdio → AI Agent 直接读写密钥

✨ 六大亮点
⚡ Zig 编写
单个二进制 150KB，零运行时依赖，交叉编译 4 平台
🔒 age + sops 加密
军事级加密，密钥只有 identity.key 持有者能解
🤖 内置 MCP Server
AI Agent 通过 JSON-RPC 安全读写密钥，全程无人介入
🌍 多环境支持
--env=dev / staging / prod，密钥天然隔离
💾 自动备份
tar.gz 打包加密文件，identity key 安全排除
🚀 一键迁移
envless migrate .env → 加密存储，原文件删除，gitignore 自动更新

🎮 快速上手
Step 1⃣ 安装（macOS / Linux）
brew tap biliboss/envless
brew install envless
Step 2⃣ 初始化 + 存密钥
cd ~/your-project
envless init
echo "sk-xxx" | envless set OPENAI_API_KEY
Step 3⃣ 注入运行
envless exec -- node server.js
process.env.OPENAI_API_KEY 已就绪 ✅
Step 4⃣ 迁移已有 .env
envless migrate .env
加密 → secrets/dev.env.enc → 删除 .env → 更新 .gitignore

🛠️ 技术栈
Zig 0.16.0 · age · sops

💡 为什么值得关注
不是又一个 .env 管理器，而是 Agent 时代的密钥基础设施。
传统密钥管理：人写 .env → 应用读取 → 容易泄露
Envless：Agent → MCP → 加密密钥 → 安全注入
当你用 Claude Code、Cursor、Copilot 写代码时，
Agent 需要读取 API Key、数据库密码等敏感信息——
Envless 让这个过程既自动化又安全。
#开源[话题]# #密钥管理[话题]# #AI开发[话题]# #Zig语言[话题]# #DevOps[话题]# #envless[话题]# #开发者工具[话题]# #Agent开发[话题]# #安全[话题]#
