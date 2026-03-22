"""
Stats service — reads task_events and outcome_memory from Supabase
to compute streaks, weekly summaries, and recovery consistency.
"""

from datetime import date, timedelta
from typing import Optional

from app.services.db import get_supabase


# ── helpers ───────────────────────────────────────────────────────────────

def _iso(d: date) -> str:
    return d.isoformat()


def _week_start(d: date, tz_name: str = "UTC") -> date:
    """
    6c: Return the Monday of the week containing d, using the user's timezone.
    Falls back to UTC silently if an invalid timezone string is passed.
    """
    try:
        from zoneinfo import ZoneInfo
        import datetime as _dt
        # Convert today to the user's local date
        local_now = _dt.datetime.now(ZoneInfo(tz_name))
        local_date = local_now.date()
        return local_date - timedelta(days=local_date.weekday())
    except Exception:
        return d - timedelta(days=d.weekday())


# ── streaks ───────────────────────────────────────────────────────────────

def compute_streaks(user_id: str, timezone: str = "UTC") -> dict:
    """
    Walk task_events backwards from today.
    A 'streak day' is any calendar day (UTC) where the user completed
    at least one anchor task.

    Returns:
        current_streak   — consecutive days ending today (or yesterday)
        longest_streak   — all-time longest run
        last_completed_date — ISO date of most recent anchor completion
    """
    db = get_supabase()
    rows = (
        db.table("task_events")
        .select("recorded_at")
        .eq("user_id", user_id)
        .eq("anchor_flag", True)
        .eq("status", "completed")
        .order("recorded_at", desc=True)
        .execute()
    )

    if not rows.data:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "last_completed_date": None,
        }

    # Collect unique dates (UTC) with at least one anchor completion
    completion_dates = sorted(
        {row["recorded_at"][:10] for row in rows.data},
        reverse=True,
    )

    last_completed_date = completion_dates[0]
    today = _iso(date.today())
    yesterday = _iso(date.today() - timedelta(days=1))

    # Current streak: must start from today or yesterday
    current_streak = 0
    if completion_dates[0] in (today, yesterday):
        expected = date.fromisoformat(completion_dates[0])
        for d_str in completion_dates:
            if d_str == _iso(expected):
                current_streak += 1
                expected -= timedelta(days=1)
            else:
                break

    # Longest streak: scan all dates
    longest_streak = 0
    run = 0
    prev: Optional[date] = None
    for d_str in reversed(completion_dates):
        d = date.fromisoformat(d_str)
        if prev is None or d == prev + timedelta(days=1):
            run += 1
        else:
            run = 1
        longest_streak = max(longest_streak, run)
        prev = d

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_completed_date": last_completed_date,
    }


# ── weekly summary ─────────────────────────────────────────────────────────

def compute_weekly_summary(user_id: str, timezone: str = "UTC") -> dict:
    """
    Returns task counts for the current Mon–Sun week from task_events,
    plus a recovery_rhythm_trend derived from outcome_memory.
    """
    db = get_supabase()
    week_start = _week_start(date.today(), timezone)
    week_end = week_start + timedelta(days=6)

    rows = (
        db.table("task_events")
        .select("status, anchor_flag")
        .eq("user_id", user_id)
        .gte("recorded_at", week_start.isoformat())
        .lte("recorded_at", f"{week_end.isoformat()}T23:59:59")
        .execute()
    )

    completed = skipped = expired = protected_blocks = 0
    for r in rows.data or []:
        s = r["status"]
        if s == "completed":
            completed += 1
            if r["anchor_flag"]:
                protected_blocks += 1
        elif s == "skipped":
            skipped += 1
        elif s == "expired":
            expired += 1

    # Trend from outcome_memory: compare this week's avg rate to last week's
    trend = _recovery_trend(db, user_id, week_start)

    # 6d: anomaly detection
    anomaly = _compute_anomaly_flag(db, user_id, week_start, protected_blocks)

    return {
        "week_start": week_start.isoformat(),
        "tasks_completed": completed,
        "tasks_skipped": skipped,
        "tasks_expired": expired,
        "protected_blocks_held": protected_blocks,
        "recovery_rhythm_trend": trend,
        "anomaly_flag": anomaly,
    }


def _recovery_trend(db, user_id: str, week_start: date) -> str:
    """
    6b: Reduced minimum data threshold.
    - 0 data points (never completed any anchor) → "insufficient_data"
    - 1 data point → "steady" (not enough to judge direction)
    - 2+ data points with both weeks represented → compare and classify
    """
    last_two_weeks = week_start - timedelta(days=7)
    rows = (
        db.table("outcome_memory")
        .select("date, anchor_completion_rate, anchors_total")
        .eq("user_id", user_id)
        .gte("date", last_two_weeks.isoformat())
        .order("date")
        .execute()
    )
    data = rows.data or []

    # 6b: truly no data = user has never completed an anchor at all
    if not data or all((r.get("anchors_total") or 0) == 0 for r in data):
        return "insufficient_data"

    this_week = [r["anchor_completion_rate"] for r in data if r["date"] >= week_start.isoformat() and r["anchor_completion_rate"] is not None]
    last_week = [r["anchor_completion_rate"] for r in data if r["date"] < week_start.isoformat() and r["anchor_completion_rate"] is not None]

    # 6b: single data point → steady (not enough to determine direction)
    if not this_week or not last_week:
        return "steady"

    this_avg = sum(this_week) / len(this_week)
    last_avg = sum(last_week) / len(last_week)
    delta = this_avg - last_avg

    if delta >= 10:
        return "improving"
    if delta <= -10:
        return "declining"
    return "steady"


def _compute_anomaly_flag(db, user_id: str, week_start: date, this_week_anchors: int) -> Optional[str]:
    """
    6d: Detect anomalies in weekly anchor performance.
    Priority: sharp_drop > zero_anchors > streak_broken > None
    """
    last_week_start = week_start - timedelta(days=7)

    # Fetch last week's outcome_memory to compare anchor rates
    last_week_rows = (
        db.table("outcome_memory")
        .select("anchor_completion_rate, anchors_total")
        .eq("user_id", user_id)
        .gte("date", last_week_start.isoformat())
        .lt("date", week_start.isoformat())
        .execute()
    )
    last_week_data = last_week_rows.data or []

    # Fetch this week's outcome_memory
    this_week_rows = (
        db.table("outcome_memory")
        .select("anchor_completion_rate, anchors_total")
        .eq("user_id", user_id)
        .gte("date", week_start.isoformat())
        .execute()
    )
    this_week_data = this_week_rows.data or []

    # sharp_drop: this week's avg completion rate dropped ≥30 percentage points vs last week
    if last_week_data and this_week_data:
        last_rates = [r["anchor_completion_rate"] for r in last_week_data if r.get("anchor_completion_rate") is not None]
        this_rates = [r["anchor_completion_rate"] for r in this_week_data if r.get("anchor_completion_rate") is not None]
        if last_rates and this_rates:
            last_avg = sum(last_rates) / len(last_rates)
            this_avg = sum(this_rates) / len(this_rates)
            if last_avg - this_avg >= 30:
                return "sharp_drop"

    # zero_anchors: no anchor completions this week, but there are anchor tasks (anchors_total > 0)
    if this_week_anchors == 0:
        this_totals = [r.get("anchors_total") or 0 for r in this_week_data]
        if any(t > 0 for t in this_totals):
            return "zero_anchors"

    # streak_broken: had a streak ≥3 days that ended before today
    today = _iso(date.today())
    yesterday = _iso(date.today() - timedelta(days=1))
    streak_rows = (
        db.table("task_events")
        .select("recorded_at")
        .eq("user_id", user_id)
        .eq("anchor_flag", True)
        .eq("status", "completed")
        .order("recorded_at", desc=True)
        .limit(30)
        .execute()
    )
    if streak_rows.data:
        dates = sorted({r["recorded_at"][:10] for r in streak_rows.data}, reverse=True)
        # If most recent completion is not today or yesterday, the streak may be broken
        if dates and dates[0] not in (today, yesterday):
            # Count the previous consecutive run
            run = 0
            prev: Optional[date] = None
            for d_str in reversed(dates):
                d = date.fromisoformat(d_str)
                if prev is None or d == prev + timedelta(days=1):
                    run += 1
                else:
                    run = 1
                prev = d
            if run >= 3:
                return "streak_broken"

    return None


# ── recovery consistency ──────────────────────────────────────────────────

def compute_recovery_consistency(user_id: str, period_days: int = 7) -> dict:
    """
    Returns the % of anchor tasks completed over the last `period_days` days.
    """
    db = get_supabase()
    since = _iso(date.today() - timedelta(days=period_days))

    rows = (
        db.table("task_events")
        .select("status")
        .eq("user_id", user_id)
        .eq("anchor_flag", True)
        .gte("recorded_at", since)
        .execute()
    )

    data = rows.data or []
    anchors_total = len(data)
    anchors_completed = sum(1 for r in data if r["status"] == "completed")

    pct = round((anchors_completed / anchors_total * 100), 1) if anchors_total > 0 else 0.0

    if anchors_total == 0:
        label = "no_data"  # 6a: explicit no_data when no anchors tracked
    elif pct >= 75:
        label = "strong"
    elif pct >= 40:
        label = "moderate"
    else:
        label = "low"

    return {
        "period_days": period_days,
        "anchors_total": anchors_total,
        "anchors_completed": anchors_completed,
        "consistency_pct": pct,
        "label": label,
    }


# ── outcome memory upsert (called from tasks route) ───────────────────────

def refresh_outcome_memory(user_id: str, plan_mode: Optional[str], recovery_score: Optional[float]) -> None:
    """
    Recompute today's anchor completion rate from task_events and upsert
    into outcome_memory. Call this after every task event.
    """
    db = get_supabase()
    today = _iso(date.today())

    rows = (
        db.table("task_events")
        .select("status")
        .eq("user_id", user_id)
        .eq("anchor_flag", True)
        .gte("recorded_at", today)
        .execute()
    )

    data = rows.data or []
    anchors_total = len(data)
    anchors_completed = sum(1 for r in data if r["status"] == "completed")

    from app.services.persistence import upsert_outcome_memory
    from uuid import UUID
    try:
        uid = UUID(user_id)
    except ValueError:
        return
    upsert_outcome_memory(
        uid, today, plan_mode, recovery_score,
        anchors_completed, anchors_total,
    )
