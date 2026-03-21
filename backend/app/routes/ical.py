"""
Schedule import — Feature 2: iCal / .ics file upload.

Most hospital and shift-scheduling systems (HotSchedules, Kronos, NurseGrid,
AMiON, When I Work) can export schedules as .ics files, which is the universal
calendar format used by Google Calendar, Outlook, and Apple Calendar.

How it works:
  1. Parse the .ics file using the `icalendar` library
  2. Extract VEVENT components (each event = one shift)
  3. Map event SUMMARY / DESCRIPTION keywords to block_type
  4. Convert DTSTART / DTEND to our datetime format
  5. Save to Supabase via save_schedule_blocks()

Block type detection (from event SUMMARY, case-insensitive):
  Contains "night"                    → night_shift
  Contains "day" or "morning"        → day_shift
  Contains "eve" or "afternoon"      → evening_shift
  Contains "off" or "rest" or "leave"→ off_day
  Contains "transition" or "orient"  → transition_day
  Default (unrecognized)             → day_shift  +  warning added
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.schemas import ScheduleBlock, ScheduleImportResponse
from app.services.persistence import save_schedule_blocks
from app.services.schedule_change_detector import detect_changes

router = APIRouter(prefix="/schedule", tags=["Schedule"])


# ── Block type inference ──────────────────────────────────────────────────────

_KEYWORD_MAP = [
    (["night"],                                              "night_shift"),
    (["off", "rest", "leave", "rdo", "holiday", "vacation"], "off_day"),       # before "day"
    (["transition", "orient", "train", "induction"],         "transition_day"),
    (["eve", "afternoon", "pm shift"],                       "evening_shift"),
    (["day", "morning", "am shift"],                         "day_shift"),
]


def _infer_block_type(summary: str, description: str = "") -> tuple[str, bool]:
    """
    Returns (block_type, is_guessed).
    is_guessed=True when we fell back to day_shift as default.
    """
    text = f"{summary} {description}".lower()
    for keywords, block_type in _KEYWORD_MAP:
        if any(kw in text for kw in keywords):
            return block_type, False
    return "day_shift", True  # default with warning


def _to_utc_datetime(dt_value) -> Optional[datetime]:
    """Convert icalendar DTSTART/DTEND value to a timezone-naive datetime."""
    if dt_value is None:
        return None
    dt = dt_value.dt
    # All-day event → date object, not datetime
    if not isinstance(dt, datetime):
        dt = datetime(dt.year, dt.month, dt.day, 8, 0, 0)
    # Strip timezone info for our schema (stored as naive ISO strings)
    if hasattr(dt, "tzinfo") and dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


# ── Parser ────────────────────────────────────────────────────────────────────

def _parse_ical(content: bytes, commute_minutes: int) -> tuple[List[ScheduleBlock], List[str]]:
    try:
        from icalendar import Calendar
    except ImportError:
        raise HTTPException(status_code=500, detail="icalendar package not installed. Run: pip install icalendar")

    try:
        cal = Calendar.from_ical(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse .ics file: {e}")

    blocks: List[ScheduleBlock] = []
    warnings: List[str] = []
    event_num = 0

    for component in cal.walk():
        if component.name != "VEVENT":
            continue
        event_num += 1

        summary     = str(component.get("SUMMARY", "")).strip()
        description = str(component.get("DESCRIPTION", "")).strip()
        dtstart     = component.get("DTSTART")
        dtend       = component.get("DTEND")

        if dtstart is None:
            warnings.append(f"Event {event_num} '{summary}': missing DTSTART — skipped")
            continue
        if dtend is None:
            warnings.append(f"Event {event_num} '{summary}': missing DTEND — skipped")
            continue

        start_time = _to_utc_datetime(dtstart)
        end_time   = _to_utc_datetime(dtend)

        if start_time is None or end_time is None:
            warnings.append(f"Event {event_num} '{summary}': could not parse dates — skipped")
            continue

        if end_time <= start_time:
            warnings.append(f"Event {event_num} '{summary}': end before start — skipped")
            continue

        block_type, guessed = _infer_block_type(summary, description)
        if guessed:
            warnings.append(
                f"Event {event_num} '{summary}': could not detect shift type — defaulted to day_shift"
            )

        duration_hours = (end_time - start_time).total_seconds() / 3600
        blocks.append(
            ScheduleBlock(
                id=uuid4(),
                block_type=block_type,
                title=summary or None,
                start_time=start_time,
                end_time=end_time,
                duration_hours=round(duration_hours, 2),
                commute_before_minutes=commute_minutes,
                commute_after_minutes=commute_minutes,
            )
        )

    return blocks, warnings


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/upload-ical", response_model=ScheduleImportResponse)
async def upload_ical(
    file: UploadFile = File(...),
    user_id: UUID = Form(...),
    commute_minutes: int = Form(30),
) -> ScheduleImportResponse:
    """
    Upload a schedule as an iCal (.ics) file.

    Works with exports from:
      - Google Calendar
      - Apple Calendar
      - Outlook / Microsoft 365
      - NurseGrid, AMiON, HotSchedules, Kronos, When I Work

    Each VEVENT in the file becomes one schedule block.
    Block type is inferred from the event title/summary keywords.
    """
    filename = (file.filename or "").lower()
    if not filename.endswith((".ics", ".ical")):
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Upload a .ics or .ical file.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=422, detail="Uploaded file is empty")

    blocks, warnings = _parse_ical(content, commute_minutes)

    if not blocks:
        raise HTTPException(
            status_code=422,
            detail=f"No valid schedule events found in the .ics file. Warnings: {warnings}",
        )

    report = detect_changes(user_id, blocks)
    save_schedule_blocks(user_id, blocks)

    confidence = 1.0 if not warnings else (0.8 if len(warnings) <= 2 else 0.6)
    return ScheduleImportResponse(
        blocks=blocks,
        warnings=warnings,
        parse_confidence=confidence,
        replan_recommended=report.replan_recommended,
        change_summary=report.changes,
    )
