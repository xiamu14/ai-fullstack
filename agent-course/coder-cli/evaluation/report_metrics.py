"""Usage aggregation keeps missing values distinct from measured zero."""
from urllib.parse import urlsplit


def case_metrics(record):
    usage = record.get("usage") or {}
    incoming, outgoing = usage.get("input_tokens"), usage.get("output_tokens")
    return {"seconds": record.get("duration_seconds"),
            "tokens": incoming + outgoing if incoming is not None and outgoing is not None else None,
            "requests": usage.get("requests"), "tools": usage.get("tool_calls")}


def aggregate(records):
    values = [case_metrics(record) for record in records]
    return {key: sum(v[key] for v in values) if values and all(v[key] is not None for v in values) else None
            for key in ("seconds", "tokens", "requests", "tools")}


def logfire_link(value):
    if not value:
        return '<span class="text-gray-400">未采集</span>'
    from html import escape
    parsed = urlsplit(value)
    if parsed.scheme != "https" or parsed.username or parsed.password or not (
        parsed.hostname in {"logfire.pydantic.dev", "logfire-us.pydantic.dev", "logfire-eu.pydantic.dev"}
    ):
        return '<span class="text-gray-400">链接无效</span>'
    return f'<a href="{escape(value, quote=True)}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Logfire 评测 ↗</a>'


def duration_distribution(records):
    import math
    limits = (5, 10, 20, 30, 60, 120, 180)
    labels = ["<5 s", "5–<10 s", "10–<20 s", "20–<30 s", "30–<60 s", "60–<120 s", "120–<180 s", "≥180 s", "未采集"]
    counts = [0] * len(labels)
    for record in records:
        seconds = record.get("seconds")
        if seconds is None or not math.isfinite(seconds) or seconds < 0:
            counts[-1] += 1
        else:
            index = next((i for i, upper in enumerate(limits) if seconds < upper), len(limits))
            counts[index] += 1
    return {"labels": labels, "counts": counts,
            "percentages": [100 * count / len(records) if records else 0 for count in counts]}
