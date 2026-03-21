from fastapi import APIRouter

from app.models.schemas import (
    PlanGenerateRequest,
    PlanGenerateResponse,
    ReplanRequest,
    ReplanResponse,
    TaskStatus,
)
from app.planner.rule_planner import RulePlanner
from app.risk_engine.engine import RiskEngine
from app.services.persistence import save_plan
from app.services.plan_state import get_active_plan, set_active_plan

router = APIRouter(prefix="/plans", tags=["Plans"])
risk_engine = RiskEngine()
planner = RulePlanner()


@router.post("/generate", response_model=PlanGenerateResponse)
def generate_plan(request: PlanGenerateRequest) -> PlanGenerateResponse:
    normalized = []
    for b in request.blocks:
        b.commute_before_minutes = b.commute_before_minutes or request.commute_minutes
        b.commute_after_minutes = b.commute_after_minutes or request.commute_minutes
        normalized.append(b)

    risk_result = risk_engine.compute(normalized)
    plan = planner.generate(risk_result, plan_hours=request.plan_hours)
    set_active_plan(plan)
    try:
        save_plan(request.user_id, plan)
    except Exception:
        pass
    return plan


@router.post("/replan", response_model=ReplanResponse)
def replan(request: ReplanRequest) -> ReplanResponse:
    normalized = []
    for b in request.blocks:
        b.commute_before_minutes = b.commute_before_minutes or request.commute_minutes
        b.commute_after_minutes = b.commute_after_minutes or request.commute_minutes
        normalized.append(b)

    risk_result = risk_engine.compute(normalized)
    new_plan = planner.generate(risk_result, plan_hours=24)
    old_plan = get_active_plan()
    what_changed = []

    if request.task_event:
        what_changed.append(
            f"Replan triggered by task event: {request.task_event.status.value} on {request.task_event.task_id}"
        )

    # Keep completed tasks from previous plan so we only update next actions.
    if old_plan:
        completed = [t for t in old_plan.tasks if t.status == TaskStatus.completed]
        if completed:
            cutoff = 3
            new_plan.tasks = completed + new_plan.tasks[:cutoff]
            new_plan.next_best_action = planner._next_best_action(
                [t for t in new_plan.tasks if t.status == TaskStatus.planned]
            )
            what_changed.append("Preserved completed tasks and replaced next 1-3 upcoming actions.")

    set_active_plan(new_plan)
    try:
        save_plan(request.user_id, new_plan)
    except Exception:
        pass
    return ReplanResponse(
        updated_plan=new_plan,
        changes_summary="Updated near-term actions based on latest signal.",
        what_changed=what_changed or ["Regenerated short-horizon plan from latest risks."],
        why_changed="Task completion/skips and risk context can change immediate recovery priorities.",
    )
