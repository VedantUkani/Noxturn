"""
Authentication routes — magic-link style (no password) MVP.

POST /auth/register  — create a new user account, returns a JWT
POST /auth/login     — get a fresh JWT for an existing account

The JWT payload is {"user_id": "<uuid>", "exp": <unix timestamp>}.
Token lifetime is 7 days.
"""

import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import AuthLoginRequest, AuthRegisterRequest, AuthTokenResponse
from app.services.db import get_supabase

router = APIRouter(prefix="/auth", tags=["Auth"])

_JWT_SECRET = os.getenv("JWT_SECRET", "change-me-generate-a-real-secret")
_ALGORITHM = "HS256"
_TOKEN_TTL_DAYS = 7


def _make_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=_TOKEN_TTL_DAYS)
    return jwt.encode({"user_id": user_id, "exp": exp}, _JWT_SECRET, algorithm=_ALGORITHM)


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: AuthRegisterRequest) -> AuthTokenResponse:
    """
    Create a new user account.
    Returns a signed JWT valid for 7 days.
    Raises 409 if the email is already registered.
    """
    db = get_supabase()
    # Check for duplicate email
    existing = db.table("users").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An account with email '{body.email}' already exists. Use POST /auth/login.",
        )
    user_id = str(uuid4())
    db.table("users").insert(
        {
            "id": user_id,
            "email": body.email,
            "name": body.name,
            "role": body.role or "nurse",
            "commute_minutes": body.commute_minutes or 45,
            "timezone": body.timezone or "UTC",
        }
    ).execute()
    return AuthTokenResponse(
        access_token=_make_token(user_id),
        token_type="bearer",
        user_id=user_id,
        expires_in_days=_TOKEN_TTL_DAYS,
    )


@router.post("/login", response_model=AuthTokenResponse)
def login(body: AuthLoginRequest) -> AuthTokenResponse:
    """
    Get a fresh JWT for an existing account.
    Magic-link style — no password required for MVP.
    Raises 404 if no account exists for the email.
    """
    db = get_supabase()
    result = db.table("users").select("id").eq("email", body.email).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No account found for '{body.email}'. Register first via POST /auth/register.",
        )
    user_id = result.data[0]["id"]
    return AuthTokenResponse(
        access_token=_make_token(user_id),
        token_type="bearer",
        user_id=user_id,
        expires_in_days=_TOKEN_TTL_DAYS,
    )
