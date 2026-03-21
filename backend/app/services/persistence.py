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


def save_schedule_blocks(
    user_id: Optional[UUID],
    blocks: list[ScheduleBlock],
    merge_mode: str = "replace",  # 8c: "replace" (default) or "merge"
) -> None:
    uid = ensure_user(user_id)
    db = get_supabase()
    if merge_mode == "replace":
        # Replace all existing blocks — prevents duplicate rows on re-import
        db.table("schedule_blocks").delete().eq("user_id", uid).execute()
    # In merge mode: upsert by id — new blocks added, existing blocks updated
    for b in blocks:
        row = {
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
        if merge_mode == "merge":
            db.table("schedule_blocks").upsert(row, on_conflict="id").execute()
        else:
            db.table("schedule_blocks").insert(row).execute()


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


def _reactivate_latest_plan(db, uid: str) -> None:
    """
    Compensating action: re-activate the most recently created plan for a user.
    Called when a deactivate+insert sequence fails mid-flight so the user is
    never left with zero active plans.

    Supabase does not support multi-statement transactions.  The safest
    sequential pattern is:
        1. Deactivate old active plans  (this function undoes step 1 on failure)
        2. Insert new plan (with is_active=True)
    If step 2 raises, we call this function to undo step 1, restoring
    the last known good state.
    """
    try:
        db.table("plans") \
            .update({"is_active": True}) \
            .eq("user_id", uid) \
            .eq("is_active", False) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
    except Exception:
        pass  # best-effort; dashboard DB fallback handles zero-active-plan case


def save_plan(user_id: Optional[UUID], plan: PlanGenerateResponse) -> None:
    uid = ensure_user(user_id)
    db = get_supabase()
    _now = datetime.now(timezone.utc).isoformat()

    # ── Compensating transaction pattern ──────────────────────────────────────
    # Supabase does not support atomic multi-statement transactions.
    # Strategy:
    #   Step 1 — Deactivate all existing active plans (may fail → non-fatal,
    #             we still insert so the user always ends up with an active plan).
    #   Step 2 — Insert the new plan.  If this fails AFTER step 1 succeeded, we
    #             call _reactivate_latest_plan() to undo step 1 so the user is
    #             never left with zero active plans.
    # Worst-case partial states:
    #   • Step 1 fails, Step 2 succeeds → two active plans; LIMIT 1 + ORDER BY
    #     created_at DESC on the read side always picks the newest → acceptable.
    #   • Step 1 succeeds, Step 2 fails → compensating re-activation restores
    #     the old plan → user still has a valid active plan.
    deactivate_succeeded = False
    try:
        db.table("plans").update({"is_active": False}).eq("user_id", uid).eq("is_active", True).execute()
        deactivate_succeeded = True
    except Exception:
        pass  # non-fatal — insert below will still create the new active plan

    try:
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
    except Exception:
        # Compensating action: if insert fails after deactivate succeeded,
        # re-activate the most recently deactivated plan so the user is
        # never left with zero active plans.
        if deactivate_succeeded:
            _reactivate_latest_plan(db, uid)
        raise


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


def persist_task_event(
    user_id: Optional[UUID],
    task_id: UUID,
    status: str,
    anchor_flag: bool,
    category: Optional[str] = None,
    notes: Optional[str] = None,
) -> None:
    """Write one row to task_events for longitudinal tracking."""
    uid = ensure_user(user_id)
    db = get_supabase()
    db.table("task_events").insert(
        {
            "user_id": uid,
            "task_id": str(task_id),
            "status": status,
            "anchor_flag": anchor_flag,
            "category": category,
            "notes": notes,
        }
    ).execute()


def upsert_outcome_memory(
    user_id: Optional[UUID],
    date_str: str,
    plan_mode: Optional[str],
    recovery_score: Optional[float],
    anchors_completed: int,
    anchors_total: int,
) -> None:
    """Upsert one row into outcome_memory for the given calendar date."""
    uid = ensure_user(user_id)
    db = get_supabase()
    db.table("outcome_memory").upsert(
        {
            "user_id": uid,
            "date": date_str,
            "plan_mode": plan_mode,
            "recovery_score": recovery_score,
            "anchors_completed": anchors_completed,
            "anchors_total": anchors_total,
        },
        on_conflict="user_id,date",
    ).execute()


def load_schedule_blocks(user_id: Optional[UUID]) -> list[ScheduleBlock]:
    """Load the most-recently saved schedule blocks for a user from Supabase."""
    uid = _uid(user_id)
    db = get_supabase()
    rows = (
        db.table("schedule_blocks")
        .select("id, block_type, title, start_time, end_time, commute_before_minutes, commute_after_minutes")
        .eq("user_id", uid)
        .order("start_time")
        .execute()
    )
    blocks = []
    for r in rows.data or []:
        blocks.append(
            ScheduleBlock(
                id=r["id"],
                block_type=r["block_type"],
                title=r.get("title"),
                start_time=r["start_time"],
                end_time=r["end_time"],
                commute_before_minutes=r.get("commute_before_minutes", 0),
                commute_after_minutes=r.get("commute_after_minutes", 0),
            )
        )
    return blocks


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
