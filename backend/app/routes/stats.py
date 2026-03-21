from fastapi import APIRouter, Depends, HTTPException, Query

from app.middleware.auth import require_user
from app.models.schemas import (
    RecoveryConsistencyResponse,
    StreakResponse,
    WeeklySummaryResponse,
)
from app.services.stats import (
    compute_recovery_consistency,
    compute_streaks,
    compute_weekly_summary,
)

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/streaks", response_model=StreakResponse)
def get_streaks(
    timezone: str = Query("UTC"),
    user_id: str = Depends(require_user),
) -> StreakResponse:
    data = compute_streaks(user_id, timezone)  # 6c: timezone-aware streaks
    return StreakResponse(user_id=user_id, **data)


@router.get("/weekly-summary", response_model=WeeklySummaryResponse)
def get_weekly_summary(
    timezone: str = Query("UTC"),
    user_id: str = Depends(require_user),
) -> WeeklySummaryResponse:
    data = compute_weekly_summary(user_id, timezone)  # 6c: timezone-aware week boundaries
    return WeeklySummaryResponse(user_id=user_id, **data)


@router.get("/recovery-consistency", response_model=RecoveryConsistencyResponse)
def get_recovery_consistency(period_days: int = 7, user_id: str = Depends(require_user)) -> RecoveryConsistencyResponse:
    if period_days < 1 or period_days > 90:
        raise HTTPException(status_code=400, detail="period_days must be between 1 and 90")
    data = compute_recovery_consistency(user_id, period_days)
    return RecoveryConsistencyResponse(user_id=user_id, **data)
