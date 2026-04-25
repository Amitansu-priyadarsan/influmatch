from __future__ import annotations

"""
Token enforcement.

Every public API route requires either:
  - Authorization: Bearer <auth_token>      (signed-in users)
  - X-Session-Token: <session_token>        (anonymous, pre-signin)

`require_session` accepts either kind. Use this on /auth/signup, /auth/signin,
and any pre-auth endpoint that should still require a session token.

`require_auth` requires a valid auth token bound to a user. Use this on
authenticated endpoints (onboarding, /auth/me, /auth/logout, etc.).
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import Header, HTTPException, status

from .db import get_supabase


def _parse_bearer(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.strip().split(" ", 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1].strip() or None
    return None


def _get_token_row(token: str) -> Optional[dict]:
    sb = get_supabase()
    res = sb.table("tokens").select("*").eq("token", token).limit(1).execute()
    rows = res.data or []
    if not rows:
        return None
    row = rows[0]
    if row.get("revoked"):
        return None
    expires_at = row.get("expires_at")
    if expires_at:
        try:
            exp = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            if exp < datetime.now(timezone.utc):
                return None
        except Exception:
            pass
    return row


async def require_session(
    authorization: Optional[str] = Header(default=None),
    x_session_token: Optional[str] = Header(default=None, alias="X-Session-Token"),
) -> dict:
    """Accepts either an auth token or a session token. Returns the token row."""
    token = _parse_bearer(authorization) or x_session_token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing session or auth token",
        )
    row = _get_token_row(token)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return row


async def require_auth(
    authorization: Optional[str] = Header(default=None),
) -> dict:
    """Requires a valid auth token (bearer). Returns the user row."""
    token = _parse_bearer(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing auth token",
        )
    row = _get_token_row(token)
    if not row or row.get("kind") != "auth":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired auth token",
        )

    # Special-case: admin auth tokens. user_id is NULL, meta carries role+email.
    meta = row.get("meta") or {}
    if meta.get("role") == "admin":
        return {
            "id": "admin",
            "email": meta.get("email", "admin"),
            "role": "admin",
            "onboarded": True,
            "_token": token,
        }

    if not row.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has no subject",
        )

    sb = get_supabase()
    user_res = (
        sb.table("app_users").select("*").eq("id", row["user_id"]).limit(1).execute()
    )
    users = user_res.data or []
    if not users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    user = users[0]
    user["_token"] = token
    return user
