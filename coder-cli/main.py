import argparse
import asyncio
import sys
from pathlib import Path

from agent_runtime import create_agent
from conversation import Conversation, error_message
from sessions import list_sessions, load_session_history
from tui.app import ChatApp
from tui.sessions import SessionsApp


def main() -> None:
    parser = argparse.ArgumentParser(description="Coding Agent 多轮对话", allow_abbrev=False)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--sessionId", help="恢复指定会话的消息历史；省略时由 Agent 新建")
    mode.add_argument("--sessions", action="store_true", help="列出 sessionId 和 title；选择一行按 C 复制 ID")
    args = parser.parse_args()
    if args.sessionId is not None and (not args.sessionId.strip() or args.sessionId == "new"):
        parser.error("--sessionId 不能为空，也不能使用框架保留值 new")
    if args.sessions:
        try:
            sessions = asyncio.run(list_sessions(Path("workspace/sessions.db")))
        except Exception as exc:
            parser.exit(1, f"读取会话失败：{error_message(exc)}\n")
        if not sessions:
            print("暂无已保存会话。")
        elif sys.stdin.isatty() and sys.stdout.isatty():
            SessionsApp(sessions).run()
        else:
            print("sessionId\ttitle")
            for session in sessions:
                print(f"{session.session_id}\t{session.title}")
        return
    if not sys.stdin.isatty() or not sys.stdout.isatty():
        parser.error("TUI 需要交互终端，请直接在终端运行 uv run python main.py")
    try:
        history = asyncio.run(load_session_history(Path("workspace/sessions.db"), args.sessionId)) if args.sessionId else []
    except Exception as exc:
        parser.exit(1, f"恢复会话失败：{error_message(exc)}\n")
    try:
        agent = create_agent()
    except ValueError as exc:
        parser.error(str(exc))
    ChatApp(Conversation(agent, args.sessionId, history=history)).run()


if __name__ == "__main__":
    main()
