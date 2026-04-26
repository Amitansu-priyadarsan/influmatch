from __future__ import annotations

"""
Direct pitches — creator → brand DM threads.

Distinct from per-campaign application comments. A pitch lives off any
campaign and represents a creator reaching out cold to a brand they'd
like to work with. Once the thread exists, both sides can post.

    POST /pitches/threads             creator only — start (or fetch) thread + first message
    GET  /pitches/threads             list mine (role-aware: my-pitches vs inbox)
    GET  /pitches/threads/{id}        thread detail with messages
    POST /pitches/threads/{id}/messages  post a message (either side)
    POST /pitches/threads/{id}/read   mark thread read for me
"""

from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import get_supabase
from ..deps import require_auth
from ..models import (
    PitchMessage,
    PitchMessageRequest,
    PitchStartRequest,
    PitchThreadDetail,
    PitchThreadSummary,
)

router = APIRouter(prefix="/pitches", tags=["pitches"])


# -------------------------------------------------------------------
# helpers
# -------------------------------------------------------------------

def _msg(row: dict, role_by_id: dict[str, str]) -> PitchMessage:
    created = row.get("created_at") or ""
    return PitchMessage(
        id=row["id"],
        threadId=row["thread_id"],
        authorId=row["author_id"],
        authorRole=role_by_id.get(row["author_id"]),
        body=row["body"],
        createdAt=str(created),
    )


def _influencer_card(user_id: str) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    p = (
        sb.table("influencer_profiles")
        .select("full_name, city, niche, avatar_url, instagram, followers")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
        .data
        or [None]
    )[0]
    if p is None:
        return {"id": user_id}
    return {
        "id": user_id,
        "fullName": p.get("full_name"),
        "city": p.get("city"),
        "niche": p.get("niche"),
        "avatarUrl": p.get("avatar_url"),
        "instagram": p.get("instagram"),
        "followers": p.get("followers"),
    }


def _brand_card(user_id: str) -> Optional[dict[str, Any]]:
    sb = get_supabase()
    p = (
        sb.table("owner_profiles")
        .select("business, city, category, avatar_url")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
        .data
        or [None]
    )[0]
    if p is None:
        return {"id": user_id}
    return {
        "id": user_id,
        "business": p.get("business"),
        "city": p.get("city"),
        "category": p.get("category"),
        "avatarUrl": p.get("avatar_url"),
    }


def _thread_or_404(thread_id: str, user: dict) -> dict:
    sb = get_supabase()
    rows = (
        sb.table("pitch_threads")
        .select("*")
        .eq("id", thread_id)
        .limit(1)
        .execute()
        .data
        or []
    )
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")
    t = rows[0]
    if user["id"] not in (t["influencer_id"], t["brand_id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your thread")
    return t


# -------------------------------------------------------------------
# POST /pitches/threads — creator starts (or resumes) a thread
# -------------------------------------------------------------------
@router.post("/threads", response_model=PitchThreadDetail)
async def start_thread(payload: PitchStartRequest, user=Depends(require_auth)):
    if user["role"] != "influencer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only creators can start a pitch")

    sb = get_supabase()
    brand = (
        sb.table("app_users")
        .select("id, role, onboarded")
        .eq("id", payload.brandId)
        .limit(1)
        .execute()
        .data
        or []
    )
    if not brand or brand[0]["role"] != "owner":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")

    existing = (
        sb.table("pitch_threads")
        .select("*")
        .eq("influencer_id", user["id"])
        .eq("brand_id", payload.brandId)
        .limit(1)
        .execute()
        .data
        or []
    )
    if existing:
        thread = existing[0]
    else:
        ins = (
            sb.table("pitch_threads")
            .insert({"influencer_id": user["id"], "brand_id": payload.brandId})
            .execute()
        )
        if not ins.data:
            raise HTTPException(status_code=500, detail="Could not start pitch")
        thread = ins.data[0]

    # Post the opening message
    msg_ins = (
        sb.table("pitch_messages")
        .insert({"thread_id": thread["id"], "author_id": user["id"], "body": payload.body})
        .execute()
    )
    if not msg_ins.data:
        raise HTTPException(status_code=500, detail="Could not post message")
    msg_row = msg_ins.data[0]

    # bump last_message_at and creator's last_read
    sb.table("pitch_threads").update({
        "last_message_at": msg_row["created_at"],
        "inf_last_read": msg_row["created_at"],
    }).eq("id", thread["id"]).execute()

    return await get_thread(thread["id"], user)  # type: ignore[arg-type]


# -------------------------------------------------------------------
# GET /pitches/threads — list mine (role-aware)
# -------------------------------------------------------------------
@router.get("/threads", response_model=list[PitchThreadSummary])
async def list_threads(user=Depends(require_auth)):
    if user["role"] not in ("influencer", "owner"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    sb = get_supabase()
    field = "influencer_id" if user["role"] == "influencer" else "brand_id"
    threads = (
        sb.table("pitch_threads")
        .select("*")
        .eq(field, user["id"])
        .order("last_message_at", desc=True)
        .execute()
        .data
        or []
    )
    if not threads:
        return []

    thread_ids = [t["id"] for t in threads]

    # Bulk-load latest message per thread (cheap version: load all messages
    # for these threads — pitch volume is low — then group).
    msgs = (
        sb.table("pitch_messages")
        .select("*")
        .in_("thread_id", thread_ids)
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )
    last_by_thread: dict[str, dict] = {}
    msgs_by_thread: dict[str, list[dict]] = {}
    for m in msgs:
        msgs_by_thread.setdefault(m["thread_id"], []).append(m)
        if m["thread_id"] not in last_by_thread:
            last_by_thread[m["thread_id"]] = m

    # Bulk role lookup for message authors (just two roles in this thread set)
    author_ids = list({m["author_id"] for m in msgs})
    role_by_id: dict[str, str] = {}
    if author_ids:
        for u in (sb.table("app_users").select("id, role").in_("id", author_ids).execute().data or []):
            role_by_id[u["id"]] = u["role"]

    out: list[PitchThreadSummary] = []
    for t in threads:
        last_read_field = "inf_last_read" if user["role"] == "influencer" else "brand_last_read"
        last_read = t.get(last_read_field)
        # unread = number of messages in this thread by the OTHER party newer than my last_read
        unread = 0
        for m in msgs_by_thread.get(t["id"], []):
            if m["author_id"] == user["id"]:
                continue
            if last_read is None or (m["created_at"] or "") > last_read:
                unread += 1

        if user["role"] == "influencer":
            counterparty = _brand_card(t["brand_id"])
        else:
            counterparty = _influencer_card(t["influencer_id"])

        last = last_by_thread.get(t["id"])
        out.append(PitchThreadSummary(
            id=t["id"],
            influencerId=t["influencer_id"],
            brandId=t["brand_id"],
            createdAt=str(t["created_at"]),
            lastMessageAt=str(t["last_message_at"]),
            unreadCount=unread,
            counterparty=counterparty,
            lastMessage=_msg(last, role_by_id) if last else None,
        ))
    return out


# -------------------------------------------------------------------
# GET /pitches/threads/{id} — full thread
# -------------------------------------------------------------------
@router.get("/threads/{thread_id}", response_model=PitchThreadDetail)
async def get_thread(thread_id: str, user=Depends(require_auth)):
    t = _thread_or_404(thread_id, user)
    sb = get_supabase()

    msg_rows = (
        sb.table("pitch_messages")
        .select("*")
        .eq("thread_id", thread_id)
        .order("created_at", desc=False)
        .execute()
        .data
        or []
    )
    author_ids = list({m["author_id"] for m in msg_rows})
    role_by_id: dict[str, str] = {}
    if author_ids:
        for u in (sb.table("app_users").select("id, role").in_("id", author_ids).execute().data or []):
            role_by_id[u["id"]] = u["role"]

    if user["role"] == "influencer":
        counterparty = _brand_card(t["brand_id"])
    else:
        counterparty = _influencer_card(t["influencer_id"])

    return PitchThreadDetail(
        id=t["id"],
        influencerId=t["influencer_id"],
        brandId=t["brand_id"],
        createdAt=str(t["created_at"]),
        lastMessageAt=str(t["last_message_at"]),
        counterparty=counterparty,
        messages=[_msg(m, role_by_id) for m in msg_rows],
    )


# -------------------------------------------------------------------
# POST /pitches/threads/{id}/messages — both sides may post
# -------------------------------------------------------------------
@router.post("/threads/{thread_id}/messages", response_model=PitchMessage)
async def post_message(thread_id: str, payload: PitchMessageRequest, user=Depends(require_auth)):
    t = _thread_or_404(thread_id, user)
    sb = get_supabase()
    ins = (
        sb.table("pitch_messages")
        .insert({"thread_id": t["id"], "author_id": user["id"], "body": payload.body})
        .execute()
    )
    if not ins.data:
        raise HTTPException(status_code=500, detail="Could not post message")
    row = ins.data[0]

    # bump last_message_at and the author's last_read
    last_read_field = "inf_last_read" if user["role"] == "influencer" else "brand_last_read"
    sb.table("pitch_threads").update({
        "last_message_at": row["created_at"],
        last_read_field: row["created_at"],
    }).eq("id", t["id"]).execute()

    return _msg(row, {user["id"]: user["role"]})


# -------------------------------------------------------------------
# POST /pitches/threads/{id}/read — mark thread read for me
# -------------------------------------------------------------------
@router.post("/threads/{thread_id}/read")
async def mark_read(thread_id: str, user=Depends(require_auth)):
    t = _thread_or_404(thread_id, user)
    sb = get_supabase()
    field = "inf_last_read" if user["role"] == "influencer" else "brand_last_read"
    sb.table("pitch_threads").update({field: t["last_message_at"]}).eq("id", t["id"]).execute()
    return {"ok": True}
