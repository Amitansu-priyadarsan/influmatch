from __future__ import annotations

"""
Mutual ratings between brand and creator after a campaign is delivered.

A rating is allowed only if:
  • The campaign status is 'submitted' or 'closed'
  • The rater is one of the two parties (brand owner OR assigned creator)
  • They are rating the OTHER party
  • They haven't already rated that party for that campaign

After insert, we recompute the recipient's cached aggregate score on
`app_users` using the time-decayed Bayesian formula in ratings_calc.py.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import get_supabase
from ..deps import require_auth
from ..models import RatingItem, RatingRequest
from ..ratings_calc import aggregate

router = APIRouter(prefix="/ratings", tags=["ratings"])


def _recompute_user_rating(user_id: str) -> tuple[Optional[float], int]:
    sb = get_supabase()
    rows = (
        sb.table("ratings")
        .select("score, created_at")
        .eq("to_user_id", user_id)
        .execute()
        .data
        or []
    )
    score, count = aggregate(rows)
    sb.table("app_users").update({
        "rating_score": score,
        "rating_count": count,
        "rating_updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", user_id).execute()
    return score, count


def _to_camel(row: dict) -> dict:
    return {
        "id": row["id"],
        "campaignId": row["campaign_id"],
        "fromUserId": row["from_user_id"],
        "toUserId": row["to_user_id"],
        "score": row["score"],
        "comment": row.get("comment"),
        "createdAt": str(row.get("created_at") or ""),
    }


@router.post("", response_model=RatingItem)
async def create_rating(payload: RatingRequest, user=Depends(require_auth)):
    if user["role"] == "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins cannot rate")

    sb = get_supabase()
    camp_rows = (
        sb.table("campaigns")
        .select("*")
        .eq("id", payload.campaignId)
        .limit(1)
        .execute()
        .data
        or []
    )
    if not camp_rows:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign = camp_rows[0]

    if campaign["status"] not in ("submitted", "closed"):
        raise HTTPException(
            status_code=400,
            detail="You can rate only after the post has been submitted",
        )

    owner_id = campaign["owner_id"]
    creator_id = campaign.get("assigned_influencer_id")
    if not creator_id:
        raise HTTPException(status_code=400, detail="No creator assigned to this campaign")

    # Determine the rater → ratee pairing
    if user["id"] == owner_id and user["role"] == "owner":
        to_user_id = creator_id
    elif user["id"] == creator_id and user["role"] == "influencer":
        to_user_id = owner_id
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not part of this deal")

    # One rating per (campaign, from, to)
    existing = (
        sb.table("ratings")
        .select("id")
        .eq("campaign_id", payload.campaignId)
        .eq("from_user_id", user["id"])
        .eq("to_user_id", to_user_id)
        .limit(1)
        .execute()
        .data
        or []
    )
    if existing:
        raise HTTPException(status_code=409, detail="You've already rated this user for this campaign")

    inserted = (
        sb.table("ratings")
        .insert({
            "campaign_id": payload.campaignId,
            "from_user_id": user["id"],
            "to_user_id": to_user_id,
            "score": payload.score,
            "comment": (payload.comment or "").strip() or None,
        })
        .execute()
        .data
        or []
    )
    if not inserted:
        raise HTTPException(status_code=500, detail="Failed to save rating")

    _recompute_user_rating(to_user_id)
    return _to_camel(inserted[0])


@router.get("/user/{user_id}", response_model=list[RatingItem])
async def list_ratings_for_user(user_id: str, user=Depends(require_auth)):
    sb = get_supabase()
    rows = (
        sb.table("ratings")
        .select("*")
        .eq("to_user_id", user_id)
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )
    return [_to_camel(r) for r in rows]


@router.get("/given-by-me/{campaign_id}", response_model=list[RatingItem])
async def list_my_ratings_for_campaign(campaign_id: str, user=Depends(require_auth)):
    """Used by the frontend to know if I've already rated for this campaign."""
    sb = get_supabase()
    rows = (
        sb.table("ratings")
        .select("*")
        .eq("campaign_id", campaign_id)
        .eq("from_user_id", user["id"])
        .execute()
        .data
        or []
    )
    return [_to_camel(r) for r in rows]
