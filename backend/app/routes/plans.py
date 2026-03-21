from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth import require_user
from app.models.schemas import (
    PlanGenerateRequest,
    PlanGenerateResponse,
    ReplanRequest,
    ReplanResponse,
    TaskStatus,
)
from app.planner.claude_planner import ClaudePlanner
from app.planner.rule_planner import RulePlanner
from app.routes.personas import get_persona
from app.risk_engine.engine import RiskEngine
from app.services.db import get_supabase
from app.services.persistence import save_plan
from app.services.plan_state import get_active_plan, set_active_plan
from app.services.rate_limiter import claude_limiter
from app.services.token_tracker import get_global_usage, get_recent_calls, get_user_usage

router = APIRouter(prefix="/plans", tags=["Plans"])
risk_engine = RiskEngine()
planner = RulePlanner()
claude_planner = ClaudePlanner()


def _compute_plan_diff(old: Optional[PlanGenerateResponse], new: PlanGenerateResponse) -> list[str]:
    """
    3e: Compute a human-readable list of what changed between the old and new plan.
    Returns ["New plan generated"] if no prior plan exists.
    """
    if not old:
        return ["New plan generated"]

    diff = []

    # Mode change
    if old.plan_mode != new.plan_mode:
        diff.append(f"Mode changed: {old.plan_mode} \u2192 {new.plan_mode}")

    # Category comparison
    old_cats = {t.category.value for t in old.tasks}
    new_cats = {t.category.value for t in new.tasks}
    added = new_cats - old_cats
    removed = old_cats - new_cats
    if added:
        diff.append(f"Added: {', '.join(sorted(added))}")
    if removed:
        diff.append(f"Removed: {', '.join(sorted(removed))}")

    # Task count change
    if len(old.tasks) != len(new.tasks):
        diff.append(f"Task count: {len(old.tasks)} \u2192 {len(new.tasks)}")

    if not diff:
        diff.append("Plan regenerated with same structure")

    return diff


@router.post("/generate", response_model=PlanGenerateResponse)
def generate_plan(request: PlanGenerateRequest, token_user_id: str = Depends(require_user)) -> PlanGenerateResponse:
    request.user_id = UUID(token_user_id)

    normalized = []
    for b in request.blocks:
        b.commute_before_minutes = b.commute_before_minutes or request.commute_minutes
        b.commute_after_minutes = b.commute_after_minutes or request.commute_minutes
        normalized.append(b)

    risk_result = risk_engine.compute(normalized)
    old_plan = get_active_plan(str(request.user_id))
    plan = planner.generate(risk_result, plan_hours=request.plan_hours)
    plan.plan_diff = _compute_plan_diff(old_plan, plan)
    set_active_plan(str(request.user_id), plan)
    save_plan(request.user_id, plan)
    return plan


@router.post("/generate-claude", response_model=PlanGenerateResponse)
def generate_plan_claude(request: PlanGenerateRequest, token_user_id: str = Depends(require_user)) -> PlanGenerateResponse:
    request.user_id = UUID(token_user_id)

    # Rate limit: 10 Claude calls per user per hour
    claude_limiter.check(str(request.user_id))

    normalized = []
    for b in request.blocks:
        b.commute_before_minutes = b.commute_before_minutes or request.commute_minutes
        b.commute_after_minutes = b.commute_after_minutes or request.commute_minutes
        normalized.append(b)

    risk_result = risk_engine.compute(normalized)
    persona = get_persona(request.persona_id) if request.persona_id else None
    old_plan = get_active_plan(str(request.user_id))
    try:
        plan = claude_planner.generate(
            risk_result,
            plan_hours=request.plan_hours,
            user_id=str(request.user_id),
            persona=persona,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Claude planner error: {str(e)}")

    plan.plan_diff = _compute_plan_diff(old_plan, plan)
    set_active_plan(str(request.user_id), plan)
    save_plan(request.user_id, plan)
    return plan


@router.post("/activate-latest")
def activate_latest_plan(user_id: UUID) -> dict:
    """
    Recovery endpoint: re-activates the most recent plan for a user.
    Use when a broken state leaves the user with zero active plans
    (e.g. plan insert failed after deactivate mid-flight).
    """
    uid = str(user_id)
    db = get_supabase()
    # First deactivate any stale active plans (safety)
    try:
        db.table("plans").update({"is_active": False}).eq("user_id", uid).eq("is_active", True).execute()
    except Exception:
        pass
    # Re-activate the most recently created plan
    result = (
        db.table("plans")
        .update({"is_active": True})
        .eq("user_id", uid)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="No plans found for this user. Generate a plan first.")
    return {"activated_plan_id": result.data[0]["id"], "detail": "Plan re-activated successfully."}


@router.get("/claude-usage", tags=["Plans"])
def claude_usage(user_id: str = None):
    """Check Claude API token usage and estimated cost."""
    return {
        "global": get_global_usage(),
        "user": get_user_usage(user_id) if user_id else None,
        "rate_limit": claude_limiter.status(user_id) if user_id else None,
        "recent_calls": get_recent_calls(limit=10),
    }


@router.post("/replan", response_model=ReplanResponse)
def replan(request: ReplanRequest, token_user_id: str = Depends(require_user)) -> ReplanResponse:
    request.user_id = UUID(token_user_id)

    normalized = []
    for b in request.blocks:
        b.commute_before_minutes = b.commute_before_minutes or request.commute_minutes
        b.commute_after_minutes = b.commute_after_minutes or request.commute_minutes
        normalized.append(b)

    risk_result = risk_engine.compute(normalized)
    what_changed = []
    used_claude = False

    if request.use_claude:
        claude_limiter.check(str(request.user_id))
        persona = get_persona(request.persona_id) if request.persona_id else None
        try:
            new_plan = claude_planner.generate(
                risk_result,
                plan_hours=24,
                user_id=str(request.user_id),
                persona=persona,
            )
            used_claude = True
            what_changed.append("Claude AI generated the updated near-term actions.")
        except HTTPException:
            raise
        except Exception:
            # Fall back to rule planner silently
            new_plan = planner.generate(risk_result, plan_hours=24)
            what_changed.append("Fell back to rule planner (Claude unavailable).")
    else:
        new_plan = planner.generate(risk_result, plan_hours=24)

    old_plan = get_active_plan(str(request.user_id))

    if request.task_event:
        what_changed.append(
            f"Replan triggered by task event: {request.task_event.status.value} on {request.task_event.task_id}"
        )

    # Preserve completed tasks — only replace next 1-3 upcoming actions
    if old_plan:
        completed = [t for t in old_plan.tasks if t.status == TaskStatus.completed]
        if completed:
            new_plan.tasks = completed + new_plan.tasks[:3]
            next_planned = [t for t in new_plan.tasks if t.status == TaskStatus.planned]
            nba_fn = claude_planner._parse_response if used_claude else None
            new_plan.next_best_action = planner._next_best_action(next_planned)
            what_changed.append("Preserved completed tasks and replaced next 1-3 upcoming actions.")

    new_plan.plan_diff = _compute_plan_diff(old_plan, new_plan)
    if new_plan.plan_diff:
        what_changed.extend(new_plan.plan_diff)
    set_active_plan(str(request.user_id), new_plan)
    save_plan(request.user_id, new_plan)
    return ReplanResponse(
        updated_plan=new_plan,
        changes_summary="Updated near-term actions based on latest signal.",
        what_changed=what_changed or ["Regenerated short-horizon plan from latest risks."],
        why_changed="Task completion/skips and risk context can change immediate recovery priorities.",
    )
