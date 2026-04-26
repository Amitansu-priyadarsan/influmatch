from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..config import settings
from ..db import get_supabase
from ..deps import require_auth, require_session
from ..models import (
    SigninRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)
from ..security import (
    expiry_from_now,
    hash_password,
    make_token,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _hydrate_user(user_row: dict) -> UserResponse:
    """Attach the role-specific profile + cached rating to the user response."""
    sb = get_supabase()
    profile = None
    business = None

    if user_row["role"] == "influencer":
        res = (
            sb.table("influencer_profiles")
            .select("*")
            .eq("user_id", user_row["id"])
            .limit(1)
            .execute()
        )
        rows = res.data or []
        if rows:
            p = rows[0]
            profile = {
                "fullName": p.get("full_name"),
                "phone": p.get("phone"),
                "city": p.get("city"),
                "bio": p.get("bio"),
                "niche": p.get("niche"),
                "niches": p.get("niches"),
                "platforms": p.get("platforms"),
                "instagram": p.get("instagram"),
                "followers": p.get("followers"),
                "avatarUrl": p.get("avatar_url"),
            }

    elif user_row["role"] == "owner":
        res = (
            sb.table("owner_profiles")
            .select("*")
            .eq("user_id", user_row["id"])
            .limit(1)
            .execute()
        )
        rows = res.data or []
        if rows:
            p = rows[0]
            business = p.get("business")
            profile = {
                "business": p.get("business"),
                "city": p.get("city"),
                "category": p.get("category"),
                "website": p.get("website"),
                "phone": p.get("phone"),
                "budget": p.get("budget"),
                "description": p.get("description"),
                "avatarUrl": p.get("avatar_url"),
            }

    # Pull cached rating off the user row itself; if it's missing (e.g. row
    # came from a partial select), look it up.
    if "rating_score" in user_row or "rating_count" in user_row:
        score = user_row.get("rating_score")
        count = user_row.get("rating_count") or 0
    else:
        r = (
            sb.table("app_users")
            .select("rating_score, rating_count")
            .eq("id", user_row["id"])
            .limit(1)
            .execute()
            .data
            or [{}]
        )[0]
        score = r.get("rating_score")
        count = r.get("rating_count") or 0
    rating = {
        "score": float(score) if score is not None else None,
        "count": count,
    }

    return UserResponse(
        id=user_row["id"],
        email=user_row["email"],
        role=user_row["role"],
        onboarded=bool(user_row.get("onboarded")),
        profile=profile,
        business=business,
        rating=rating,
    )


def _issue_auth_token(user_id: str | None, *, meta: dict | None = None) -> str:
    sb = get_supabase()
    token = make_token("auth")
    sb.table("tokens").insert({
        "token": token,
        "user_id": user_id,
        "kind": "auth",
        "meta": meta,
        "expires_at": expiry_from_now(settings.AUTH_TOKEN_TTL),
    }).execute()
    return token


def _revoke_session_token(session_row: dict) -> None:
    """When a session token is exchanged for an auth token, revoke it."""
    if session_row.get("kind") != "session":
        return
    sb = get_supabase()
    sb.table("tokens").update({"revoked": True}).eq("token", session_row["token"]).execute()


# -------------------------------------------------------------------
# POST /auth/signup — requires a session token
# -------------------------------------------------------------------
@router.post("/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest, session=Depends(require_session)) -> TokenResponse:
    email = payload.email.lower().strip()

    if email == settings.ADMIN_EMAIL.lower():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This email is reserved")

    sb = get_supabase()
    existing = sb.table("app_users").select("id").eq("email", email).limit(1).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    insert_res = sb.table("app_users").insert({
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": payload.role,
        "onboarded": False,
    }).execute()
    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Failed to create user")
    user = insert_res.data[0]

    auth_token = _issue_auth_token(user["id"])
    _revoke_session_token(session)

    return TokenResponse(auth_token=auth_token, user=_hydrate_user(user))


# -------------------------------------------------------------------
# POST /auth/signin — requires a session token
# -------------------------------------------------------------------
@router.post("/signin", response_model=TokenResponse)
async def signin(payload: SigninRequest, session=Depends(require_session)) -> TokenResponse:
    email = payload.email.lower().strip()

    # Admin path
    if email == settings.ADMIN_EMAIL.lower():
        if payload.password != settings.ADMIN_PASSWORD:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        auth_token = _issue_auth_token(
            None, meta={"role": "admin", "email": settings.ADMIN_EMAIL}
        )
        _revoke_session_token(session)
        return TokenResponse(
            auth_token=auth_token,
            user=UserResponse(
                id="admin",
                email=settings.ADMIN_EMAIL,
                role="admin",
                onboarded=True,
            ),
        )

    sb = get_supabase()
    res = sb.table("app_users").select("*").eq("email", email).limit(1).execute()
    rows = res.data or []
    if not rows:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user = rows[0]
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    auth_token = _issue_auth_token(user["id"])
    _revoke_session_token(session)

    return TokenResponse(auth_token=auth_token, user=_hydrate_user(user))


# -------------------------------------------------------------------
# GET /auth/me — current authenticated user
# -------------------------------------------------------------------
@router.get("/me", response_model=UserResponse)
async def me(user=Depends(require_auth)) -> UserResponse:
    if user["role"] == "admin":
        return UserResponse(
            id="admin",
            email=user["email"],
            role="admin",
            onboarded=True,
        )
    return _hydrate_user(user)


# -------------------------------------------------------------------
# POST /auth/logout — revoke current auth token
# -------------------------------------------------------------------
@router.post("/logout")
async def logout(user=Depends(require_auth)) -> dict:
    sb = get_supabase()
    sb.table("tokens").update({"revoked": True}).eq("token", user["_token"]).execute()
    return {"ok": True}
