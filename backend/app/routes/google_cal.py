"""
Schedule import — Feature 3: Google Calendar OAuth2 integration.

Flow:
  Step 1 — GET /schedule/google/auth?user_id=<uuid>&commute_minutes=30
            Returns an authorization URL. User visits it, grants access.
            Google redirects to the callback URL with ?code=...&state=...

  Step 2 — GET /schedule/google/callback?code=<code>&state=<state>
            Exchanges the code for tokens, fetches calendar events for the
            next 14 days, converts them to schedule blocks, saves to Supabase.
            Returns ScheduleImportResponse.

Required .env keys:
  GOOGLE_CLIENT_ID      — from Google Cloud Console → OAuth 2.0 Client ID
  GOOGLE_CLIENT_SECRET  — from Google Cloud Console
  GOOGLE_REDIRECT_URI   — must exactly match what's registered in Google Console
                          e.g. http://localhost:8000/schedule/google/callback

Calendar scope requested: read-only (calendar.readonly) — we never write to the user's calendar.

Block type inference: same keyword mapping as iCal route (night/day/eve/off/transition).
"""

import json
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse

from app.models.schemas import ScheduleBlock, ScheduleImportResponse
from app.routes.ical import _infer_block_type   # reuse same keyword logic
from app.services.persistence import save_schedule_blocks
from app.services.schedule_change_detector import detect_changes

router = APIRouter(prefix="/schedule", tags=["Schedule"])

_SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

# In-memory state store: maps state_token → {user_id, commute_minutes}
# In production this would be Redis or Supabase; fine for demo/MVP.
_pending_states: dict[str, dict] = {}


def _get_credentials() -> tuple[str, str, str]:
    client_id     = os.getenv("GOOGLE_CLIENT_ID", "")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
    redirect_uri  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/schedule/google/callback")
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=503,
            detail=(
                "Google Calendar not configured. "
                "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env. "
                "See .env.example for setup instructions."
            ),
        )
    return client_id, client_secret, redirect_uri


def _to_datetime(value: str) -> Optional[datetime]:
    """Parse Google Calendar event start/end (dateTime or date)."""
    if not value:
        return None
    # dateTime format: 2026-03-22T19:00:00+05:30
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(value[:len(fmt) + 6], fmt)
            if hasattr(dt, "tzinfo") and dt.tzinfo:
                dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
            return dt
        except ValueError:
            continue
    return None


def _event_to_block(event: dict, commute_minutes: int) -> Optional[ScheduleBlock]:
    """Convert a Google Calendar event dict to a ScheduleBlock. Returns None if invalid."""
    start_raw = event.get("start", {}).get("dateTime") or event.get("start", {}).get("date", "")
    end_raw   = event.get("end",   {}).get("dateTime") or event.get("end",   {}).get("date", "")

    start_time = _to_datetime(start_raw)
    end_time   = _to_datetime(end_raw)

    if not start_time or not end_time or end_time <= start_time:
        return None

    summary     = event.get("summary", "").strip()
    description = event.get("description", "").strip()
    block_type, _ = _infer_block_type(summary, description)
    duration_hours = (end_time - start_time).total_seconds() / 3600

    return ScheduleBlock(
        id=uuid4(),
        block_type=block_type,
        title=summary or None,
        start_time=start_time,
        end_time=end_time,
        duration_hours=round(duration_hours, 2),
        commute_before_minutes=commute_minutes,
        commute_after_minutes=commute_minutes,
    )


# ── Step 1: Get auth URL ──────────────────────────────────────────────────────

@router.get("/google/auth")
def google_auth(
    user_id: UUID = Query(..., description="Your Noxturn user ID"),
    commute_minutes: int = Query(30),
    days_ahead: int = Query(14, description="How many days of calendar to fetch"),
):
    """
    Step 1: Returns a Google OAuth2 authorization URL.
    Direct the user to open this URL in their browser.
    After granting access, Google will redirect to /schedule/google/callback automatically.
    """
    from google_auth_oauthlib.flow import Flow

    client_id, client_secret, redirect_uri = _get_credentials()

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uris": [redirect_uri],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=_SCOPES,
        redirect_uri=redirect_uri,
    )

    # state encodes user context so callback can retrieve it
    import secrets
    state_token = secrets.token_urlsafe(24)
    _pending_states[state_token] = {
        "user_id": str(user_id),
        "commute_minutes": commute_minutes,
        "days_ahead": days_ahead,
    }

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        state=state_token,
        prompt="consent",
    )

    return {
        "auth_url": auth_url,
        "instruction": "Open auth_url in your browser. After granting access, you will be redirected back automatically.",
        "state": state_token,
    }


# ── Step 2: OAuth callback ────────────────────────────────────────────────────

@router.get("/google/callback", response_model=ScheduleImportResponse)
def google_callback(
    code: str = Query(...),
    state: str = Query(...),
    error: Optional[str] = Query(None),
):
    """
    Step 2: Google redirects here after user grants access.
    Exchanges the auth code for tokens, fetches calendar events, imports blocks.
    """
    if error:
        raise HTTPException(status_code=400, detail=f"Google auth denied: {error}")

    ctx = _pending_states.pop(state, None)
    if not ctx:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired state token. Restart the auth flow via /schedule/google/auth.",
        )

    from google_auth_oauthlib.flow import Flow
    from googleapiclient.discovery import build

    client_id, client_secret, redirect_uri = _get_credentials()

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uris": [redirect_uri],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=_SCOPES,
        redirect_uri=redirect_uri,
        state=state,
    )

    try:
        import os
        os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"   # allow http for local dev
        flow.fetch_token(code=code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {e}")

    credentials = flow.credentials
    user_id = UUID(ctx["user_id"])
    commute_minutes = ctx["commute_minutes"]
    days_ahead = ctx.get("days_ahead", 14)

    # Fetch calendar events
    try:
        service = build("calendar", "v3", credentials=credentials)
        now = datetime.now(timezone.utc)
        time_max = now + timedelta(days=days_ahead)

        events_result = service.events().list(
            calendarId="primary",
            timeMin=now.isoformat(),
            timeMax=time_max.isoformat(),
            maxResults=100,
            singleEvents=True,
            orderBy="startTime",
        ).execute()
        events = events_result.get("items", [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch Google Calendar events: {e}")

    # Convert events to blocks
    blocks = []
    warnings = []
    guessed_count = 0

    for i, event in enumerate(events, start=1):
        block = _event_to_block(event, commute_minutes)
        if block is None:
            warnings.append(f"Event {i} '{event.get('summary','')}': invalid dates — skipped")
            continue
        # Check if block type was guessed
        summary = event.get("summary", "")
        _, guessed = _infer_block_type(summary, event.get("description", ""))
        if guessed:
            guessed_count += 1
            warnings.append(f"Event {i} '{summary}': shift type not recognised — defaulted to day_shift")
        blocks.append(block)

    if not blocks:
        raise HTTPException(
            status_code=422,
            detail=f"No valid shift events found in Google Calendar for the next {days_ahead} days. Warnings: {warnings}",
        )

    report = detect_changes(user_id, blocks)
    save_schedule_blocks(user_id, blocks)

    confidence = 1.0
    if guessed_count > 0:
        confidence = round(1.0 - (guessed_count / len(blocks)) * 0.4, 2)
    if warnings:
        confidence = min(confidence, 0.85)

    return ScheduleImportResponse(
        blocks=blocks,
        warnings=warnings,
        parse_confidence=confidence,
        replan_recommended=report.replan_recommended,
        change_summary=report.changes,
    )


# ── Status check ──────────────────────────────────────────────────────────────

@router.get("/google/status")
def google_status():
    """Check whether Google Calendar integration is configured."""
    client_id     = os.getenv("GOOGLE_CLIENT_ID", "")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
    redirect_uri  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/schedule/google/callback")
    return {
        "configured": bool(client_id and client_secret),
        "client_id_set": bool(client_id),
        "client_secret_set": bool(client_secret),
        "redirect_uri": redirect_uri,
        "setup_guide": "https://console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client ID",
    }
