import os
import time
from typing import Optional

from app.models.schemas import WearableImportResponse

# 7a: configurable TTL (default 24 h) and max size (5000 entries)
_WEARABLE_TTL_SECONDS: int = int(os.getenv("WEARABLE_STATE_TTL_SECONDS", str(24 * 3600)))
_MAX_ENTRIES: int = 5000

# Keyed by user_id (str). Each user holds their own latest wearable data independently.
# Value is (data, inserted_at_epoch).
_latest_wearables: dict[str, tuple[WearableImportResponse, float]] = {}


def _evict() -> None:
    """7a: Remove expired entries; if still over limit, evict oldest by insert time."""
    now = time.time()
    expired = [uid for uid, (_, ts) in list(_latest_wearables.items()) if now - ts > _WEARABLE_TTL_SECONDS]
    for uid in expired:
        _latest_wearables.pop(uid, None)

    # Max-size guard: evict oldest entries until under limit
    if len(_latest_wearables) >= _MAX_ENTRIES:
        sorted_uids = sorted(_latest_wearables, key=lambda u: _latest_wearables[u][1])
        overflow = len(_latest_wearables) - _MAX_ENTRIES + 1
        for uid in sorted_uids[:overflow]:
            _latest_wearables.pop(uid, None)


def set_latest_wearable(user_id: str, data: WearableImportResponse) -> None:
    _evict()
    _latest_wearables[user_id] = (data, time.time())


def get_latest_wearable(user_id: str) -> Optional[WearableImportResponse]:
    entry = _latest_wearables.get(user_id)
    if entry is None:
        return None
    data, ts = entry
    # 7a: return None (treat as cache miss) if entry has expired
    if time.time() - ts > _WEARABLE_TTL_SECONDS:
        _latest_wearables.pop(user_id, None)
        return None
    return data
