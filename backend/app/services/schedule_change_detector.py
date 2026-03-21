"""
Feature 5: Proactive replan trigger.

When a new schedule is imported (via any method — JSON, CSV, iCal, Google, Outlook),
this module compares it to the previously stored schedule and determines whether
the changes are significant enough to warrant an automatic replan.

Change detection logic:
  - Loads the previous schedule blocks from Supabase for the user
  - Compares shift timings, types, and count against the newly imported blocks
  - Returns a ChangeReport with a severity level and list of specific changes found

Severity levels:
  - NONE     → no meaningful changes detected
  - MINOR    → small timing shifts (< 2h), no type changes — no replan needed
  - MODERATE → timing shift 2–6h OR 1 shift type changed — replan recommended
  - MAJOR    → timing shift > 6h OR multiple type changes OR shift count changed — replan required

Integration:
  Called automatically at the end of every schedule import/upload endpoint.
  If severity is MODERATE or MAJOR, the import response includes a
  `replan_recommended` flag and a `change_summary` explaining what changed.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from app.models.schemas import ScheduleBlock


@dataclass
class ChangeReport:
    severity: str           # "none" | "minor" | "moderate" | "major"
    replan_recommended: bool
    changes: List[str]      # human-readable list of detected changes
    old_block_count: int
    new_block_count: int


def _load_previous_blocks(user_id: UUID) -> List[dict]:
    """Fetch current schedule_blocks from Supabase for this user."""
    try:
        from app.services.db import get_supabase
        db = get_supabase()
        res = (
            db.table("schedule_blocks")
            .select("block_type, start_time, end_time, title")
            .eq("user_id", str(user_id))
            .order("start_time")
            .execute()
        )
        return res.data or []
    except Exception:
        return []


def _parse_dt(raw: str) -> Optional[datetime]:
    try:
        return datetime.fromisoformat(raw)
    except Exception:
        return None


def detect_changes(user_id: UUID, new_blocks: List[ScheduleBlock]) -> ChangeReport:
    """
    Compare newly imported blocks against what's currently stored in DB.
    Returns a ChangeReport describing what changed and whether a replan is needed.
    """
    old_rows = _load_previous_blocks(user_id)

    old_count = len(old_rows)
    new_count = len(new_blocks)
    changes: List[str] = []

    # No previous schedule — first import, nothing to compare
    if old_count == 0:
        return ChangeReport(
            severity="none",
            replan_recommended=False,
            changes=["First schedule import — no previous schedule to compare."],
            old_block_count=0,
            new_block_count=new_count,
        )

    # Count change
    if new_count != old_count:
        diff = new_count - old_count
        changes.append(
            f"Shift count changed: {old_count} → {new_count} "
            f"({'added' if diff > 0 else 'removed'} {abs(diff)} shift{'s' if abs(diff)>1 else ''})"
        )

    # Compare overlapping blocks by position
    max_timing_shift_hours = 0.0
    type_changes = 0

    for i, (old, new) in enumerate(zip(old_rows, new_blocks), start=1):
        old_start = _parse_dt(old["start_time"])
        new_start = new.start_time

        if old_start and new_start:
            shift_hours = abs((new_start - old_start.replace(tzinfo=None)).total_seconds()) / 3600
            if shift_hours > 0.25:  # ignore sub-15-min noise
                max_timing_shift_hours = max(max_timing_shift_hours, shift_hours)
                if shift_hours >= 2:
                    changes.append(
                        f"Shift {i} '{old.get('title') or old['block_type']}': "
                        f"start moved by {round(shift_hours, 1)}h "
                        f"(was {old['start_time'][:16]}, now {new_start.isoformat()[:16]})"
                    )

        if old["block_type"] != new.block_type.value:
            type_changes += 1
            changes.append(
                f"Shift {i}: type changed from {old['block_type']} to {new.block_type.value}"
            )

    # Determine severity
    count_changed = new_count != old_count
    if not changes or (len(changes) == 1 and "First import" in changes[0]):
        severity = "none"
    elif max_timing_shift_hours > 6 or type_changes > 1 or count_changed:
        severity = "major"
    elif max_timing_shift_hours >= 2 or type_changes == 1:
        severity = "moderate"
    elif max_timing_shift_hours > 0:
        severity = "minor"
    else:
        severity = "none"

    replan_recommended = severity in ("moderate", "major")

    return ChangeReport(
        severity=severity,
        replan_recommended=replan_recommended,
        changes=changes if changes else ["No significant schedule changes detected."],
        old_block_count=old_count,
        new_block_count=new_count,
    )
