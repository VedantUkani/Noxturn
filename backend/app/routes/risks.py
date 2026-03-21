from fastapi import APIRouter

from app.models.schemas import RiskComputeRequest, RiskComputeResponse
from app.personas.mock_nurse import get_mock_nurse_blocks
from app.risk_engine.engine import RiskEngine
from app.services.persistence import save_risk_episodes

router = APIRouter(prefix="/risks", tags=["Risks"])
engine = RiskEngine()


@router.post("/compute", response_model=RiskComputeResponse)
def compute_risks(request: RiskComputeRequest) -> RiskComputeResponse:
    # If block commute values are empty, apply request default.
    normalized = []
    for b in request.blocks:
        b.commute_before_minutes = b.commute_before_minutes or request.commute_minutes
        b.commute_after_minutes = b.commute_after_minutes or request.commute_minutes
        normalized.append(b)
    result = engine.compute(normalized)
    try:
        save_risk_episodes(request.user_id, result)
    except Exception:
        pass
    return result


@router.get("/compute/mock-nurse", response_model=RiskComputeResponse)
def compute_mock_nurse_risks() -> RiskComputeResponse:
    blocks = get_mock_nurse_blocks()
    return engine.compute(blocks)
