from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.models.schemas import DashboardTodayResponse, PlanTask
from app.services.db import get_supabase
from app.services.plan_state import get_active_plan
from app.services.wearable_state import get_latest_wearable

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/today", response_model=DashboardTodayResponse)
def get_today_dashboard(user_id: Optional[UUID] = None) -> DashboardTodayResponse:
    plan = get_active_plan()
    if not plan and user_id:
        try:
            db = get_supabase()
            plan_row = (
                db.table("plans")
                .select("*")
                .eq("user_id", str(user_id))
                .eq("is_active", True)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if plan_row.data:
                p = plan_row.data[0]
                return DashboardTodayResponse(
                    user_id=user_id,
                    plan_mode=p["plan_mode"],
                    next_best_action=p["next_best_action"],
                    anchor_tasks=[],
                    recovery_rhythm_label="unknown",
                    recovery_score=None,
                )
        except Exception:
            pass
    if not plan:
        raise HTTPException(status_code=404, detail="No active plan found. Generate a plan first.")

    wearable = get_latest_wearable()
    recovery_score = wearable.recovery_score if wearable else None
    recovery_label = _recovery_label(recovery_score)

    anchors: list[PlanTask] = [t for t in plan.tasks if t.anchor_flag]
    return DashboardTodayResponse(
        user_id=user_id,
        plan_mode=plan.plan_mode,
        next_best_action=plan.next_best_action,
        anchor_tasks=anchors,
        recovery_rhythm_label=recovery_label,
        recovery_score=recovery_score,
    )


def _recovery_label(score: float | None) -> str:
    if score is None:
        return "unknown"
    if score >= 70:
        return "steady"
    if score >= 40:
        return "rebuilding"
    return "interrupted"
