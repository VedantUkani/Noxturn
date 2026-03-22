from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth import require_user
from app.models.schemas import TaskEventCreate, TaskEventResponse, TaskStatus
from app.planner.rule_planner import RulePlanner
from app.risk_engine.engine import RiskEngine
from app.services.persistence import (
    get_task_from_db,
    load_schedule_blocks,
    persist_task_event,
    save_plan,
    update_plan_task_status,
)
from app.services.plan_state import get_active_plan, set_active_plan
from app.services.stats import refresh_outcome_memory
from app.services.wearable_state import get_latest_wearable

router = APIRouter(prefix="/tasks", tags=["Tasks"])

_risk_engine = RiskEngine()
_rule_planner = RulePlanner()


def _auto_replan(user_id_str: str):
    """
    Run RiskEngine + RulePlanner from the user's saved schedule blocks.
    Returns the new PlanGenerateResponse, or None if no blocks are saved yet.
    """
    from uuid import UUID
    try:
        uid = UUID(user_id_str)
    except ValueError:
        return None

    blocks = load_schedule_blocks(uid)
    if not blocks:
        return None

    risk_result = _risk_engine.compute(blocks)
    return _rule_planner.generate(risk_result, plan_hours=24)


@router.post("/event", response_model=TaskEventResponse)
def record_task_event(event: TaskEventCreate, token_user_id: str = Depends(require_user)) -> TaskEventResponse:
    event.user_id = UUID(token_user_id)
    user_id_str = token_user_id
    plan = get_active_plan(user_id_str)
    task = next((t for t in plan.tasks if t.id == event.task_id), None) if plan else None

    # ── Fallback: plan wiped from memory (server restart) ──────────────────
    # Load just the one task row from Supabase and handle the event without
    # requiring the full plan to be in memory.
    if task is None:
        db_row = get_task_from_db(event.user_id, event.task_id)
        if not db_row:
            raise HTTPException(
                status_code=404,
                detail="Task not found. Either the task_id is wrong or no plan has been generated yet.",
            )
        old_status = TaskStatus(db_row["status"])
        new_status = TaskStatus(event.status.value)
        trigger_replan = db_row["anchor_flag"] and new_status in {TaskStatus.skipped, TaskStatus.expired}
        update_plan_task_status(event.user_id, event.task_id, new_status.value)
        persist_task_event(
            event.user_id, event.task_id, new_status.value,
            anchor_flag=bool(db_row["anchor_flag"]),
            category=db_row.get("category"),
            notes=event.notes,
        )

        updated_plan = None
        if trigger_replan:
            updated_plan = _auto_replan(user_id_str)
            if updated_plan:
                set_active_plan(user_id_str, updated_plan)
                save_plan(event.user_id, updated_plan)

        # Refresh today's outcome_memory row (best-effort — don't block the response)
        try:
            wearable = get_latest_wearable(user_id_str)
            active_plan = get_active_plan(user_id_str)
            refresh_outcome_memory(
                user_id_str,
                plan_mode=active_plan.plan_mode if active_plan else None,
                recovery_score=wearable.recovery_score if wearable else None,
            )
        except Exception:
            pass

        msg = "Anchor missed; replan executed." if (trigger_replan and updated_plan) \
            else "Anchor missed; replan recommended." if trigger_replan \
            else "Event recorded (DB fallback — plan not in memory)."

        return TaskEventResponse(
            task_id=event.task_id,
            old_status=old_status,
            new_status=new_status,
            trigger_replan=trigger_replan,
            message=msg,
            updated_plan=updated_plan,
        )

    # ── Happy path: plan is in memory ──────────────────────────────────────
    old_status = task.status
    task.status = TaskStatus(event.status.value)
    trigger_replan = task.anchor_flag and task.status in {TaskStatus.skipped, TaskStatus.expired}

    updated_plan = None
    if trigger_replan:
        # Auto-replan: rebuild from saved schedule blocks
        updated_plan = _auto_replan(user_id_str)
        if updated_plan:
            # Preserve already-completed tasks from the current plan
            completed = [t for t in plan.tasks if t.status == TaskStatus.completed]
            if completed:
                updated_plan.tasks = completed + updated_plan.tasks[:3]
            set_active_plan(user_id_str, updated_plan)
            save_plan(event.user_id, updated_plan)
    else:
        # Not a replan trigger — just advance next_best_action pointer
        planned = [t for t in plan.tasks if t.status == TaskStatus.planned]
        if planned:
            chosen = sorted(planned, key=lambda t: t.scheduled_time)[0]
            plan.next_best_action.task_id = chosen.id
            plan.next_best_action.category = chosen.category
            plan.next_best_action.title = chosen.title
            plan.next_best_action.description = chosen.description or chosen.title
            plan.next_best_action.why_now = chosen.source_reason or "This is your next scheduled action."
            plan.next_best_action.duration_minutes = chosen.duration_minutes
        set_active_plan(user_id_str, plan)

    update_plan_task_status(event.user_id, event.task_id, task.status.value)
    persist_task_event(
        event.user_id, event.task_id, task.status.value,
        anchor_flag=task.anchor_flag,
        category=task.category.value,
        notes=event.notes,
    )

    # Refresh today's outcome_memory row (best-effort — don't block the response)
    try:
        wearable = get_latest_wearable(user_id_str)
        active = updated_plan or get_active_plan(user_id_str)
        refresh_outcome_memory(
            user_id_str,
            plan_mode=active.plan_mode if active else None,
            recovery_score=wearable.recovery_score if wearable else None,
        )
    except Exception:
        pass

    msg = "Anchor missed; replan executed." if (trigger_replan and updated_plan) \
        else "Anchor missed; replan recommended (no saved blocks to replan from)." if trigger_replan \
        else "Event recorded."

    return TaskEventResponse(
        task_id=event.task_id,
        old_status=old_status,
        new_status=task.status,
        trigger_replan=trigger_replan,
        message=msg,
        updated_plan=updated_plan,
    )
