from __future__ import annotations

"""
Campaigns + applications.

Brand-owner endpoints:
    POST   /campaigns                           create
    GET    /campaigns                           list (role-aware: see below)
    POST   /campaigns/{cid}/accept/{inf_id}     accept an applicant (also assigns)
    POST   /campaigns/{cid}/reject/{inf_id}     reject an applicant
    POST   /campaigns/{cid}/assign/{inf_id}     direct-assign without an application
    GET    /influencers                         list onboarded creators

Creator endpoints:
    GET    /campaigns                           list (open + assigned-to-me)
    POST   /campaigns/{cid}/apply               apply
    POST   /campaigns/{cid}/submit-post         submit live post link
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import get_supabase
from ..deps import require_auth
from ..models import (
    ApplyRequest,
    CampaignCreateRequest,
    CampaignItem,
    InfluencerListItem,
    SubmitPostRequest,
)

router = APIRouter(tags=["campaigns"])


# -------------------------------------------------------------------
# helpers
# -------------------------------------------------------------------

def _camel_campaign(row: dict, applications: list[dict]) -> dict:
    return {
        "id": row["id"],
        "ownerId": row["owner_id"],
        "title": row["title"],
        "brand": row.get("brand"),
        "offer": row["offer"],
        "promoCode": row["promo_code"],
        "startDate": str(row["start_date"]) if row.get("start_date") else "",
        "endDate": str(row["end_date"]) if row.get("end_date") else "",
        "status": row["status"],
        "assignedInfluencer": row.get("assigned_influencer_id"),
        "submittedPost": row.get("submitted_post"),
        "compensationType": row.get("compensation_type") or "cash",
        "priceMin": row.get("price_min"),
        "priceMax": row.get("price_max"),
        "barterDescription": row.get("barter_description"),
        "barterValue": row.get("barter_value"),
        "applications": applications,
    }


def _camel_application(row: dict, creator: Optional[dict], comments: Optional[list[dict]] = None) -> dict:
    applied_at = row.get("applied_at") or ""
    if isinstance(applied_at, str) and "T" in applied_at:
        applied_at = applied_at.split("T", 1)[0]
    return {
        "influencerId": row["influencer_id"],
        "status": row["status"],
        "message": row.get("message") or "",
        "proposedPrice": row.get("proposed_price"),
        "proposedNote": row.get("proposed_note"),
        "appliedAt": applied_at,
        "creator": creator,
        "comments": comments,
    }


def _profile_snapshot(profile: Optional[dict]) -> Optional[dict]:
    """Brand-facing creator snapshot.

    Phone is intentionally **omitted** — phone numbers are private and
    must never reach a brand. The influencer still sees their own phone
    via `/auth/me` (handled separately in `auth.py`).
    """
    if not profile:
        return None
    return {
        "fullName": profile.get("full_name"),
        "city": profile.get("city"),
        "bio": profile.get("bio"),
        "niche": profile.get("niche"),
        "niches": profile.get("niches"),
        "platforms": profile.get("platforms"),
        "instagram": profile.get("instagram"),
        "followers": profile.get("followers"),
        "avatarUrl": profile.get("avatar_url"),
        "gallery": profile.get("gallery") or [],
    }


def _load_creator_profiles(influencer_ids: list[str]) -> dict[str, dict]:
    """Bulk-load { influencer_id -> { id, email, profile, rating } }."""
    if not influencer_ids:
        return {}
    sb = get_supabase()
    users = (
        sb.table("app_users")
        .select("id, email, rating_score, rating_count")
        .in_("id", influencer_ids)
        .execute()
        .data
        or []
    )
    profiles = (
        sb.table("influencer_profiles")
        .select("*")
        .in_("user_id", influencer_ids)
        .execute()
        .data
        or []
    )
    p_by_uid = {p["user_id"]: p for p in profiles}
    out: dict[str, dict] = {}
    for u in users:
        out[u["id"]] = {
            "id": u["id"],
            "email": u["email"],
            "profile": _profile_snapshot(p_by_uid.get(u["id"])),
            "rating": {
                "score": float(u["rating_score"]) if u.get("rating_score") is not None else None,
                "count": u.get("rating_count") or 0,
            },
        }
    return out


def _load_comments_for(campaign_ids: list[str]) -> dict[tuple[str, str], list[dict]]:
    """Bulk-load comments grouped by (campaign_id, influencer_id)."""
    if not campaign_ids:
        return {}
    sb = get_supabase()
    rows = (
        sb.table("application_comments")
        .select("*")
        .in_("campaign_id", campaign_ids)
        .order("created_at", desc=False)
        .execute()
        .data
        or []
    )
    if not rows:
        return {}
    author_ids = list({r["author_id"] for r in rows})
    authors = (
        sb.table("app_users")
        .select("id, role")
        .in_("id", author_ids)
        .execute()
        .data
        or []
    )
    role_by_id = {a["id"]: a["role"] for a in authors}

    # owner display names
    owner_ids = [a["id"] for a in authors if a["role"] == "owner"]
    inf_ids = [a["id"] for a in authors if a["role"] == "influencer"]
    name_by_id: dict[str, str] = {}
    if owner_ids:
        for o in (sb.table("owner_profiles").select("user_id, business").in_("user_id", owner_ids).execute().data or []):
            name_by_id[o["user_id"]] = o.get("business") or "Brand"
    if inf_ids:
        for i in (sb.table("influencer_profiles").select("user_id, full_name").in_("user_id", inf_ids).execute().data or []):
            name_by_id[i["user_id"]] = i.get("full_name") or "Creator"

    grouped: dict[tuple[str, str], list[dict]] = {}
    for r in rows:
        created = r.get("created_at") or ""
        if isinstance(created, str) and "T" in created:
            created = created  # keep ISO
        item = {
            "id": r["id"],
            "authorId": r["author_id"],
            "authorRole": role_by_id.get(r["author_id"]),
            "authorName": name_by_id.get(r["author_id"]),
            "body": r["body"],
            "createdAt": str(created),
        }
        grouped.setdefault((r["campaign_id"], r["influencer_id"]), []).append(item)
    return grouped


# -------------------------------------------------------------------
# POST /campaigns — owner creates
# -------------------------------------------------------------------
@router.post("/campaigns", response_model=CampaignItem)
async def create_campaign(payload: CampaignCreateRequest, user=Depends(require_auth)):
    if user["role"] != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only brands can create campaigns")

    sb = get_supabase()
    owner_profile = (
        sb.table("owner_profiles")
        .select("business")
        .eq("user_id", user["id"])
        .limit(1)
        .execute()
        .data
        or [{}]
    )[0]

    res = sb.table("campaigns").insert({
        "owner_id": user["id"],
        "title": payload.title,
        "brand": owner_profile.get("business"),
        "offer": payload.offer,
        "promo_code": payload.promoCode,
        "start_date": payload.startDate,
        "end_date": payload.endDate,
        "status": "open",
        "compensation_type": payload.compensationType,
        "price_min": payload.priceMin,
        "price_max": payload.priceMax,
        "barter_description": payload.barterDescription or None,
        "barter_value": payload.barterValue,
    }).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create campaign")
    return _camel_campaign(res.data[0], [])


# -------------------------------------------------------------------
# GET /campaigns — role-aware list
#
#   owner       → only campaigns they own, with FULL applications inline
#                 (each application has the creator's profile snapshot)
#   influencer  → all open campaigns + campaigns assigned to them.
#                 applications inline contains ONLY the influencer's own
#                 application (so they can see status), no creator snapshot
#   admin       → everything (no app filtering)
# -------------------------------------------------------------------
@router.get("/campaigns", response_model=list[CampaignItem])
async def list_campaigns(user=Depends(require_auth)):
    sb = get_supabase()

    # 1. fetch the campaign rows visible to this user
    if user["role"] == "owner":
        camp_rows = (
            sb.table("campaigns")
            .select("*")
            .eq("owner_id", user["id"])
            .order("created_at", desc=True)
            .execute()
            .data
            or []
        )
    elif user["role"] == "influencer":
        # Two queries: open campaigns + campaigns assigned to me. Merge.
        open_rows = (
            sb.table("campaigns")
            .select("*")
            .eq("status", "open")
            .order("created_at", desc=True)
            .execute()
            .data
            or []
        )
        assigned_rows = (
            sb.table("campaigns")
            .select("*")
            .eq("assigned_influencer_id", user["id"])
            .execute()
            .data
            or []
        )
        seen = set()
        camp_rows = []
        for r in open_rows + assigned_rows:
            if r["id"] in seen:
                continue
            seen.add(r["id"])
            camp_rows.append(r)
    else:  # admin
        camp_rows = (
            sb.table("campaigns")
            .select("*")
            .order("created_at", desc=True)
            .execute()
            .data
            or []
        )

    if not camp_rows:
        return []

    campaign_ids = [c["id"] for c in camp_rows]

    # 2. fetch applications for those campaigns
    if user["role"] == "influencer":
        apps_query = (
            sb.table("applications")
            .select("*")
            .in_("campaign_id", campaign_ids)
            .eq("influencer_id", user["id"])
        )
    else:
        apps_query = sb.table("applications").select("*").in_("campaign_id", campaign_ids)
    app_rows = apps_query.execute().data or []

    # 3. for owner/admin, hydrate each application with the creator's profile
    creators: dict[str, dict] = {}
    if user["role"] in ("owner", "admin") and app_rows:
        creators = _load_creator_profiles(list({a["influencer_id"] for a in app_rows}))

    # 4. load comments for everyone (both sides see the thread)
    comments_by_thread = _load_comments_for(campaign_ids) if app_rows else {}

    # 5. group apps by campaign
    apps_by_camp: dict[str, list[dict]] = {}
    for a in app_rows:
        creator = creators.get(a["influencer_id"]) if user["role"] in ("owner", "admin") else None
        comments = comments_by_thread.get((a["campaign_id"], a["influencer_id"]), [])
        apps_by_camp.setdefault(a["campaign_id"], []).append(
            _camel_application(a, creator, comments)
        )

    return [_camel_campaign(c, apps_by_camp.get(c["id"], [])) for c in camp_rows]


# -------------------------------------------------------------------
# Campaign actions
# -------------------------------------------------------------------

def _get_campaign_or_404(campaign_id: str) -> dict:
    sb = get_supabase()
    res = sb.table("campaigns").select("*").eq("id", campaign_id).limit(1).execute()
    rows = res.data or []
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return rows[0]


def _ensure_owner(campaign: dict, user: dict) -> None:
    if user["role"] != "owner" or campaign["owner_id"] != user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your campaign")


@router.post("/campaigns/{campaign_id}/apply", response_model=CampaignItem)
async def apply_to_campaign(
    campaign_id: str,
    payload: ApplyRequest,
    user=Depends(require_auth),
):
    if user["role"] != "influencer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only creators can apply")
    campaign = _get_campaign_or_404(campaign_id)
    if campaign["status"] != "open":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Campaign is not open for applications")

    sb = get_supabase()
    sb.table("applications").upsert({
        "campaign_id": campaign_id,
        "influencer_id": user["id"],
        "status": "pending",
        "message": payload.message or "",
        "proposed_price": payload.proposedPrice,
        "proposed_note": payload.proposedNote or None,
    }, on_conflict="campaign_id,influencer_id").execute()

    fresh = _get_campaign_or_404(campaign_id)
    apps = (
        sb.table("applications")
        .select("*")
        .eq("campaign_id", campaign_id)
        .eq("influencer_id", user["id"])
        .execute()
        .data
        or []
    )
    return _camel_campaign(fresh, [_camel_application(a, None) for a in apps])


@router.post("/campaigns/{campaign_id}/accept/{influencer_id}", response_model=CampaignItem)
async def accept_application(campaign_id: str, influencer_id: str, user=Depends(require_auth)):
    campaign = _get_campaign_or_404(campaign_id)
    _ensure_owner(campaign, user)

    if campaign.get("assigned_influencer_id") and campaign["assigned_influencer_id"] != influencer_id:
        raise HTTPException(
            status_code=409,
            detail="A creator is already assigned. Unassign them first to pick someone else.",
        )

    sb = get_supabase()
    # Mark the chosen one accepted, reject all other pending ones.
    sb.table("applications").update({"status": "accepted"}).eq("campaign_id", campaign_id).eq(
        "influencer_id", influencer_id
    ).execute()
    sb.table("applications").update({"status": "rejected"}).eq("campaign_id", campaign_id).eq(
        "status", "pending"
    ).neq("influencer_id", influencer_id).execute()
    sb.table("campaigns").update({
        "status": "active",
        "assigned_influencer_id": influencer_id,
        "updated_at": "now()",
    }).eq("id", campaign_id).execute()

    return await _get_owner_campaign(campaign_id)


@router.post("/campaigns/{campaign_id}/reject/{influencer_id}", response_model=CampaignItem)
async def reject_application(campaign_id: str, influencer_id: str, user=Depends(require_auth)):
    campaign = _get_campaign_or_404(campaign_id)
    _ensure_owner(campaign, user)

    sb = get_supabase()
    sb.table("applications").update({"status": "rejected"}).eq("campaign_id", campaign_id).eq(
        "influencer_id", influencer_id
    ).execute()
    return await _get_owner_campaign(campaign_id)


@router.post("/campaigns/{campaign_id}/assign/{influencer_id}", response_model=CampaignItem)
async def assign_directly(campaign_id: str, influencer_id: str, user=Depends(require_auth)):
    campaign = _get_campaign_or_404(campaign_id)
    _ensure_owner(campaign, user)

    if campaign.get("assigned_influencer_id") and campaign["assigned_influencer_id"] != influencer_id:
        raise HTTPException(
            status_code=409,
            detail="A creator is already assigned. Unassign them first.",
        )

    sb = get_supabase()
    # Insert (or upsert) an accepted application for this influencer.
    sb.table("applications").upsert({
        "campaign_id": campaign_id,
        "influencer_id": influencer_id,
        "status": "accepted",
        "message": "",
    }, on_conflict="campaign_id,influencer_id").execute()
    # Reject any other pending applications.
    sb.table("applications").update({"status": "rejected"}).eq("campaign_id", campaign_id).eq(
        "status", "pending"
    ).neq("influencer_id", influencer_id).execute()
    sb.table("campaigns").update({
        "status": "active",
        "assigned_influencer_id": influencer_id,
    }).eq("id", campaign_id).execute()
    return await _get_owner_campaign(campaign_id)


@router.post("/campaigns/{campaign_id}/unassign", response_model=CampaignItem)
async def unassign(campaign_id: str, user=Depends(require_auth)):
    """
    Free up a campaign slot.

    Reverts the campaign to 'open', clears the assigned creator, and resets
    every application on this campaign back to 'pending' so the brand has
    the full pool to choose from again.
    """
    campaign = _get_campaign_or_404(campaign_id)
    _ensure_owner(campaign, user)

    if campaign["status"] in ("submitted", "closed"):
        raise HTTPException(
            status_code=400,
            detail="Cannot unassign — the creator has already submitted the post.",
        )
    if not campaign.get("assigned_influencer_id"):
        raise HTTPException(status_code=400, detail="No creator is currently assigned.")

    sb = get_supabase()
    sb.table("applications").update({"status": "pending"}).eq("campaign_id", campaign_id).execute()
    sb.table("campaigns").update({
        "status": "open",
        "assigned_influencer_id": None,
    }).eq("id", campaign_id).execute()
    return await _get_owner_campaign(campaign_id)


@router.post("/campaigns/{campaign_id}/submit-post", response_model=CampaignItem)
async def submit_post(campaign_id: str, payload: SubmitPostRequest, user=Depends(require_auth)):
    campaign = _get_campaign_or_404(campaign_id)
    if user["role"] != "influencer" or campaign.get("assigned_influencer_id") != user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your campaign")

    sb = get_supabase()
    sb.table("campaigns").update({
        "status": "submitted",
        "submitted_post": payload.postLink,
    }).eq("id", campaign_id).execute()

    fresh = _get_campaign_or_404(campaign_id)
    apps = (
        sb.table("applications")
        .select("*")
        .eq("campaign_id", campaign_id)
        .eq("influencer_id", user["id"])
        .execute()
        .data
        or []
    )
    return _camel_campaign(fresh, [_camel_application(a, None) for a in apps])


async def _get_owner_campaign(campaign_id: str) -> dict:
    """Return a fully-hydrated campaign for the owner view."""
    sb = get_supabase()
    fresh = _get_campaign_or_404(campaign_id)
    apps = (
        sb.table("applications")
        .select("*")
        .eq("campaign_id", campaign_id)
        .execute()
        .data
        or []
    )
    creators = _load_creator_profiles(list({a["influencer_id"] for a in apps}))
    comments_by_thread = _load_comments_for([campaign_id])
    return _camel_campaign(
        fresh,
        [
            _camel_application(
                a,
                creators.get(a["influencer_id"]),
                comments_by_thread.get((campaign_id, a["influencer_id"]), []),
            )
            for a in apps
        ],
    )


# -------------------------------------------------------------------
# GET /influencers — onboarded creators (for the Assign-directly modal)
# -------------------------------------------------------------------
@router.get("/influencers", response_model=list[InfluencerListItem])
async def list_influencers(user=Depends(require_auth)):
    if user["role"] not in ("owner", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    sb = get_supabase()
    users = (
        sb.table("app_users")
        .select("id, email, onboarded, rating_score, rating_count")
        .eq("role", "influencer")
        .eq("onboarded", True)
        .execute()
        .data
        or []
    )
    if not users:
        return []
    profiles = (
        sb.table("influencer_profiles")
        .select("*")
        .in_("user_id", [u["id"] for u in users])
        .execute()
        .data
        or []
    )
    p_by_uid = {p["user_id"]: p for p in profiles}
    return [
        {
            "id": u["id"],
            "email": u["email"],
            "onboarded": u["onboarded"],
            "profile": _profile_snapshot(p_by_uid.get(u["id"])),
            "rating": {
                "score": float(u["rating_score"]) if u.get("rating_score") is not None else None,
                "count": u.get("rating_count") or 0,
            },
        }
        for u in users
    ]
