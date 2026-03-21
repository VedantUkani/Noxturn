from fastapi import APIRouter, HTTPException

from app.models.schemas import TaskEventCreate, TaskEventResponse, TaskStatus
from app.services.plan_state import get_active_plan, set_active_plan

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/event", response_model=TaskEventResponse)
def record_task_event(event: TaskEventCreate) -> TaskEventResponse:
    plan = get_active_plan()
    if not plan:
        raise HTTPException(status_code=404, detail="No active plan found. Generate a plan first.")

    task = next((t for t in plan.tasks if t.id == event.task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found in active plan.")

    old_status = task.status
    task.status = TaskStatus(event.status.value)
    trigger_replan = task.anchor_flag and task.status in {TaskStatus.skipped, TaskStatus.expired}

    # Refresh next best action to first planned task.
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
