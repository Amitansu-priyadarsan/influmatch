from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import get_supabase
from ..deps import require_auth
from ..models import (
    InfluencerOnboardingRequest,
    OwnerOnboardingRequest,
    UserResponse,
)
from ..routers.auth import _hydrate_user

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("/influencer", response_model=UserResponse)
async def influencer_onboarding(
    payload: InfluencerOnboardingRequest,
    user=Depends(require_auth),
) -> UserResponse:
    if user["role"] != "influencer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Wrong role")

    sb = get_supabase()
    sb.table("influencer_profiles").upsert({
        "user_id": user["id"],
        "full_name": payload.fullName,
        "phone": payload.phone,
        "city": payload.city,
        "bio": payload.bio,
        "niche": payload.niche,
        "niches": payload.niches,
        "platforms": payload.platforms,
        "instagram": payload.instagram,
        "followers": payload.followers,
    }).execute()

    upd = (
        sb.table("app_users")
        .update({"onboarded": True})
        .eq("id", user["id"])
        .execute()
    )
    refreshed = (upd.data or [user])[0]
    return _hydrate_user(refreshed)


@router.post("/owner", response_model=UserResponse)
async def owner_onboarding(
    payload: OwnerOnboardingRequest,
    user=Depends(require_auth),
) -> UserResponse:
    if user["role"] != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Wrong role")

    sb = get_supabase()
    sb.table("owner_profiles").upsert({
        "user_id": user["id"],
        "business": payload.business,
        "city": payload.city,
        "category": payload.category,
        "website": payload.website,
        "phone": payload.phone,
        "budget": payload.budget,
        "description": payload.description,
    }).execute()

    upd = (
        sb.table("app_users")
        .update({"onboarded": True})
        .eq("id", user["id"])
        .execute()
    )
    refreshed = (upd.data or [user])[0]
    return _hydrate_user(refreshed)
