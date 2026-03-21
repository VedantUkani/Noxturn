from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth import require_user
from app.models.schemas import WearableImportRequest, WearableImportResponse
from app.services.persistence import save_wearable
from app.services.wearable_state import set_latest_wearable

router = APIRouter(prefix="/wearables", tags=["Wearables"])


@router.post("/import", response_model=WearableImportResponse)
def import_wearable(payload: WearableImportRequest, token_user_id: str = Depends(require_user)) -> WearableImportResponse:
    payload.user_id = UUID(token_user_id)

    # Basic scoring heuristic for MVP:
    # sleep contributes most, then restlessness and resting_hr fine-tuning.
    sleep_score = min(100.0, max(0.0, (payload.sleep_hrs / 8.0) * 100.0))
    restlessness_penalty = (payload.restlessness or 0.0) * 0.6
    hr_penalty = max(0.0, ((payload.resting_hr or 60.0) - 60.0) * 0.8)
    recovery = max(0.0, min(100.0, sleep_score - restlessness_penalty - hr_penalty))

    result = WearableImportResponse(
        sleep_hrs=payload.sleep_hrs,
        sleep_start=payload.sleep_start,
        sleep_end=payload.sleep_end,
        restlessness=payload.restlessness,
        resting_hr=payload.resting_hr,
        recovery_score=round(recovery, 1),
        source="wearable_import",
    )
    set_latest_wearable(str(payload.user_id), result)
    save_wearable(payload.user_id, result)
    return result
