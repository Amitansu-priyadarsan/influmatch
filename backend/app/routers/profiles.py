from __future__ import annotations

"""
Public profile endpoints — let influencers and brands view each other's
profiles without an application/acceptance step.

    GET  /influencers/{user_id}   any auth user → influencer profile
    GET  /brands                  any auth user → list onboarded brands
    GET  /brands/{user_id}        any auth user → brand profile
"""

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import get_supabase
from ..deps import require_auth
from ..models import PublicBrandProfile, PublicInfluencerProfile

router = APIRouter(tags=["profiles"])


def _influencer_snapshot(p: dict | None) -> dict | None:
    if not p:
        return None
    # Phone is private; never expose to other users.
    return {
        "fullName": p.get("full_name"),
        "city": p.get("city"),
        "bio": p.get("bio"),
        "niche": p.get("niche"),
        "niches": p.get("niches"),
        "platforms": p.get("platforms"),
        "instagram": p.get("instagram"),
        "followers": p.get("followers"),
        "avatarUrl": p.get("avatar_url"),
    }


def _brand_snapshot(p: dict | None) -> dict | None:
    if not p:
        return None
    return {
        "business": p.get("business"),
        "city": p.get("city"),
        "category": p.get("category"),
        "website": p.get("website"),
        "budget": p.get("budget"),
        "description": p.get("description"),
        "avatarUrl": p.get("avatar_url"),
    }


def _rating_for(user_row: dict) -> dict:
    return {
        "score": float(user_row["rating_score"]) if user_row.get("rating_score") is not None else None,
        "count": user_row.get("rating_count") or 0,
    }


@router.get("/influencers/{user_id}", response_model=PublicInfluencerProfile)
async def get_influencer(user_id: str, _user=Depends(require_auth)):
    sb = get_supabase()
    u = (
        sb.table("app_users")
        .select("id, role, onboarded, rating_score, rating_count")
        .eq("id", user_id)
        .limit(1)
        .execute()
        .data
        or []
    )
    if not u or u[0]["role"] != "influencer":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    p = (
        sb.table("influencer_profiles")
        .select("*")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
        .data
        or []
    )
    return PublicInfluencerProfile(
        id=u[0]["id"],
        profile=_influencer_snapshot(p[0] if p else None),
        rating=_rating_for(u[0]),
    )


@router.get("/brands", response_model=list[PublicBrandProfile])
async def list_brands(_user=Depends(require_auth)):
    sb = get_supabase()
    users = (
        sb.table("app_users")
        .select("id, onboarded, rating_score, rating_count")
        .eq("role", "owner")
        .eq("onboarded", True)
        .execute()
        .data
        or []
    )
    if not users:
        return []
    profiles = (
        sb.table("owner_profiles")
        .select("*")
        .in_("user_id", [u["id"] for u in users])
        .execute()
        .data
        or []
    )
    p_by_uid = {p["user_id"]: p for p in profiles}
    return [
        PublicBrandProfile(
            id=u["id"],
            profile=_brand_snapshot(p_by_uid.get(u["id"])),
            rating=_rating_for(u),
        )
        for u in users
    ]


@router.get("/brands/{user_id}", response_model=PublicBrandProfile)
async def get_brand(user_id: str, _user=Depends(require_auth)):
    sb = get_supabase()
    u = (
        sb.table("app_users")
        .select("id, role, onboarded, rating_score, rating_count")
        .eq("id", user_id)
        .limit(1)
        .execute()
        .data
        or []
    )
    if not u or u[0]["role"] != "owner":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    p = (
        sb.table("owner_profiles")
        .select("*")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
        .data
        or []
    )
    return PublicBrandProfile(
        id=u[0]["id"],
        profile=_brand_snapshot(p[0] if p else None),
        rating=_rating_for(u[0]),
    )
