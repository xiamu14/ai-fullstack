# Toad TUI 来源

上游：[batrachianai/toad](https://github.com/batrachianai/toad)，读取日期 2026-11-03。
许可：GNU Affero General Public License v3，完整文本见 TOAD-LICENSE.txt。

- toad-global.tcss：src/toad/toad.tcss 中的消息块、Markdown、Throbber 和 Footer。
- toad-conversation.tcss、toad-prompt.tcss：src/toad/screens/main.tcss 中的对话、输入、信息栏、工具结果和主屏幕规则。
- toad-sessions.tcss：screens/session_resume_modal.tcss，移除未使用的 ACP 警告规则；tui/sessions.py 复用表格结构，使用本项目数据，支持复制、删除会话与退出。
- throbber.py：src/toad/widgets/throbber.py，仅补充 Python 3.13 所需的 Callable 导入。
- highlighted_textarea.py：上游同名文件中的 Markdown 输入配色与缓存，只保留 Markdown 展示，移除 shell、路径和 slash 命令相关代码。
- messages.py、prompt.py、tools.py 中的界面结构及工具标题呈现，依据对应的上游 widgets 组件裁剪适配；执行和消息事件由本项目实现。
- messages.py 在 Contents 的布局后处理中按实际宽度重新测量消息高度，修正 Textual stream 布局未扣除水平 margin 导致的换行裁切；样式声明保持上游原样。
- skills.py：依据 src/toad/widgets/slash_complete.py 的 Input、OptionList、选择与关闭结构裁剪，只用于 Skill 选择；以名称和描述过滤替代上游模糊搜索与 Columns。toad-prompt.tcss 补回 main.tcss 中 SlashComplete 的原始规则，移除未使用的其他组件选择器与子规则，声明值保持不变。读取日期 2026-11-04。

样式仅移除未使用组件的完整规则，保留使用中组件的声明值及主题。未引入 ACP、会话管理、商店、侧栏、权限、规划、路径补全或独立 shell 执行器。不为未实现的功能显示入口。

原始文件 SHA-256（下载时的 main 分支内容）：

```json
{
  "src__toad__toad.tcss": "f147e61d809ec842bd51f9d672b32057ed23ca591e6dd8ec392e34e27ece6342",
  "src__toad__screens__main.tcss": "db86d12ce6459938f28d179d619a103f55515f98947a3121ccdd06fe72d9b86b",
  "src__toad__widgets__throbber.py": "18ac67add33ac227610e618c8e044b55400ec06c13bf33f97e5486dfdbaf4ff2",
  "src__toad__widgets__tool_call.py": "55cfc920455209154cf0056156299f5c965fc79423dc608aac49095fbb173e08"
}
```
