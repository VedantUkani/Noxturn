from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List

# Approximate cost per 1M tokens (claude-haiku-4-5 pricing)
_COST_PER_1M_INPUT = 0.80   # USD
_COST_PER_1M_OUTPUT = 4.00  # USD


class TokenRecord:
    __slots__ = ("user_id", "input_tokens", "output_tokens", "model", "timestamp")

    def __init__(self, user_id: str, input_tokens: int, output_tokens: int, model: str):
        self.user_id = user_id
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens
        self.model = model
        self.timestamp = datetime.now(timezone.utc).isoformat()


_records: List[TokenRecord] = []
_by_user: Dict[str, dict] = defaultdict(
    lambda: {"calls": 0, "input_tokens": 0, "output_tokens": 0}
)


def record(user_id: str, input_tokens: int, output_tokens: int, model: str) -> None:
    _records.append(TokenRecord(user_id, input_tokens, output_tokens, model))
    agg = _by_user[user_id]
    agg["calls"] += 1
    agg["input_tokens"] += input_tokens
    agg["output_tokens"] += output_tokens


def _cost(input_tokens: int, output_tokens: int) -> float:
    return round(
        (input_tokens / 1_000_000) * _COST_PER_1M_INPUT
        + (output_tokens / 1_000_000) * _COST_PER_1M_OUTPUT,
        6,
    )


def get_user_usage(user_id: str) -> dict:
    agg = _by_user.get(user_id, {"calls": 0, "input_tokens": 0, "output_tokens": 0})
    return {
        **agg,
        "est_cost_usd": _cost(agg["input_tokens"], agg["output_tokens"]),
    }


def get_global_usage() -> dict:
    total_in = sum(r.input_tokens for r in _records)
    total_out = sum(r.output_tokens for r in _records)
    return {
        "total_calls": len(_records),
        "total_input_tokens": total_in,
        "total_output_tokens": total_out,
        "est_cost_usd": _cost(total_in, total_out),
        "users": len(_by_user),
    }


def get_recent_calls(limit: int = 20) -> list:
    return [
        {
            "user_id": r.user_id,
            "input_tokens": r.input_tokens,
            "output_tokens": r.output_tokens,
            "model": r.model,
            "timestamp": r.timestamp,
            "est_cost_usd": _cost(r.input_tokens, r.output_tokens),
        }
        for r in reversed(_records[-limit:])
    ]
