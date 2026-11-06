"""Load a reviewed, versioned text-only GAIA subset; labels stay outside the agent."""

import argparse
import json
import mimetypes

from dotenv import load_dotenv
from pydantic_ai import BinaryContent
from pathlib import Path
from uuid import UUID

from huggingface_hub import hf_hub_download
import pyarrow.parquet as pq
from pydantic import BaseModel, Field
from pydantic_evals import Case

from evaluation.artifacts import BENCHMARK_DIR

DATASET = "gaia-benchmark/GAIA"
REVISION = "682dd723ee1e1697e00360edccf2366dc8418dd9"
SUBSET = json.loads(Path(__file__).with_name("gaia_text_subset.json").read_text())


class GaiaInput(BaseModel):
    task_id: UUID
    question: str = Field(min_length=1)


    attachment: str | None = None


ROOT = Path(__file__).resolve().parents[1]
CACHE = BENCHMARK_DIR / "cache"


def add_filters(parser):
    parser.add_argument("--subset", choices=("all", "text"), default="all")
    parser.add_argument("--level", type=int, choices=(1, 2, 3))
    parser.add_argument("--attachment", choices=("any", "with", "without"), default="any")
    parser.add_argument("--limit", type=int)


def select_cases(rows, limit=None, *, subset="all", level=None, attachment="any"):
    by_id = {row["task_id"]: row for row in rows}
    if len(by_id) != len(rows):
        raise ValueError("数据含重复 GAIA task_id")
    categories = {}
    if subset == "text":
        categories = {t["task_id"]: t["category"] for t in SUBSET["tasks"]}
        if len(categories) != len(SUBSET["tasks"]) or not categories.keys() <= by_id.keys():
            raise ValueError("固定题单含重复或缺失的 task_id")
    cases = []
    for identifier in categories or sorted(by_id):
        row = by_id[identifier]
        attached = bool(row.get("file_path") or row.get("file_name"))
        if subset == "text" and attached:
            raise ValueError("纯文本题单不能包含附件任务")
        if level and int(row["Level"]) != level:
            continue
        if attachment == "with" and not attached or attachment == "without" and attached:
            continue
        path = row.get("file_path") or (f"2023/validation/{row['file_name']}" if attached else None)
        if path and (Path(path).parent.as_posix() != "2023/validation" or ".." in Path(path).parts):
            raise ValueError("附件路径超出验证集目录")
        answer = row["Final answer"]
        if not isinstance(answer, str) or not answer.strip():
            raise ValueError("验证集答案缺失，不能评分")
        cases.append(Case(name=identifier, inputs=GaiaInput(task_id=identifier, question=row["Question"], attachment=path),
                          expected_output=answer, metadata={"level": int(row["Level"]), "category": categories.get(identifier)}))
    if not cases or limit is not None and not 1 <= limit <= len(cases):
        raise ValueError(f"筛选命中 {len(cases)} 题，请检查条件和 limit")
    return cases[:limit]


def load_cases(args):
    path = hf_hub_download(DATASET, "2023/validation/metadata.parquet",
                           repo_type="dataset", revision=REVISION, cache_dir=CACHE)
    return select_cases(pq.read_table(path).to_pylist(), args.limit, subset=args.subset,
                        level=args.level, attachment=args.attachment)


def prompt_for(inputs):
    if not inputs.attachment:
        return inputs.question
    path = Path(hf_hub_download(DATASET, inputs.attachment, repo_type="dataset", revision=REVISION, cache_dir=CACHE))
    if path.stat().st_size > 32 * 1024**2:
        raise ValueError("附件超过 32 MiB 输入预算")
    media = mimetypes.guess_type(inputs.attachment)[0] or "application/octet-stream"
    if media.startswith("text/"):
        return [inputs.question, path.read_text(encoding="utf-8-sig")]
    return [inputs.question, BinaryContent(data=path.read_bytes(), media_type=media, identifier=Path(inputs.attachment).name)]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="只读取固定 revision 的 GAIA 验证题单，不调用模型。")
    add_filters(parser)
    filters = parser.parse_args()
    load_dotenv(ROOT / ".env")
    selected = load_cases(filters)
    print(json.dumps({"dataset": DATASET, "revision": REVISION, "split": "validation", "filters": vars(filters),
                      "count": len(selected), "task_ids": [c.name for c in selected]}, indent=2))
