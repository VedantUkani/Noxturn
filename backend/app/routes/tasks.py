from fastapi import APIRouter, HTTPException

from app.models.schemas import TaskEventCreate, TaskEventResponse, TaskStatus
from app.services.persistence import get_task_from_db, update_plan_task_status
from app.services.plan_state import get_active_plan, set_active_plan

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/event", response_model=TaskEventResponse)
def record_task_event(event: TaskEventCreate) -> TaskEventResponse:
    if not event.user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    plan = get_active_plan()
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
        msg = "Event recorded (DB fallback — plan not in memory)."
        if trigger_replan:
            msg = "Anchor missed; replan recommended."
        return TaskEventResponse(
            task_id=event.task_id,
            old_status=old_status,
            new_status=new_status,
            trigger_replan=trigger_replan,
            message=msg,
        )

    # ── Happy path: plan is in memory ──────────────────────────────────────
    old_status = task.status
    task.status = TaskStatus(event.status.value)
    trigger_replan = task.anchor_flag and task.status in {TaskStatus.skipped, TaskStatus.expired}

    # Advance next_best_action to the next planned task
    planned = [t for t in plan.tasks if t.status == TaskStatus.planned]
    if planned:
        chosen = sorted(planned, key=lambda t: t.scheduled_time)[0]
        plan.next_best_action.task_id = chosen.id
        plan.next_best_action.category = chosen.category
        plan.next_best_action.title = chosen.title
        plan.next_best_action.description = chosen.description or chosen.title
        plan.next_best_action.why_now = chosen.source_reason or "This is your next scheduled action."
        plan.next_best_action.duration_minutes = chosen.duration_minutes

    set_active_plan(plan)
    update_plan_task_status(event.user_id, event.task_id, task.status.value)
    msg = "Event recorded."
    if trigger_replan:
        msg = "Anchor missed; replan recommended."
    return TaskEventResponse(
        task_id=event.task_id,
        old_status=old_status,
        new_status=task.status,
        trigger_replan=trigger_replan,
        message=msg,
    )
