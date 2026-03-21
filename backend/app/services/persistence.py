from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from app.models.schemas import PlanGenerateResponse, RiskComputeResponse, ScheduleBlock, WearableImportResponse
from app.services.db import get_supabase

def _uid(user_id: Optional[UUID]) -> str:
    if not user_id:
        raise ValueError("user_id is required for persistence operations.")
    return str(user_id)


def ensure_user(user_id: Optional[UUID]) -> str:
    uid = _uid(user_id)
    db = get_supabase()
    existing = db.table("users").select("id").eq("id", uid).execute()
    if not existing.data:
        db.table("users").insert(
            {
                "id": uid,
                "name": f"User-{uid[:8]}",
                "email": None,
                "role": "nurse",
                "commute_minutes": 45,
                "timezone": "America/Phoenix",
            }
        ).execute()
    return uid


def save_schedule_blocks(user_id: Optional[UUID], blocks: list[ScheduleBlock]) -> None:
    uid = ensure_user(user_id)
    db = get_supabase()
    # Replace existing blocks — prevents duplicate rows on re-import
    db.table("schedule_blocks").delete().eq("user_id", uid).execute()
    for b in blocks:
        db.table("schedule_blocks").insert(
            {
                "id": str(b.id),
                "user_id": uid,
                "block_type": b.block_type.value,
                "title": b.title,
                "start_time": b.start_time.isoformat(),
                "end_time": b.end_time.isoformat(),
                "commute_before_minutes": b.commute_before_minutes,
                "commute_after_minutes": b.commute_after_minutes,
                "source": "api_import",
            }
        ).execute()


def save_risk_episodes(user_id: Optional[UUID], risk: RiskComputeResponse) -> None:
    uid = ensure_user(user_id)
    db = get_supabase()
    for ep in risk.risk_episodes:
        db.table("risk_episodes").insert(
            {
                "id": str(ep.id),
                "user_id": uid,
                "label": ep.label.value,
                "severity": ep.severity.value,
                "severity_score": ep.severity_score,
                "start_time": ep.start_time.isoformat(),
                "end_time": ep.end_time.isoformat(),
                "explanation_json": ep.explanation,
                "contributing_features": ep.contributing_features,
                "suggested_interventions": ep.suggested_interventions,
            }
        ).execute()


def save_plan(user_id: Optional[UUID], plan: PlanGenerateResponse) -> None:
    uid = ensure_user(user_id)
    db = get_supabase()
    _now = datetime.now(timezone.utc).isoformat()
    plan_row = db.table("plans").insert(
        {
            "user_id": uid,
            "plan_mode": plan.plan_mode,
            "plan_start": min(t.scheduled_time for t in plan.tasks).isoformat() if plan.tasks else _now,
            "plan_end": max(t.scheduled_time for t in plan.tasks).isoformat() if plan.tasks else _now,
            "circadian_strain_score": plan.risk_summary.get("circadian_strain_score", 0),
            "risk_summary": plan.risk_summary,
            "next_best_action": plan.next_best_action.model_dump(mode="json"),
            "is_active": True,
        }
    ).execute()
    plan_id = plan_row.data[0]["id"] if plan_row.data else None
    if not plan_id:
        return
    for t in plan.tasks:
        db.table("plan_tasks").insert(
            {
                "id": str(t.id),
                "plan_id": plan_id,
                "user_id": uid,
                "category": t.category.value,
                "title": t.title,
                "description": t.description,
                "scheduled_time": t.scheduled_time.isoformat(),
                "duration_minutes": t.duration_minutes,
                "anchor_flag": t.anchor_flag,
                "optional_flag": t.optional_flag,
                "source_reason": t.source_reason,
                "evidence_ref": t.evidence_ref,
                "status": t.status.value,
                "sort_order": t.sort_order,
            }
        ).execute()


def save_wearable(user_id: Optional[UUID], wearable: WearableImportResponse) -> None:
    uid = ensure_user(user_id)
    db = get_supabase()
    db.table("wearable_summaries").upsert(
        {
            "user_id": uid,
            "date": wearable.sleep_start.date().isoformat(),
            "sleep_duration_hours": wearable.sleep_hrs,
            "sleep_start": wearable.sleep_start.isoformat(),
            "sleep_end": wearable.sleep_end.isoformat(),
            "restlessness_score": wearable.restlessness,
            "resting_hr": wearable.resting_hr,
            "source": wearable.source,
            "raw_data": {"recovery_score": wearable.recovery_score},
        },
        on_conflict="user_id,date",
    ).execute()


def update_plan_task_status(user_id: Optional[UUID], task_id: UUID, status: str) -> None:
    uid = ensure_user(user_id)
    db = get_supabase()
    db.table("plan_tasks").update({"status": status}).eq("user_id", uid).eq("id", str(task_id)).execute()


def get_task_from_db(user_id: Optional[UUID], task_id: UUID) -> Optional[dict]:
    """
    Fetch a single plan_task row from Supabase.
    Returns None if not found. Used as fallback when in-memory plan is missing.
    """
    uid = _uid(user_id)
    db = get_supabase()
    res = (
        db.table("plan_tasks")
        .select("id, category, title, description, anchor_flag, status, source_reason, duration_minutes")
        .eq("user_id", uid)
        .eq("id", str(task_id))
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None
