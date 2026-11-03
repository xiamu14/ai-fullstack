import asyncio
import os
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch

from pydantic_ai import Agent
from pydantic_ai.messages import ModelResponse, TextPart, ToolReturnPart, UserPromptPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel

from conversation import Conversation, error_message


class ConversationTests(unittest.IsolatedAsyncioTestCase):
    async def test_streaming_tools_and_two_turns_preserve_history_without_duplicates(self):
        observed = []
        calls = 0
        tool_calls = []

        def double(value: int) -> int:
            tool_calls.append(value)
            return value * 2

        async def model(messages, info):
            nonlocal calls
            calls += 1
            observed.append(messages[:])
            if calls == 1:
                yield "先调用工具。"
                yield {1: DeltaToolCall(name="double", json_args='{"value": 3}')}
            else:
                yield "答案"
                yield "是六"

        conversation = Conversation(Agent(FunctionModel(stream_function=model), tools=[double]), "demo")
        fragments = []

        async def on_text(text):
            fragments.append(text)

        first = await conversation.send("计算三的两倍", on_text)
        self.assertEqual(tool_calls, [3])
        self.assertEqual(first.output, "答案是六")
        self.assertIn("答案是六", "".join(fragments))
        self.assertTrue(any(isinstance(p, ToolReturnPart) for m in conversation.history for p in m.parts))
        await conversation.send("继续解释", on_text)
        prompts = [p.content for m in observed[-1] for p in m.parts if isinstance(p, UserPromptPart)]
        self.assertEqual(prompts, ["计算三的两倍", "继续解释"])
        self.assertEqual(sum(isinstance(m, ModelResponse) for m in conversation.history), 3)

    async def test_agent_generates_id_and_following_turn_reuses_it(self):
        agent = Agent(FunctionModel(lambda messages, info: ModelResponse(parts=[TextPart("回复")])))
        conversation = Conversation(agent)
        self.assertIsNone(conversation.session_id)
        with patch.object(agent, "run", wraps=agent.run) as run:
            first = await conversation.send("第一轮")
            self.assertIsNone(run.call_args.kwargs["conversation_id"])
            self.assertTrue(first.conversation_id)
            self.assertEqual(conversation.session_id, first.conversation_id)
            second = await conversation.send("第二轮")
            self.assertEqual(run.call_args.kwargs["conversation_id"], first.conversation_id)
            self.assertEqual(second.conversation_id, first.conversation_id)
        other = await Conversation(agent).send("新会话")
        self.assertNotEqual(other.conversation_id, first.conversation_id)

    async def test_failure_and_cancellation_keep_last_successful_history(self):
        agent = Agent(FunctionModel(lambda messages, info: ModelResponse(parts=[TextPart("已记住")])))
        conversation = Conversation(agent, "demo")
        await conversation.send("记住这句话")
        previous = conversation.history[:]
        for error in (RuntimeError("请求失败"), asyncio.CancelledError()):
            with patch.object(agent, "run", side_effect=error):
                with self.assertRaises(type(error)):
                    await conversation.send("失败的消息")
            self.assertEqual(conversation.history, previous)
        await conversation.send("恢复后继续")
        prompts = [p.content for m in conversation.history for p in m.parts if isinstance(p, UserPromptPart)]
        self.assertEqual(prompts, ["记住这句话", "恢复后继续"])

    async def test_compacted_result_replaces_old_history(self):
        compacted = [ModelResponse(parts=[TextPart("摘要")])]
        result = SimpleNamespace(conversation_id="demo", all_messages=lambda: compacted)
        agent = SimpleNamespace(run=AsyncMock(return_value=result))
        conversation = Conversation(agent, "demo")
        conversation.history = [ModelResponse(parts=[TextPart("旧消息")])]
        await conversation.send("继续")
        self.assertIs(conversation.history, compacted)
        self.assertEqual(agent.run.call_args.kwargs["conversation_id"], "demo")
        with self.assertRaises(ValueError):
            await conversation.send(" \n")
        self.assertEqual(agent.run.await_count, 1)

    def test_request_error_redacts_keys(self):
        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key", "LOGFIRE_TOKEN": "test-token"}):
            message = error_message(RuntimeError("HTTP 400 test-key test-token"))
        self.assertIn("HTTP 400", message)
        self.assertNotIn("test-key", message)
        self.assertNotIn("test-token", message)
