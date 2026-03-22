from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.middleware.auth import require_user
from app.services.db import get_supabase

router = APIRouter(prefix="/recovery", tags=["Recovery"])


# ── Response models ────────────────────────────────────────────────────────────

class DailyBlockStat(BaseModel):
    day: str        # "MON"
    date: str       # "2026-03-15"
    protected: int  # completed anchor tasks
    total: int      # total anchor tasks that day


class TrendPoint(BaseModel):
    week_label: str  # "WEEK 1" … "CURRENT"
    value: float     # 0.0–1.0 normalised stability (inverse of strain)


class RecoveryAnalyticsResponse(BaseModel):
    # Snapshot
    protected_count: int
    protected_total: int
    snapshot_label: str
    headline_mood: str          # "steady" | "rebuilding" | "interrupted"

    # Adherence metrics (0–100)
    light_consistency_pct: int
    caffeine_cutoff_pct: int

    # Resilience trend
    trend_points: List[TrendPoint]
    trend_stable: bool
    trend_volatility: str       # "LOW" | "MODERATE" | "HIGH"

    # Daily heatmap
    daily_blocks: List[DailyBlockStat]

    # Narrative
    supportive_quote: str
    bottom_insight: str


# ── Helpers ────────────────────────────────────────────────────────────────────

_DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]


def _pct(completed: int, total: int) -> int:
    return round(completed / total * 100) if total else 0


def _week_label(i: int, total: int) -> str:
    return "CURRENT" if i == total - 1 else f"WEEK {i + 1}"


def _mood(rate: float) -> str:
    if rate >= 0.8:
        return "steady"
    if rate >= 0.5:
        return "rebuilding"
    return "interrupted"


def _quote(mood: str) -> str:
    return {
        "steady": (
            "You've been consistently protecting your recovery windows. "
            "That consistency is what stabilises your circadian clock over time."
        ),
        "rebuilding": (
            "Every anchor block you protect moves your body clock a step closer to stability. "
            "The pattern is building — keep going."
        ),
        "interrupted": (
            "Shift work is hard. Even partial protection of your sleep and recovery windows "
            "has a real physiological benefit. Each one counts."
        ),
    }.get(mood, "Keep protecting your anchor blocks — every one matters.")


def _insight(points: List[TrendPoint], protected_pct: int) -> str:
    if len(points) < 2:
        return "Complete more tasks to unlock your recovery trend."
    delta = round((points[-1].value - points[0].value) * 100)
    weeks = len(points) - 1
    suffix = "week" if weeks == 1 else "weeks"
    if delta > 0:
        return (
            f"Your recovery trajectory is {delta}% more stable than {weeks} {suffix} ago. "
            "Keep focusing on those protected blocks."
        )
    if delta < 0:
        return (
            f"Stability is {abs(delta)}% lower than {weeks} {suffix} ago. "
            "Review your anchor completion rate to reverse the trend."
        )
    return "Stability is holding steady. Consistent anchors are your biggest lever for improvement."


# ── Endpoint ───────────────────────────────────────────────────────────────────

@router.get("/analytics", response_model=RecoveryAnalyticsResponse)
def get_recovery_analytics(
    token_user_id: str = Depends(require_user),
) -> RecoveryAnalyticsResponse:
    uid = token_user_id
    db = get_supabase()
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    four_weeks_ago = now - timedelta(weeks=4)

    # ── 1. Anchor tasks — last 7 days ─────────────────────────────────────────
    # PostgREST requires lowercase "true"/"false" for boolean equality filters.
    # Python's True serialises as "True" (capital-T) which matches no rows.
    anchor_rows = (
        db.table("plan_tasks")
        .select("scheduled_time,status")
        .eq("user_id", uid)
        .eq("anchor_flag", "true")
        .gte("scheduled_time", week_ago.isoformat())
        .execute()
    )
    anchor_data = anchor_rows.data or []

    protected_count = sum(1 for r in anchor_data if r["status"] == "completed")
    protected_total = len(anchor_data)

    # Build Mon–Sun daily heatmap for the current calendar week
    week_start = (now - timedelta(days=now.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    daily_map: dict[str, dict] = {}
    for i in range(7):
        d = week_start + timedelta(days=i)
        key = d.strftime("%Y-%m-%d")
        daily_map[key] = {
            "day": _DAY_LABELS[i],
            "date": key,
            "protected": 0,
            "total": 0,
        }

    for row in anchor_data:
        try:
            st = datetime.fromisoformat(row["scheduled_time"])
            if st.tzinfo is None:
                st = st.replace(tzinfo=timezone.utc)
            key = st.strftime("%Y-%m-%d")
            if key in daily_map:
                daily_map[key]["total"] += 1
                if row["status"] == "completed":
                    daily_map[key]["protected"] += 1
        except (ValueError, KeyError):
            pass

    daily_blocks = [DailyBlockStat(**v) for v in daily_map.values()]

    # ── 2. Light timing adherence — last 7 days ───────────────────────────────
    light_rows = (
        db.table("plan_tasks")
        .select("status")
        .eq("user_id", uid)
        .eq("category", "light_timing")
        .gte("scheduled_time", week_ago.isoformat())
        .execute()
    )
    light_data = light_rows.data or []
    light_pct = _pct(
        sum(1 for r in light_data if r["status"] == "completed"),
        len(light_data),
    )

    # ── 3. Caffeine cutoff adherence — last 7 days ────────────────────────────
    caff_rows = (
        db.table("plan_tasks")
        .select("status")
        .eq("user_id", uid)
        .eq("category", "caffeine_cutoff")
        .gte("scheduled_time", week_ago.isoformat())
        .execute()
    )
    caff_data = caff_rows.data or []
    caff_pct = _pct(
        sum(1 for r in caff_data if r["status"] == "completed"),
        len(caff_data),
    )

    # ── 4. Resilience trend — last 4 weeks ────────────────────────────────────
    plans_rows = (
        db.table("plans")
        .select("created_at,circadian_strain_score")
        .eq("user_id", uid)
        .gte("created_at", four_weeks_ago.isoformat())
        .order("created_at")
        .execute()
    )
    plans_data = plans_rows.data or []

    week_buckets: dict[int, list[float]] = {0: [], 1: [], 2: [], 3: []}
    for row in plans_data:
        try:
            created = datetime.fromisoformat(row["created_at"])
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            weeks_ago = int((now - created).total_seconds() / (7 * 24 * 3600))
            bucket = 3 - min(weeks_ago, 3)  # 0 = oldest, 3 = current
            strain = float(row.get("circadian_strain_score") or 0)
            stability = max(0.0, min(1.0, 1.0 - strain / 100.0))
            week_buckets[bucket].append(stability)
        except (ValueError, KeyError, TypeError):
            pass

    raw: list[Optional[float]] = []
    for i in range(4):
        vals = week_buckets[i]
        raw.append(sum(vals) / len(vals) if vals else None)

    # Forward-fill gaps so the chart always has 4 points
    last_known = 0.5
    filled: list[float] = []
    for v in raw:
        if v is not None:
            last_known = v
        filled.append(last_known if v is None else v)

    trend_points = [
        TrendPoint(week_label=_week_label(i, 4), value=round(v, 3))
        for i, v in enumerate(filled)
    ]

    vals = [p.value for p in trend_points]
    volatility = max(vals) - min(vals)
    trend_stable = vals[-1] >= 0.6 and volatility < 0.3
    volatility_label = (
        "LOW" if volatility < 0.2 else "MODERATE" if volatility < 0.4 else "HIGH"
    )

    # ── 5. Narrative ──────────────────────────────────────────────────────────
    rate = protected_count / protected_total if protected_total > 0 else 0.0
    mood = _mood(rate)

    return RecoveryAnalyticsResponse(
        protected_count=protected_count,
        protected_total=protected_total,
        snapshot_label="WEEKLY STABILITY SNAPSHOT",
        headline_mood=mood,
        light_consistency_pct=light_pct,
        caffeine_cutoff_pct=caff_pct,
        trend_points=trend_points,
        trend_stable=trend_stable,
        trend_volatility=volatility_label,
        daily_blocks=daily_blocks,
        supportive_quote=_quote(mood),
        bottom_insight=_insight(trend_points, round(rate * 100)),
    )
