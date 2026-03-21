from datetime import datetime
from typing import List
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    ScheduleBlock,
    ScheduleImportRequest,
    ScheduleImportResponse,
)
from app.services.persistence import save_schedule_blocks
from app.services.schedule_change_detector import detect_changes

router = APIRouter(prefix="/schedule", tags=["Schedule"])


@router.post("/import", response_model=ScheduleImportResponse)
def import_schedule(request: ScheduleImportRequest) -> ScheduleImportResponse:
    if not request.user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    warnings: List[str] = []

    if request.blocks:
        normalized = [_normalize_block(b, request.commute_minutes) for b in request.blocks]
        report = detect_changes(request.user_id, normalized)
        save_schedule_blocks(request.user_id, normalized)
        return ScheduleImportResponse(blocks=normalized, warnings=warnings, parse_confidence=1.0,
            replan_recommended=report.replan_recommended, change_summary=report.changes)

    if request.raw_text:
        # Minimal parser placeholder. Team can replace with Claude parser.
        # Expected format (one per line):
        # night_shift,2026-03-21T19:00:00,2026-03-22T07:00:00,ICU Night
        blocks = []
        for idx, line in enumerate(request.raw_text.splitlines(), start=1):
            line = line.strip()
            if not line:
                continue
            parts = [p.strip() for p in line.split(",")]
            if len(parts) < 3:
                warnings.append(f"Line {idx}: expected at least 3 comma-separated fields")
                continue
            try:
                block = ScheduleBlock(
                    id=uuid4(),
                    block_type=parts[0],
                    start_time=datetime.fromisoformat(parts[1]),
                    end_time=datetime.fromisoformat(parts[2]),
                    title=parts[3] if len(parts) > 3 else None,
                )
                blocks.append(_normalize_block(block, request.commute_minutes))
            except Exception:
                warnings.append(f"Line {idx}: could not parse datetime or block_type")
        if not blocks:
            raise HTTPException(status_code=400, detail="No valid schedule blocks parsed")
        confidence = 0.8 if warnings else 0.95
        report = detect_changes(request.user_id, blocks)
        save_schedule_blocks(request.user_id, blocks)
        return ScheduleImportResponse(blocks=blocks, warnings=warnings, parse_confidence=confidence,
            replan_recommended=report.replan_recommended, change_summary=report.changes)

    raise HTTPException(status_code=400, detail="Provide either blocks or raw_text")


def _normalize_block(block: ScheduleBlock, default_commute: int) -> ScheduleBlock:
    duration_hours = (block.end_time - block.start_time).total_seconds() / 3600
    return ScheduleBlock(
        id=block.id,
        block_type=block.block_type,
        title=block.title,
        start_time=block.start_time,
        end_time=block.end_time,
        duration_hours=round(duration_hours, 2),
        commute_before_minutes=block.commute_before_minutes or default_commute,
        commute_after_minutes=block.commute_after_minutes or default_commute,
    )
