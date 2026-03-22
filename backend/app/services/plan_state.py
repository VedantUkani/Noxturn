import os
import time
from typing import Optional

from app.models.schemas import PlanGenerateResponse

# 7a: configurable TTL (default 24 h) and max size (5000 entries)
_PLAN_TTL_SECONDS: int = int(os.getenv("PLAN_STATE_TTL_SECONDS", str(24 * 3600)))
_MAX_ENTRIES: int = 5000

# Keyed by user_id (str). Each user holds their own active plan independently.
# Value is (plan, inserted_at_epoch).
_active_plans: dict[str, tuple[PlanGenerateResponse, float]] = {}


def _evict() -> None:
    """7a: Remove expired entries; if still over limit, evict oldest by insert time."""
    now = time.time()
    expired = [uid for uid, (_, ts) in list(_active_plans.items()) if now - ts > _PLAN_TTL_SECONDS]
    for uid in expired:
        _active_plans.pop(uid, None)

    # Max-size guard: evict oldest entries until under limit
    if len(_active_plans) >= _MAX_ENTRIES:
        sorted_uids = sorted(_active_plans, key=lambda u: _active_plans[u][1])
        overflow = len(_active_plans) - _MAX_ENTRIES + 1  # +1 to make room for the new entry
        for uid in sorted_uids[:overflow]:
            _active_plans.pop(uid, None)


def set_active_plan(user_id: str, plan: PlanGenerateResponse) -> None:
    _evict()
    _active_plans[user_id] = (plan, time.time())


def get_active_plan(user_id: str) -> Optional[PlanGenerateResponse]:
    entry = _active_plans.get(user_id)
    if entry is None:
        return None
    plan, ts = entry
    # 7a: return None (treat as cache miss) if entry has expired
    if time.time() - ts > _PLAN_TTL_SECONDS:
        _active_plans.pop(user_id, None)
        return None
    return plan
