"""
Schedule import — Feature 4: Microsoft Outlook / Microsoft 365 OAuth2 integration.

Uses Microsoft Authentication Library (MSAL) + Microsoft Graph API.
Works with personal Outlook.com accounts AND work/school Microsoft 365 accounts.

Flow:
  Step 1 — GET /schedule/outlook/auth?user_id=<uuid>&commute_minutes=30
            Returns an authorization URL. User visits it, signs in with Microsoft.
            Microsoft redirects to the callback URL with ?code=...&state=...

  Step 2 — GET /schedule/outlook/callback?code=<code>&state=<state>
            Exchanges the code for access token via MSAL, calls Microsoft Graph
            /me/calendarView to fetch events, converts to schedule blocks.

Required .env keys:
  MICROSOFT_CLIENT_ID      — from Azure App Registration
  MICROSOFT_CLIENT_SECRET  — from Azure App Registration → Certificates & Secrets
  MICROSOFT_REDIRECT_URI   — must exactly match what's registered in Azure
                             e.g. http://localhost:8000/schedule/outlook/callback

Graph API scope: Calendars.Read (read-only — never writes to the user's calendar).

Setup:
  1. Go to portal.azure.com → App registrations → New registration
  2. Name: Noxturn, Supported account types: Personal + work accounts
  3. Redirect URI: Web → http://localhost:8000/schedule/outlook/callback
  4. After creation: Certificates & secrets → New client secret → copy value
  5. API permissions → Add → Microsoft Graph → Delegated → Calendars.Read
"""

import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import ScheduleBlock, ScheduleImportResponse
from app.routes.ical import _infer_block_type
from app.services.persistence import save_schedule_blocks
from app.services.schedule_change_detector import detect_changes

router = APIRouter(prefix="/schedule", tags=["Schedule"])

_GRAPH_SCOPES = ["Calendars.Read", "User.Read"]
_AUTHORITY    = "https://login.microsoftonline.com/common"

# In-memory state store: maps state_token → {user_id, commute_minutes, days_ahead}
_pending_states: dict[str, dict] = {}


def _get_credentials() -> tuple[str, str, str]:
    client_id     = os.getenv("MICROSOFT_CLIENT_ID", "")
    client_secret = os.getenv("MICROSOFT_CLIENT_SECRET", "")
    redirect_uri  = os.getenv("MICROSOFT_REDIRECT_URI", "http://localhost:8000/schedule/outlook/callback")
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=503,
            detail=(
                "Outlook Calendar not configured. "
                "Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in .env. "
                "See .env.example for setup instructions."
            ),
        )
    return client_id, client_secret, redirect_uri


def _parse_ms_datetime(value: str) -> Optional[datetime]:
    """Parse Microsoft Graph dateTime string (no timezone — Graph returns UTC by default)."""
    if not value:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f0000000", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(value[:26], fmt)
        except ValueError:
            continue
    return None


def _event_to_block(event: dict, commute_minutes: int) -> Optional[ScheduleBlock]:
    start_raw = event.get("start", {}).get("dateTime", "")
    end_raw   = event.get("end",   {}).get("dateTime", "")

    start_time = _parse_ms_datetime(start_raw)
    end_time   = _parse_ms_datetime(end_raw)

    if not start_time or not end_time or end_time <= start_time:
        return None

    subject     = event.get("subject", "").strip()
    body_text   = event.get("bodyPreview", "").strip()
    block_type, _ = _infer_block_type(subject, body_text)
    duration_hours = (end_time - start_time).total_seconds() / 3600

    return ScheduleBlock(
        id=uuid4(),
        block_type=block_type,
        title=subject or None,
        start_time=start_time,
        end_time=end_time,
        duration_hours=round(duration_hours, 2),
        commute_before_minutes=commute_minutes,
        commute_after_minutes=commute_minutes,
    )


# ── Step 1: Get auth URL ──────────────────────────────────────────────────────

@router.get("/outlook/auth")
def outlook_auth(
    user_id: UUID = Query(...),
    commute_minutes: int = Query(30),
    days_ahead: int = Query(14),
):
    """
    Step 1: Returns a Microsoft OAuth2 authorization URL.
    Direct the user to open this URL in their browser.
    After signing in, Microsoft redirects to /schedule/outlook/callback.
    """
    import msal

    client_id, client_secret, redirect_uri = _get_credentials()

    app = msal.ConfidentialClientApplication(
        client_id,
        authority=_AUTHORITY,
        client_credential=client_secret,
    )

    state_token = secrets.token_urlsafe(24)
    _pending_states[state_token] = {
        "user_id": str(user_id),
        "commute_minutes": commute_minutes,
        "days_ahead": days_ahead,
    }

    auth_url = app.get_authorization_request_url(
        scopes=_GRAPH_SCOPES,
        redirect_uri=redirect_uri,
        state=state_token,
    )

    return {
        "auth_url": auth_url,
        "instruction": "Open auth_url in your browser. Sign in with your Microsoft account. You will be redirected back automatically.",
        "state": state_token,
    }


# ── Step 2: OAuth callback ────────────────────────────────────────────────────

@router.get("/outlook/callback", response_model=ScheduleImportResponse)
def outlook_callback(
    code: str = Query(...),
    state: str = Query(...),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
):
    """
    Step 2: Microsoft redirects here after user signs in.
    Exchanges the auth code for an access token, fetches Outlook calendar events.
    """
    if error:
        raise HTTPException(
            status_code=400,
            detail=f"Microsoft auth error: {error}. {error_description or ''}".strip(),
        )

    ctx = _pending_states.pop(state, None)
    if not ctx:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired state token. Restart the auth flow via /schedule/outlook/auth.",
        )

    import msal, requests as http

    client_id, client_secret, redirect_uri = _get_credentials()

    app = msal.ConfidentialClientApplication(
        client_id,
        authority=_AUTHORITY,
        client_credential=client_secret,
    )

    token_result = app.acquire_token_by_authorization_code(
        code,
        scopes=_GRAPH_SCOPES,
        redirect_uri=redirect_uri,
    )

    if "error" in token_result:
        raise HTTPException(
            status_code=400,
            detail=f"Token exchange failed: {token_result.get('error_description', token_result.get('error'))}",
        )

    access_token  = token_result["access_token"]
    user_id       = UUID(ctx["user_id"])
    commute_minutes = ctx["commute_minutes"]
    days_ahead    = ctx.get("days_ahead", 14)

    # Fetch calendar events via Microsoft Graph
    now      = datetime.now(timezone.utc)
    time_max = now + timedelta(days=days_ahead)

    graph_url = (
        f"https://graph.microsoft.com/v1.0/me/calendarView"
        f"?startDateTime={now.strftime('%Y-%m-%dT%H:%M:%S')}"
        f"&endDateTime={time_max.strftime('%Y-%m-%dT%H:%M:%S')}"
        f"&$top=100"
        f"&$select=subject,start,end,bodyPreview"
        f"&$orderby=start/dateTime"
    )

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Prefer": 'outlook.timezone="UTC"',
    }

    try:
        resp = http.get(graph_url, headers=headers, timeout=15)
        resp.raise_for_status()
        events = resp.json().get("value", [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch Outlook calendar: {e}")

    # Convert to blocks
    blocks = []
    warnings = []
    guessed_count = 0

    for i, event in enumerate(events, start=1):
        block = _event_to_block(event, commute_minutes)
        if block is None:
            warnings.append(f"Event {i} '{event.get('subject','')}': invalid dates — skipped")
            continue
        subject = event.get("subject", "")
        _, guessed = _infer_block_type(subject, event.get("bodyPreview", ""))
        if guessed:
            guessed_count += 1
            warnings.append(f"Event {i} '{subject}': shift type not recognised — defaulted to day_shift")
        blocks.append(block)

    if not blocks:
        raise HTTPException(
            status_code=422,
            detail=f"No valid shift events found in Outlook for the next {days_ahead} days. Warnings: {warnings}",
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

@router.get("/outlook/status")
def outlook_status():
    """Check whether Outlook Calendar integration is configured."""
    client_id     = os.getenv("MICROSOFT_CLIENT_ID", "")
    client_secret = os.getenv("MICROSOFT_CLIENT_SECRET", "")
    redirect_uri  = os.getenv("MICROSOFT_REDIRECT_URI", "http://localhost:8000/schedule/outlook/callback")
    return {
        "configured": bool(client_id and client_secret),
        "client_id_set": bool(client_id),
        "client_secret_set": bool(client_secret),
        "redirect_uri": redirect_uri,
        "setup_guide": "portal.azure.com → App registrations → New registration",
    }
