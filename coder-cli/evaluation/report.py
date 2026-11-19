"""Refresh the fixed, offline GAIA dashboard and keep version snapshots."""
import base64
import hashlib
import json
from collections import defaultdict
from pathlib import Path
from urllib.parse import quote

from evaluation.artifacts import fingerprint
from evaluation.report_metrics import aggregate, duration_distribution, logfire_link
from evaluation.report_views import CARD, BUTTON, case_rows, clipped, config_key, display_time, read, run_title, table, text

UI = Path(__file__).with_name("ui")
LABELS = ["正确", "答错", "异常", "未完成"]


def counts(s):
    return [s["correct"], s["planned"] - s["correct"] - s["errors"] - s.get("incomplete", 0),
            s["errors"], s.get("incomplete", 0)]


def document(directory, runs, prefix):
    m, s = read(directory / "manifest.json"), read(directory / "summary.json")
    title = run_title(m, directory.name)
    m.setdefault("test_version", directory.name)
    m.setdefault("subset", "自定义")
    s.setdefault("duration_seconds", aggregate([read(directory / f"{task}.json") for task in m["task_ids"]])["seconds"] or 0)
    cases, durations = case_rows(directory, m)
    history = []
    navigation = defaultdict(list)
    group_labels = {}
    for i, (folder, past, summary) in enumerate(reversed(runs)):
        records = [read(folder / f"{task}.json") for task in past["task_ids"]]
        measured = aggregate(records)
        source = past.get("source", {})
        commit = source.get("git_commit")
        comparable = bool(m.get("comparison_key")) and past.get("comparison_key") == m.get("comparison_key")
        identity = config_key(past)
        label = run_title(past, folder.name)
        href = prefix + quote(folder.name) + "/report.html"
        if past.get("task_ids"):
            active = "bg-gray-100 text-gray-900" if folder == directory else "text-gray-700 hover:bg-gray-100"
            group = fingerprint({"dataset": past.get("dataset"), "revision": past.get("revision"),
                                 "tasks": sorted(past["task_ids"])})
            subset = past.get("subset", "自定义")
            dataset = (past.get("dataset") or "GAIA").split("/")[-1]
            group_labels[group] = f"{dataset} · {subset} · {len(past['task_ids'])} 题"
            navigation[group].append(f'<a class="flex flex-col gap-1 py-2 px-3 text-sm rounded-lg {active}" href="{href}" '
                              f'aria-current="{"page" if folder == directory else "false"}">{clipped(label)}</a>')
        if comparable:
            history.append({"id": folder.name, "name": label, "time": display_time(folder.name), "config": identity,
                            "values": counts(summary), "accuracy": summary["accuracy_over_planned"] * 100,
                            **measured})
    totals = aggregate([read(directory / f"{task}.json") for task in m["task_ids"]])
    metrics = [("正确率", f'{s["accuracy_over_planned"]:.0%}'), ("计划题数", str(s["planned"])),
               ("异常", str(s["errors"])), ("耗时", f'{s["duration_seconds"]:.1f} s'),
               ("Token（输入+输出）", text(totals["tokens"])), ("LLM 请求", text(totals["requests"])),
               ("工具执行", text(totals["tools"]))]
    cards = "".join(f'<div class="px-3 py-2"><dt class="text-xs text-gray-500 whitespace-nowrap">{k}</dt><dd class="text-base font-semibold tabular-nums">{v}</dd></div>' for k,v in metrics)
    sidebar = "".join(f'<section class="mb-3" data-task-set="{key}"><h2 class="px-3 py-2 text-xs font-semibold text-gray-500">{clipped(group_labels[key])}</h2>{"".join(reversed(items))}</section>'
                      for key, items in reversed(navigation.items()))
    current = directory.name
    previous = [run for run in history if run["id"] < current and run["config"] != config_key(m)]
    default_baseline = previous[-1]["id"] if previous else None
    selection = m.get("selection") if isinstance(m.get("selection"), dict) else {}
    command = "uv run --group eval python -m evaluation.gaia"
    if m.get("subset", "").startswith("gaia-text"):
        command += " --subset text"
    if m.get("level"):
        command += f" --level {m['level']}"
    if selection.get("attachment"):
        command += " --attachment " + selection["attachment"]
    if selection.get("limit"):
        command += f" --limit {selection['limit']}"
    command += f" --timeout {m.get('timeout_seconds',180)} --request-limit {m.get('request_limit',20)}"
    data = {"rerun": command, "labels": LABELS, "outcomes": counts(s), "history": history, "duration_distribution": duration_distribution(durations), "current": current, "default_baseline": default_baseline}
    payload = json.dumps(data, ensure_ascii=False).replace("<", "\\u003c")
    css = (UI / "dashboard.css").read_text()
    script = "\n;".join((UI / path).read_text() for path in ("preline-4.2.0/tooltip.js", "charts/apexcharts.min.js", "dashboard.js"))
    digest = base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
    comparison_table = table(["测试", "正确率", "异常率", "耗时 · 秒", "Token（输入+输出）", "LLM 请求", "工具执行"], [], "comparison-table")
    return f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-{digest}'; style-src 'unsafe-inline'; img-src data:">
<title>GAIA Benchmark · {text(title)}</title><style>{css}</style></head>
<body class="bg-gray-50 text-gray-800">
<aside class="lg:w-56 lg:fixed top-0 start-0 bottom-0 z-40 bg-white border-b lg:border-e border-gray-200 overflow-y-auto" aria-label="测试侧栏">
<div class="px-4 py-3"><a class="font-bold text-lg text-gray-800" href="{prefix}index.html">Benchmark</a></div>
<nav class="px-3 space-y-1">{sidebar}</nav></aside>
<div class="lg:ps-56"><main class="max-w-7xl mx-auto px-3 py-3 space-y-2">
<header class="min-w-0 flex flex-wrap items-center justify-between gap-2"><div class="min-w-0">
<h1 class="text-xl font-bold">{clipped(title)}</h1>
<p class="mt-1 text-sm text-gray-500">{text(display_time(directory.name))} · {clipped(m["model"])}</p></div>
<div class="flex items-center gap-2"><button id="rerun" type="button" class="{BUTTON}">复测命令</button></div></header><code id="rerun-command" class="hidden block text-xs text-gray-500 wrap-anywhere"></code>
<dl class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 bg-white border border-gray-200 rounded-xl">{cards}</dl>
<section class="{CARD} space-y-2"><div class="flex flex-wrap items-center justify-between gap-3"><h2 class="text-base font-semibold">测试比较</h2>
</div>
<p id="comparison-empty" role="status" class="text-sm text-gray-500">暂无同题单的其他 Agent 版本</p>
<div id="comparison-mode" class="hidden text-sm text-gray-500"></div><div id="comparison-chart" class="hidden"></div><div id="comparison-metrics" class="hidden">{comparison_table}</div></section>
<section class="{CARD}"><h2 class="text-base font-semibold">耗时分布</h2><div id="duration-chart"></div></section>
<section class="{CARD}"><h2 class="text-base font-semibold mb-3">逐题记录</h2>{cases}</section>
</main></div>
<script id="benchmark-data" type="application/json">{payload}</script><script>{script}</script></body></html>"""


def render_run(output: Path):
    root = output.parent
    runs = [(p.parent, read(p), read(p.with_name("summary.json"))) for p in sorted(root.glob("*/manifest.json"), reverse=True)
            if p.with_name("summary.json").is_file()]
    for folder, manifest, _ in runs:
        if manifest.get("task_ids"):
            (folder / "report.html").write_text(document(folder, runs, "../"), encoding="utf-8")
    latest = next(folder for folder, manifest, _ in runs if manifest.get("schema_version") == 2)
    dashboard = root / "index.html"
    dashboard.write_text(document(latest, runs, ""), encoding="utf-8")
    return dashboard
