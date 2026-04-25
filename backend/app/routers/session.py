from __future__ import annotations

"""
POST /api/v1/session
Issues an anonymous session token. The frontend calls this on app boot
(or when landing on /login or /signup), stores the token in localStorage,
and sends it as `X-Session-Token` until the user signs in.
"""

from fastapi import APIRouter

from ..config import settings
from ..db import get_supabase
from ..models import SessionResponse
from ..security import expiry_from_now, make_token

router = APIRouter(prefix="/session", tags=["session"])


@router.post("", response_model=SessionResponse)
async def create_session() -> SessionResponse:
    sb = get_supabase()
    token = make_token("sess")
    expires_at = expiry_from_now(settings.SESSION_TOKEN_TTL)
    sb.table("tokens").insert({
        "token": token,
        "user_id": None,
        "kind": "session",
        "expires_at": expires_at,
    }).execute()
    return SessionResponse(session_token=token, expires_at=expires_at)
