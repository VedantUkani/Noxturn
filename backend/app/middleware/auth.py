"""
JWT authentication dependency for FastAPI routes.

Usage:
    from app.middleware.auth import require_user

    @router.post("/protected")
    def my_route(user_id: str = Depends(require_user)):
        ...

The dependency reads the `Authorization: Bearer <token>` header,
validates the JWT, and returns the `user_id` string from the token payload.
Raises HTTP 401 if the header is missing, the token is malformed, or expired.
"""

import os

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_bearer = HTTPBearer(auto_error=False)

_JWT_SECRET = os.getenv("JWT_SECRET", "change-me-generate-a-real-secret")
_ALGORITHM = "HS256"


def require_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """
    FastAPI dependency that validates a Bearer JWT and returns the user_id.

    Raises HTTP 401 if:
    - No Authorization header present
    - Token is malformed
    - Token has expired
    - Token does not contain a user_id claim
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing. Include 'Authorization: Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(
            credentials.credentials,
            _JWT_SECRET,
            algorithms=[_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Request a new token via POST /auth/login.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str | None = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing user_id claim.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id
