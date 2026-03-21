from fastapi import APIRouter

from app.models.schemas import ShiftSandboxRequest, ShiftSandboxResponse
from app.risk_engine.engine import RiskEngine

router = APIRouter(prefix="/simulate", tags=["Sandbox"])
engine = RiskEngine()


@router.post("/shift-sandbox", response_model=ShiftSandboxResponse)
def shift_sandbox(request: ShiftSandboxRequest) -> ShiftSandboxResponse:
    current = _normalize_commute(request.current_blocks, request.commute_minutes)
    original = engine.compute(current)

    projected_blocks = list(current)
    if request.remove_shift_ids:
        remove_set = {str(rid) for rid in request.remove_shift_ids}
        projected_blocks = [b for b in projected_blocks if str(b.id) not in remove_set]

    projected_blocks.extend(_normalize_commute(request.hypothetical_shifts, request.commute_minutes))
    projected = engine.compute(projected_blocks)

    delta = round(projected.circadian_strain_score - original.circadian_strain_score, 1)
    bottleneck = _find_bottleneck(projected)
    verdict = _verdict(delta, projected.circadian_strain_score)
    explanation = (
        f"Original strain {original.circadian_strain_score}, projected {projected.circadian_strain_score} "
        f"({delta:+}). Bottleneck: {bottleneck.get('type', 'none')}."
    )

    return ShiftSandboxResponse(
        original_strain_score=original.circadian_strain_score,
        projected_strain_score=projected.circadian_strain_score,
        strain_delta=delta,
        recovery_bottleneck=bottleneck,
        verdict=verdict,
        explanation=explanation,
    )


def _normalize_commute(blocks, default_minutes):
    out = []
    for b in blocks:
        b.commute_before_minutes = b.commute_before_minutes or default_minutes
        b.commute_after_minutes = b.commute_after_minutes or default_minutes
        out.append(b)
    return out


def _find_bottleneck(projected):
    if not projected.risk_episodes:
        return {"type": "none", "message": "No major bottleneck detected."}
    worst = max(projected.risk_episodes, key=lambda e: e.severity_score)
    return {
        "type": worst.label.value,
        "severity": worst.severity.value,
        "score": worst.severity_score,
        "window_start": worst.start_time.isoformat(),
        "window_end": worst.end_time.isoformat(),
        "message": worst.explanation.get("message", "Highest-severity projected risk."),
    }


def _verdict(delta: float, projected_score: float) -> str:
    if projected_score >= 80 or delta >= 20:
        return "dangerous"
    if projected_score >= 55 or delta >= 10:
        return "risky"
    return "manageable"
