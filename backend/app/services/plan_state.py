from typing import Optional

from app.models.schemas import PlanGenerateResponse

_active_plan: Optional[PlanGenerateResponse] = None


def set_active_plan(plan: PlanGenerateResponse) -> None:
    global _active_plan
    _active_plan = plan


def get_active_plan() -> Optional[PlanGenerateResponse]:
    return _active_plan
