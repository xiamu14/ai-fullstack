"""GAIA quasi-exact-match rules, kept separate from agent execution.

Source: https://huggingface.co/spaces/gaia-benchmark/leaderboard/blob/9f133d7/scorer.py
Numeric conversion, ordered lists and punctuation rules match that revision.
"""

import re
import string

from pydantic_evals.evaluators import Evaluator, EvaluatorContext


def is_number(value: str) -> bool:
    try:
        float(value)
    except ValueError:
        return False
    return True


def numeric_answer(value: str) -> float:
    try:
        return float(value.translate(str.maketrans("", "", "$%,")))
    except ValueError:
        return float("inf")


def normalize(value: str, *, punctuation: bool = True) -> str:
    value = "".join(value.split()).lower()
    return value.translate(str.maketrans("", "", string.punctuation)) if punctuation else value


def question_scorer(answer: str, expected: str) -> bool:
    if is_number(expected):
        return numeric_answer(answer) == float(expected)
    if "," in expected or ";" in expected:
        actual_items = re.split("[,;]", answer)
        expected_items = re.split("[,;]", expected)
        return len(actual_items) == len(expected_items) and all(
            numeric_answer(actual) == float(target) if is_number(target)
            else normalize(actual, punctuation=False) == normalize(target, punctuation=False)
            for actual, target in zip(actual_items, expected_items)
        )
    return normalize(answer) == normalize(expected)


class GaiaCorrect(Evaluator):
    def evaluate(self, ctx: EvaluatorContext) -> bool:
        if ctx.expected_output is None:
            raise ValueError("GAIA 本地评分需要验证集答案")
        return question_scorer(ctx.output, ctx.expected_output)
