from __future__ import annotations

"""
Negotiation thread on a single application.

POST /applications/{campaign_id}/{influencer_id}/comments
GET  /applications/{campaign_id}/{influencer_id}/comments

Either party (the brand who owns the campaign, or the creator who applied)
can post and read.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import get_supabase
from ..deps import require_auth
from ..models import CommentItem, CommentRequest

router = APIRouter(prefix="/applications/{campaign_id}/{influencer_id}/comments", tags=["comments"])


def _can_view(user: dict, campaign: dict, influencer_id: str) -> bool:
    if user["role"] == "owner" and campaign["owner_id"] == user["id"]:
        return True
    if user["role"] == "influencer" and user["id"] == influencer_id:
        return True
    return user["role"] == "admin"


def _load_thread(campaign_id: str, influencer_id: str) -> list[dict]:
    sb = get_supabase()
    rows = (
        sb.table("application_comments")
        .select("*")
        .eq("campaign_id", campaign_id)
        .eq("influencer_id", influencer_id)
        .order("created_at", desc=False)
        .execute()
        .data
        or []
    )
    if not rows:
        return []
    author_ids = list({r["author_id"] for r in rows})
    authors = (
        sb.table("app_users").select("id, role").in_("id", author_ids).execute().data or []
    )
    role_by_id = {a["id"]: a["role"] for a in authors}
    name_by_id: dict[str, str] = {}
    owner_ids = [a["id"] for a in authors if a["role"] == "owner"]
    inf_ids = [a["id"] for a in authors if a["role"] == "influencer"]
    if owner_ids:
        for o in (sb.table("owner_profiles").select("user_id, business").in_("user_id", owner_ids).execute().data or []):
            name_by_id[o["user_id"]] = o.get("business") or "Brand"
    if inf_ids:
        for i in (sb.table("influencer_profiles").select("user_id, full_name").in_("user_id", inf_ids).execute().data or []):
            name_by_id[i["user_id"]] = i.get("full_name") or "Creator"

    return [
        {
            "id": r["id"],
            "authorId": r["author_id"],
            "authorRole": role_by_id.get(r["author_id"]),
            "authorName": name_by_id.get(r["author_id"]),
            "body": r["body"],
            "createdAt": str(r.get("created_at") or ""),
        }
        for r in rows
    ]


@router.get("", response_model=list[CommentItem])
async def list_comments(campaign_id: str, influencer_id: str, user=Depends(require_auth)):
    sb = get_supabase()
    camp = sb.table("campaigns").select("*").eq("id", campaign_id).limit(1).execute().data or []
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if not _can_view(user, camp[0], influencer_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    # Make sure an application row exists (so the FK is satisfied for posting later).
    app_row = (
        sb.table("applications")
        .select("campaign_id")
        .eq("campaign_id", campaign_id)
        .eq("influencer_id", influencer_id)
        .limit(1)
        .execute()
        .data
        or []
    )
    if not app_row:
        return []
    return _load_thread(campaign_id, influencer_id)


@router.post("", response_model=CommentItem)
async def post_comment(
    campaign_id: str,
    influencer_id: str,
    payload: CommentRequest,
    user=Depends(require_auth),
):
    if user["role"] == "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins cannot post")

    sb = get_supabase()
    camp = sb.table("campaigns").select("*").eq("id", campaign_id).limit(1).execute().data or []
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if not _can_view(user, camp[0], influencer_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    # Application must exist (the FK enforces it, but we want a friendlier error)
    app_row = (
        sb.table("applications")
        .select("campaign_id")
        .eq("campaign_id", campaign_id)
        .eq("influencer_id", influencer_id)
        .limit(1)
        .execute()
        .data
        or []
    )
    if not app_row:
        raise HTTPException(status_code=400, detail="No application yet — creator must apply first")

    inserted = (
        sb.table("application_comments")
        .insert({
            "campaign_id": campaign_id,
            "influencer_id": influencer_id,
            "author_id": user["id"],
            "body": payload.body.strip(),
        })
        .execute()
        .data
        or []
    )
    if not inserted:
        raise HTTPException(status_code=500, detail="Failed to post comment")
    new_id = inserted[0]["id"]
    # Re-load just the new one with author hydration
    return next(c for c in _load_thread(campaign_id, influencer_id) if c["id"] == new_id)
