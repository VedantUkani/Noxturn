from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth import require_user
from app.models.schemas import RiskComputeRequest, RiskComputeResponse
from app.risk_engine.engine import RiskEngine
from app.services.persistence import save_risk_episodes

router = APIRouter(prefix="/risks", tags=["Risks"])
engine = RiskEngine()


@router.post("/compute", response_model=RiskComputeResponse)
def compute_risks(request: RiskComputeRequest, token_user_id: str = Depends(require_user)) -> RiskComputeResponse:
    # user_id is authoritative from the JWT — ignore any user_id in the request body
    request.user_id = UUID(token_user_id)

    # If block commute values are empty, apply request default.
    normalized = []
    for b in request.blocks:
        b.commute_before_minutes = b.commute_before_minutes or request.commute_minutes
        b.commute_after_minutes = b.commute_after_minutes or request.commute_minutes
        normalized.append(b)
    result = engine.compute(normalized, risk_profile=request.risk_profile)
    save_risk_episodes(request.user_id, result)
    return result
