from typing import Optional
from uuid import UUID

from app.models.schemas import PlanGenerateResponse, RiskComputeResponse, ScheduleBlock, WearableImportResponse
from app.services.db import get_supabase

DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


def _uid(user_id: Optional[UUID]) -> str:
    return str(user_id) if user_id else DEFAULT_USER_ID


def ensure_user(user_id: Optional[UUID]) -> str:
    uid = _uid(user_id)
    db = get_supabase()
    existing = db.table("users").select("id").eq("id", uid).execute()
    if not existing.data:
        db.table("users").insert(
            {
                "id": uid,
                "name": "Demo User",
                "email": "demo@noxturn.local",
                "role": "nurse",
                "commute_minutes": 45,
                "timezone": "America/Phoenix",
            }
        ).execute()
    return uid


def save_schedule_blocks(user_id: Optional[UUID], blocks: list[ScheduleBlock]) -> None:
    uid = ensure_user(user_id)
    db = get_supabase()
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
    plan_row = db.table("plans").insert(
        {
            "user_id": uid,
            "plan_mode": plan.plan_mode,
            "plan_start": min(t.scheduled_time for t in plan.tasks).isoformat() if plan.tasks else None,
            "plan_end": max(t.scheduled_time for t in plan.tasks).isoformat() if plan.tasks else None,
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
    db.table("wearable_summaries").insert(
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
        }
    ).execute()
