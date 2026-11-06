"""Preline table and modal views for private benchmark data."""
import json
from datetime import UTC, datetime
from zoneinfo import ZoneInfo
from html import escape
from pathlib import Path


from evaluation.artifacts import fingerprint
from evaluation.report_metrics import case_metrics, logfire_link

CARD = "min-w-0 flex flex-col bg-white border border-gray-200 shadow-2xs rounded-lg p-3"
BUTTON = "py-1.5 px-2.5 self-start inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def text(value):
    return escape(str(value)) if value is not None else "—"


def display_time(value):
    try:
        timestamp = datetime.strptime(value, "%Y%m%dT%H%M%S.%fZ").replace(tzinfo=UTC)
    except ValueError:
        return value
    return timestamp.astimezone(ZoneInfo("Asia/Shanghai")).strftime("%Y-%m-%d %H:%M:%S")


def run_title(manifest, run_id):
    commit = manifest.get("source", {}).get("git_commit")
    timestamp = display_time(run_id)
    if len(timestamp) == 19 and timestamp[4] == "-":
        timestamp = timestamp[5:16]
    return f"{commit[:8] if commit else '—'} · {timestamp}"


def clipped(value, display=None):
    full = text(value)
    label = text(value if display is None else display)
    return (f'<span class="hs-tooltip inline-block max-w-56 align-middle">'
            f'<span tabindex="0" class="hs-tooltip-toggle block max-w-56 truncate">{label}'
            f'<span class="hs-tooltip-content hidden hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 invisible transition-opacity absolute z-90 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded-md shadow-2xs max-w-sm whitespace-normal wrap-anywhere" role="tooltip">{full}</span></span></span>')


def table(headers, rows, identifier):
    head = "".join(f'<th scope="col" class="px-3 py-2 whitespace-nowrap text-start text-xs font-medium text-gray-500">{h}</th>' for h in headers)
    body = "".join('<tr class="hover:bg-gray-50">' + "".join(f'<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{cell}</td>' for cell in row) + '</tr>' for row in rows)
    return f'<div class="overflow-x-auto"><table id="{identifier}" class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr>{head}</tr></thead><tbody class="divide-y divide-gray-200">{body}</tbody></table></div>'


def config_key(manifest):
    source = manifest.get("source", {})
    files = source.get("files", {})
    agent = source.get("agent_sha256") or fingerprint({k: v for k, v in files.items() if k in {
        "evaluation/gaia.py", "tools/web_tools.py", "integrations/provider.py", "provider.json", "uv.lock"}})
    return fingerprint({"agent": agent, **{k: manifest.get(k) for k in (
        "model", "instructions", "provider_endpoint_sha256", "versions", "timeout_seconds", "request_limit", "tool_calls_limit")}})


def case_rows(directory, manifest):
    rows, durations = [], []
    for i, task in enumerate(manifest["task_ids"], 1):
        r = read(directory / f"{task}.json")
        status = "正确" if r.get("correct") is True else "答错" if r.get("correct") is False else "异常" if r["status"].endswith("_error") else "未完成"
        metrics = case_metrics(r)
        duration = round(r.get("duration_seconds", 0), 1)
        error = r.get("error", "")
        if error:
            try:
                error = json.loads(error)
            except json.JSONDecodeError:
                pass
        concise = str(error).strip().splitlines()[-1] if error else ""
        if "web_fetch" in concise and "exceeded max retries" in concise:
            concise = "WebFetch 重试耗尽"
        rows.append([str(i), clipped(r.get("question", "题目未保存")),
                     status, clipped(r.get("answer")), f"{duration} s",
                     text(metrics["tokens"]), text(metrics["requests"]), text(metrics["tools"]),
                     clipped(concise), logfire_link(r.get("logfire_url"))])
        durations.append({"name": str(i), **metrics})
    return table(["#", "问题", "结果", "答案", "耗时", "Token（输入+输出）", "LLM 请求", "工具执行", "错误", "Logfire"], rows, "case-table"), durations
