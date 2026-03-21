from fastapi import APIRouter, HTTPException

from app.models.schemas import RiskComputeRequest, RiskComputeResponse
from app.risk_engine.engine import RiskEngine
from app.services.persistence import save_risk_episodes

router = APIRouter(prefix="/risks", tags=["Risks"])
engine = RiskEngine()


@router.post("/compute", response_model=RiskComputeResponse)
def compute_risks(request: RiskComputeRequest) -> RiskComputeResponse:
    if not request.user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    # If block commute values are empty, apply request default.
    normalized = []
    for b in request.blocks:
        b.commute_before_minutes = b.commute_before_minutes or request.commute_minutes
        b.commute_after_minutes = b.commute_after_minutes or request.commute_minutes
        normalized.append(b)
    result = engine.compute(normalized)
    save_risk_episodes(request.user_id, result)
    return result
