import argparse
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from bs4 import BeautifulSoup

from evaluation.artifacts import write_json
from evaluation.gaia_data import SUBSET, add_filters, prompt_for, select_cases
from evaluation.report import render_run
from evaluation.report_views import config_key


def sample(identifier, level=1, file_name=None):
    return {"task_id": identifier, "Level": level, "Question": "fixture",
            "Final answer": "yes", "file_name": file_name}


class SelectionAndReporting(unittest.TestCase):
    def test_no_flags_and_composable_filters(self):
        parser = argparse.ArgumentParser()
        add_filters(parser)
        rows = [sample(task["task_id"]) for task in SUBSET["tasks"]]
        extra = sample("0383a3ee-47a7-41a4-b493-519bdefe0488")
        attached = sample("00000000-0000-4000-8000-000000000001", 2, "file.txt")
        rows.extend([extra, attached])

        def select(*args):
            return select_cases(rows, **vars(parser.parse_args(args)))

        self.assertEqual(len(select()), 12)
        self.assertEqual([case.name for case in select("--subset", "text")], [t["task_id"] for t in SUBSET["tasks"]])
        with TemporaryDirectory() as temp:
            path = Path(temp) / "file.txt"
            path.write_text("evidence")
            with patch("evaluation.gaia_data.hf_hub_download", return_value=path):
                case, = select("--level", "2", "--attachment", "with", "--limit", "1")
                self.assertEqual(prompt_for(case.inputs), ["fixture", "evidence"])
        with self.assertRaises(ValueError):
            select("--subset", "text", "--attachment", "with")

    def test_comparison_scope_and_untrusted_trace_html(self):
        with TemporaryDirectory() as temp:
            root = Path(temp)
            for label, key in [("01-old", "different"), ("02-baseline", "same"), ("03-candidate", "same")]:
                out = root / label
                out.mkdir()
                write_json(out / "manifest.json", {"schema_version": 2, "test_version": label, "model": "test",
                           "subset": "text", "comparison_key": key, "task_ids": ["task"], "source": {"agent_sha256": label}})
                write_json(out / "summary.json", {"planned": 1, "correct": 0, "errors": 0, "incomplete": 0,
                           "accuracy_over_planned": 0, "duration_seconds": 1})
                write_json(out / "task.json", {"status": "completed", "correct": False, "question": "fixture",
                           "answer": "actual", "expected_answer": "expected"})
                (out / "task.events.jsonl").write_text(json.dumps({"tool": "<script>sample</script>"}))
                render_run(out)
            html = (root / "index.html").read_text()
            page = BeautifulSoup(html, "html.parser")
            self.assertIn("03-candidate", page.title.string)
            links = {a["href"] for a in page.select("aside nav a")}
            self.assertEqual(links, {"01-old/report.html", "02-baseline/report.html", "03-candidate/report.html"})
            self.assertIn("01-old/report.html", html)
            self.assertFalse(page.select('link[rel="stylesheet"], script[src]'))
            self.assertIn(".grid", page.style.string)
            self.assertIn("HSTooltip", page.select("script")[-1].string)
            self.assertNotIn("<script>sample</script>", html)
            self.assertTrue(page.select_one('#case-table'))
            self.assertFalse(page.select_one('#run-table'))
            self.assertEqual(len(page.select('aside section[data-task-set]')), 1)
            self.assertFalse(page.select_one('#detail-modal'))
            self.assertFalse(page.select('main pre'))
            self.assertFalse(page.select("[data-detail], template"))
            charts = json.loads(page.select_one("#benchmark-data").string)
            self.assertEqual([item["name"] for item in charts["history"]], ["— · 02-baseline", "— · 03-candidate"])
            self.assertEqual(charts["outcomes"], [0, 1, 0, 0])
            self.assertIsNone(page.select_one("#outcome-chart"))
            self.assertEqual(charts["current"], "03-candidate")
            self.assertNotIn("--test-version", charts["rerun"])
            self.assertFalse(page.select_one('#copy-title'))
            self.assertEqual(page.select_one('#rerun').text, '复测命令')
            self.assertEqual(charts["default_baseline"], "02-baseline")
            self.assertTrue(page.select_one('aside nav a[aria-current="page"]'))
            self.assertIsNone(page.select_one('#candidate-run'))
            self.assertIsNone(page.select_one('#baseline-run'))

    def test_agent_configuration_identity(self):
        manifest = {"source": {"agent_sha256": "code-a", "git_commit": "commit-a"}, "model": "model-a"}
        self.assertEqual(config_key(manifest), config_key({**manifest, "test_version": "repeat"}))
        self.assertNotEqual(config_key(manifest), config_key({**manifest, "model": "model-b"}))
        self.assertNotEqual(config_key(manifest), config_key({**manifest, "source": {"agent_sha256": "code-b"}}))

    def test_usage_metrics_and_logfire_entry(self):
        from evaluation.report_metrics import aggregate, case_metrics, logfire_link
        measured = {"duration_seconds": 2, "usage": {"input_tokens": 10, "output_tokens": 4, "requests": 2, "tool_calls": 1}}
        self.assertEqual(case_metrics(measured), {"seconds": 2, "tokens": 14, "requests": 2, "tools": 1})
        self.assertEqual(aggregate([measured, measured])["tokens"], 28)
        self.assertIsNone(aggregate([measured, {"usage": None}])["requests"])
        self.assertEqual(aggregate([{"usage": {"input_tokens": 0, "output_tokens": 0, "requests": 0, "tool_calls": 0}}])["tools"], 0)
        self.assertIn('href="https://logfire.pydantic.dev/org/project/evals/compare?experiment=trace-span"',
                      logfire_link("https://logfire.pydantic.dev/org/project/evals/compare?experiment=trace-span"))
        self.assertNotIn('href=', logfire_link('javascript:alert(1)'))
        self.assertIn('未采集', logfire_link(None))

    def test_beijing_time_display(self):
        from evaluation.report_views import display_time
        self.assertEqual(display_time("20261106T005651.301250Z"), "2026-11-06 08:56:51")
        self.assertEqual(display_time("baseline-v1"), "baseline-v1")

    def test_duration_distribution_boundaries_and_scale(self):
        from evaluation.report_metrics import duration_distribution
        result = duration_distribution([{"seconds": value} for value in (0, 5, 10, 20, 30, 60, 120, 180, None)])
        self.assertEqual(result["counts"], [1] * 9)
        self.assertAlmostEqual(sum(result["percentages"]), 100)
        large = duration_distribution([{"seconds": 15}] * 400)
        self.assertEqual(len(large["counts"]), 9)
        self.assertEqual(large["counts"][2], 400)
        self.assertEqual(large["percentages"][2], 100)

    def test_short_commit_and_time_title(self):
        from evaluation.report_views import run_title
        self.assertEqual(run_title({"test_version": "custom", "source": {"git_commit": "02b9fc66abcd"}},
                                   "20261106T005651.301250Z"), "02b9fc66 · 11-06 08:56")

    def test_regional_logfire_urls(self):
        from evaluation.report_metrics import logfire_link
        for region in ("logfire", "logfire-us", "logfire-eu"):
            self.assertIn('href=', logfire_link(f'https://{region}.pydantic.dev/org/project/evals/compare?experiment=id'))
        for url in ('https://logfire-us.pydantic.dev.evil.test/', 'https://evil.logfire.pydantic.dev/', 'https://user:password@logfire-us.pydantic.dev/'):
            self.assertNotIn('href=', logfire_link(url))
