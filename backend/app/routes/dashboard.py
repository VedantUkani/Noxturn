from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth import require_user
from app.models.schemas import DashboardTodayResponse, PlanTask, TaskCategory, TaskStatus
from app.services.db import get_supabase
from app.services.plan_state import get_active_plan
from app.services.wearable_state import get_latest_wearable

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/today", response_model=DashboardTodayResponse)
def get_today_dashboard(token_user_id: str = Depends(require_user)) -> DashboardTodayResponse:
    user_id = UUID(token_user_id)
    plan = get_active_plan(token_user_id)

    # ── DB fallback: server restarted, rebuild from Supabase ─────────────────
    if not plan:
        try:
            db = get_supabase()
            uid = str(user_id)

            # Latest active plan row
            plan_row = (
                db.table("plans")
                .select("id, plan_mode, next_best_action")
                .eq("user_id", uid)
                .eq("is_active", True)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if not plan_row.data:
                raise HTTPException(status_code=404, detail="No active plan found. Generate a plan first.")

            p = plan_row.data[0]
            plan_id = p["id"]

            # Anchor tasks from plan_tasks table
            task_rows = (
                db.table("plan_tasks")
                .select("id, category, title, description, scheduled_time, duration_minutes, anchor_flag, optional_flag, source_reason, evidence_ref, status, sort_order")
                .eq("plan_id", plan_id)
                .eq("anchor_flag", True)
                .neq("status", "completed")
                .order("sort_order")
                .execute()
            )
            anchor_tasks = [_row_to_plan_task(r) for r in (task_rows.data or [])]

            # Latest wearable recovery score from DB
            wear_row = (
                db.table("wearable_summaries")
                .select("raw_data, restlessness_score, resting_hr, sleep_duration_hours")
                .eq("user_id", uid)
                .order("date", desc=True)
                .limit(1)
                .execute()
            )
            recovery_score = None
            if wear_row.data:
                raw = wear_row.data[0].get("raw_data") or {}
                recovery_score = raw.get("recovery_score")

            return DashboardTodayResponse(
                user_id=user_id,
                plan_mode=p["plan_mode"],
                next_best_action=p["next_best_action"],
                anchor_tasks=anchor_tasks,
                recovery_rhythm_label=_recovery_label(recovery_score),
                recovery_score=recovery_score,
                data_source="db_fallback",  # 7b
            )
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=404, detail="No active plan found. Generate a plan first.")

    if not plan:
        raise HTTPException(status_code=404, detail="No active plan found. Generate a plan first.")

    # ── Happy path: plan is in memory ────────────────────────────────────────
    wearable = get_latest_wearable(token_user_id)
    recovery_score = wearable.recovery_score if wearable else None
    anchors = [t for t in plan.tasks if t.anchor_flag]

    return DashboardTodayResponse(
        user_id=user_id,
        plan_mode=plan.plan_mode,
        next_best_action=plan.next_best_action,
        anchor_tasks=anchors,
        recovery_rhythm_label=_recovery_label(recovery_score),
        recovery_score=recovery_score,
    )


def _row_to_plan_task(row: dict) -> PlanTask:
    return PlanTask(
        id=row["id"],
        category=TaskCategory(row["category"]),
        title=row["title"],
        description=row.get("description"),
        scheduled_time=datetime.fromisoformat(row["scheduled_time"]),
        duration_minutes=row["duration_minutes"],
        anchor_flag=row["anchor_flag"],
        optional_flag=row.get("optional_flag", False),
        source_reason=row.get("source_reason"),
        evidence_ref=row.get("evidence_ref"),
        status=TaskStatus(row.get("status", "planned")),
        sort_order=row.get("sort_order", 0),
    )


def _recovery_label(score: float | None) -> str:
    if score is None:
        return "unknown"
    if score >= 70:
        return "steady"
    if score >= 40:
        return "rebuilding"
    return "interrupted"
