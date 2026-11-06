import asyncio
from contextlib import redirect_stdout
from io import StringIO
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import AsyncMock

from pydantic_ai import Agent
from pydantic_ai.messages import ModelResponse, ToolCallPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel

from evaluation.gaia import Answer, run_cases
from evaluation.gaia_data import select_cases
from evaluation.gaia_score import question_scorer

TASK = "00000000-0000-4000-8000-000000000001"


def row(**overrides):
    return {"task_id": TASK, "Question": "Find the value", "Final answer": "42", "Level": "1",
            "file_name": "", "file_path": "", "Annotator Metadata": {"answer": "secret"}, **overrides}


class GaiaTests(unittest.IsolatedAsyncioTestCase):
    def test_official_match_rules(self):
        for answer, expected, correct in (
            ("$1,200", "1200", True), ("12%", "12", True), ("0.12", "12", False),
            ("Sea gull!", "seagull", True), ("A;2", "a,2", True),
            ("2,a", "a,2", False), ("St Johns, 2", "St. Johns, 2", False),
            ("1.00001", "1", False), ("42 because", "42", False),
        ):
            with self.subTest(answer=answer, expected=expected):
                self.assertEqual(question_scorer(answer, expected), correct)

    def test_selection_and_label_isolation(self):
        cases = select_cases([row(), row(task_id="00000000-0000-4000-8000-000000000002", file_name="x.pdf")], 1, attachment="without")
        self.assertEqual(cases[0].inputs.model_dump(mode="json"), {"task_id": TASK, "question": "Find the value", "attachment": None})
        self.assertEqual(cases[0].expected_output, "42")
        for rows, limit in (([row(file_path="../x.pdf")], 1), ([row(**{"Final answer": ""})], 1), ([row()], 0)):
            with self.assertRaises(ValueError):
                select_cases(rows, limit)

    async def test_evals_runs_agent_without_label_and_saves_ids(self):
        def model(messages, info):
            self.assertNotIn("secret", str(messages))
            self.assertEqual(messages[0].parts[0].content, "Find the value")
            return ModelResponse(parts=[ToolCallPart(info.output_tools[0].name, {"final_answer": "42"})])

        async def stream(messages, info):
            response = model(messages, info)
            part = response.parts[0]
            yield {0: DeltaToolCall(name=part.tool_name, json_args=json.dumps(part.args))}

        with TemporaryDirectory() as directory:
            output = Path(directory)
            output_text = StringIO()
            with redirect_stdout(output_text):
                summary = await run_cases(
                    select_cases([row()], 1), Agent(FunctionModel(model, stream_function=stream), output_type=Answer), output,
                    timeout=5, request_limit=2,
                )
            self.assertIn("[1/1] 开始", output_text.getvalue())
            self.assertIn("已返回，待评分", output_text.getvalue())
            self.assertEqual((summary["planned"], summary["correct"], summary["errors"]), (1, 1, 0))
            saved = json.loads((output / f"{TASK}.json").read_text())
            self.assertTrue(saved["conversation_id"])
            self.assertTrue(saved["run_id"])
            self.assertTrue((output / f"{TASK}.messages.json").is_file())

    async def test_timeout_is_recorded_in_denominator(self):
        async def slow(*args, **kwargs):
            await asyncio.sleep(10)

        with TemporaryDirectory() as directory:
            output = Path(directory)
            agent = AsyncMock()
            agent.run.side_effect = slow
            summary = await run_cases(select_cases([row()], 1), agent, output, timeout=0.01, request_limit=1)
            self.assertEqual(summary["errors"], 1)
            self.assertEqual(summary["accuracy_over_planned"], 0)
            record = json.loads((output / f"{TASK}.json").read_text())
            self.assertEqual(record["status"], "execution_error")
            self.assertIn("TimeoutError", record["error"])


    async def test_cancellation_propagates_and_leaves_incomplete_record(self):
        started = asyncio.Event()

        async def slow(*args, **kwargs):
            started.set()
            await asyncio.sleep(10)

        agent = AsyncMock()
        agent.run.side_effect = slow
        with TemporaryDirectory() as directory:
            output = Path(directory)
            task = asyncio.create_task(run_cases(select_cases([row()], 1), agent, output, timeout=5, request_limit=1))
            await started.wait()
            task.cancel()
            with self.assertRaises(asyncio.CancelledError):
                await task
            record = json.loads((output / f"{TASK}.json").read_text())
            self.assertEqual(record["status"], "incomplete")
            self.assertEqual(json.loads((output / "summary.json").read_text())["incomplete"], 1)


if __name__ == "__main__":
    unittest.main()
