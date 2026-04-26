from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, EmailStr, Field

Role = Literal["influencer", "owner", "admin"]
CampaignStatus = Literal["open", "active", "submitted", "closed"]
AppStatus = Literal["pending", "accepted", "rejected"]
CompensationType = Literal["cash", "barter", "mixed"]


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

class RatingSummary(BaseModel):
    score: Optional[float] = None  # null until first rating
    count: int = 0


class UserResponse(BaseModel):
    id: str
    email: str
    role: Role
    onboarded: bool
    profile: Optional[dict[str, Any]] = None
    business: Optional[str] = None
    rating: Optional[RatingSummary] = None


class InfluencerListItem(BaseModel):
    id: str
    email: str
    onboarded: bool
    profile: Optional[dict[str, Any]] = None
    rating: Optional[RatingSummary] = None


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
    avatarUrl: Optional[str] = ""
    gallery: Optional[list[str]] = None


class OwnerOnboardingRequest(BaseModel):
    business: str
    city: str
    category: str
    website: Optional[str] = ""
    phone: Optional[str] = ""
    budget: Optional[str] = ""
    description: Optional[str] = ""
    avatarUrl: Optional[str] = ""
    gallery: Optional[list[str]] = None


# ----- Public profiles -----

class PublicInfluencerProfile(BaseModel):
    id: str
    profile: Optional[dict[str, Any]] = None
    rating: Optional[RatingSummary] = None


class PublicBrandProfile(BaseModel):
    id: str
    profile: Optional[dict[str, Any]] = None
    rating: Optional[RatingSummary] = None


# ----- Campaigns -----

class CampaignCreateRequest(BaseModel):
    title: str
    offer: str
    promoCode: str
    startDate: str
    endDate: str
    compensationType: CompensationType = "cash"
    priceMin: Optional[int] = None
    priceMax: Optional[int] = None
    barterDescription: Optional[str] = ""
    barterValue: Optional[int] = None


class ApplyRequest(BaseModel):
    message: Optional[str] = ""
    proposedPrice: Optional[int] = None
    proposedNote: Optional[str] = ""


class SubmitPostRequest(BaseModel):
    postLink: str


class CommentRequest(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class CommentItem(BaseModel):
    id: str
    authorId: str
    authorRole: Optional[str] = None
    authorName: Optional[str] = None
    body: str
    createdAt: str


class ApplicationItem(BaseModel):
    influencerId: str
    status: AppStatus
    message: Optional[str] = None
    proposedPrice: Optional[int] = None
    proposedNote: Optional[str] = None
    appliedAt: str
    creator: Optional[dict[str, Any]] = None
    comments: Optional[list[CommentItem]] = None


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
    compensationType: CompensationType = "cash"
    priceMin: Optional[int] = None
    priceMax: Optional[int] = None
    barterDescription: Optional[str] = None
    barterValue: Optional[int] = None
    applications: list[ApplicationItem] = []


# ----- Ratings -----

class RatingRequest(BaseModel):
    campaignId: str
    score: int = Field(ge=1, le=5)
    comment: Optional[str] = ""


class RatingItem(BaseModel):
    id: str
    campaignId: str
    fromUserId: str
    toUserId: str
    score: int
    comment: Optional[str] = None
    createdAt: str


TokenResponse.model_rebuild()
