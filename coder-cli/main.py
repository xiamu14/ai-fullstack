import argparse
import asyncio
import sqlite3
import sys

import httpx

from agent.runtime import create_agent
from agent.conversation import error_message
from storage.sessions import list_sessions, session_database
from tui.sessions import SessionsApp
from tui.shell import ChatShell


def main() -> int | None:
    parser = argparse.ArgumentParser(description="Coding Agent 多轮对话", allow_abbrev=False)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--sessionId", help="恢复指定会话的消息历史；省略时由 Agent 新建")
    mode.add_argument("--sessions", action="store_true", help="列出 sessionId、title 和 workspace；选择一行按 C 复制 ID、D 删除会话")
    parser.add_argument("--path", help="工作目录，支持绝对或相对路径；默认当前目录；传 --sessionId 时忽略")
    args = parser.parse_args()
    if args.sessionId is not None and (not args.sessionId.strip() or args.sessionId == "new"):
        parser.error("--sessionId 不能为空，也不能使用框架保留值 new")
    if args.sessions:
        try:
            sessions = asyncio.run(list_sessions(session_database()))
        except (OSError, sqlite3.Error, ValueError) as exc:
            parser.exit(1, f"读取会话失败：{error_message(exc)}\n")
        if not sessions:
            print("暂无已保存会话。")
        elif sys.stdin.isatty() and sys.stdout.isatty():
            SessionsApp(sessions).run()
        else:
            print("sessionId\ttitle\tworkspace")
            for session in sessions:
                print(f"{session.session_id}\t{session.title}\t{session.workspace}")
        return
    if not sys.stdin.isatty() or not sys.stdout.isatty():
        parser.error("TUI 需要交互终端，请直接在终端运行 uv run python main.py")
    try:
        conversation = asyncio.run(create_agent(args.sessionId, args.path))
    except (OSError, sqlite3.Error, ValueError, httpx.InvalidURL) as exc:
        parser.exit(1, f"初始化失败：{error_message(exc)}\n")
    shell = ChatShell(conversation)
    shell.run()
    return shell.return_code


if __name__ == "__main__":
    sys.exit(main())
