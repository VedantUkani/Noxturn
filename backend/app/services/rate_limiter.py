from collections import defaultdict
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException


class SlidingWindowLimiter:
    """
    In-memory sliding window rate limiter keyed by user_id.
    Tracks call timestamps within a rolling time window.
    Resets automatically — no cron needed.
    """

    def __init__(self, max_calls: int, window_minutes: int):
        self.max_calls = max_calls
        self.window_minutes = window_minutes
        self.window = timedelta(minutes=window_minutes)
        self._store: dict[str, list[datetime]] = defaultdict(list)

    def check(self, key: str) -> dict:
        now = datetime.now(timezone.utc)
        cutoff = now - self.window

        # Drop timestamps outside the window
        self._store[key] = [t for t in self._store[key] if t > cutoff]
        count = len(self._store[key])

        if count >= self.max_calls:
            reset_at = self._store[key][0] + self.window
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "rate_limit_exceeded",
                    "message": (
                        f"Claude planner is limited to {self.max_calls} calls "
                        f"per {self.window_minutes} minutes per user. "
                        f"Resets at {reset_at.strftime('%H:%M:%S UTC')}."
                    ),
                    "limit": self.max_calls,
                    "used": count,
                    "remaining": 0,
                    "reset_at": reset_at.isoformat(),
                },
            )

        self._store[key].append(now)
        remaining = self.max_calls - count - 1
        return {
            "limit": self.max_calls,
            "used": count + 1,
            "remaining": remaining,
        }

    def status(self, key: str) -> dict:
        """Return current usage without consuming a call."""
        now = datetime.now(timezone.utc)
        cutoff = now - self.window
        active = [t for t in self._store.get(key, []) if t > cutoff]
        count = len(active)
        reset_at = (active[0] + self.window).isoformat() if active else None
        return {
            "limit": self.max_calls,
            "window_minutes": self.window_minutes,
            "used": count,
            "remaining": max(0, self.max_calls - count),
            "reset_at": reset_at,
        }


# Singleton: 10 Claude calls per user per 60 minutes
claude_limiter = SlidingWindowLimiter(max_calls=10, window_minutes=60)
