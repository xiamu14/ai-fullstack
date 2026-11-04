"""Deployment model metadata, passed to the framework's native model profile."""
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field, PositiveInt, ValidationError
from pydantic_ai.profiles import ModelProfile


class ModelConfig(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    context_window: PositiveInt


class ProviderConfig(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    models: dict[str, ModelConfig] = Field(default_factory=dict)


def model_profile(model_name: str) -> ModelProfile:
    path = Path(__file__).resolve().parents[1] / "provider.json"
    try:
        config = ProviderConfig.model_validate_json(path.read_text(encoding="utf-8"))
    except (ValidationError, UnicodeError) as exc:
        raise ValueError("provider.json 无效：context_window 必须是正整数，且不允许未知字段。") from exc
    model = config.models.get(model_name)
    return ModelProfile(context_window=model.context_window) if model else ModelProfile()
