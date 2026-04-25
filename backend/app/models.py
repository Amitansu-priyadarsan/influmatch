from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, EmailStr, Field

Role = Literal["influencer", "owner", "admin"]
CampaignStatus = Literal["open", "active", "submitted", "closed"]
AppStatus = Literal["pending", "accepted", "rejected"]


# ----- Auth -----

class SignupRequest(BaseModel):
    role: Literal["influencer", "owner"]
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: Optional[str] = None


class SigninRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    auth_token: str
    user: "UserResponse"


class SessionResponse(BaseModel):
    session_token: str
    expires_at: str


# ----- User -----

class UserResponse(BaseModel):
    id: str
    email: str
    role: Role
    onboarded: bool
    profile: Optional[dict[str, Any]] = None
    business: Optional[str] = None


class InfluencerListItem(BaseModel):
    id: str
    email: str
    onboarded: bool
    profile: Optional[dict[str, Any]] = None


# ----- Onboarding -----

class InfluencerOnboardingRequest(BaseModel):
    fullName: str
    phone: str
    city: str
    bio: Optional[str] = ""
    niche: Optional[str] = ""
    niches: Optional[list[str]] = None
    platforms: Optional[dict[str, Any]] = None
    instagram: Optional[str] = ""
    followers: Optional[str] = ""


class OwnerOnboardingRequest(BaseModel):
    business: str
    city: str
    category: str
    website: Optional[str] = ""
    phone: Optional[str] = ""
    budget: Optional[str] = ""
    description: Optional[str] = ""


# ----- Campaigns -----

class CampaignCreateRequest(BaseModel):
    title: str
    offer: str
    promoCode: str
    startDate: str  # ISO date YYYY-MM-DD
    endDate: str


class ApplyRequest(BaseModel):
    message: Optional[str] = ""


class SubmitPostRequest(BaseModel):
    postLink: str


class ApplicationItem(BaseModel):
    influencerId: str
    status: AppStatus
    message: Optional[str] = None
    appliedAt: str
    creator: Optional[dict[str, Any]] = None  # influencer profile snapshot


class CampaignItem(BaseModel):
    id: str
    ownerId: str
    title: str
    brand: Optional[str] = None
    offer: str
    promoCode: str
    startDate: str
    endDate: str
    status: CampaignStatus
    assignedInfluencer: Optional[str] = None
    submittedPost: Optional[str] = None
    applications: list[ApplicationItem] = []


TokenResponse.model_rebuild()
