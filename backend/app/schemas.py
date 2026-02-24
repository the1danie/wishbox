from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


# Auth
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Wishlists
class WishlistCreate(BaseModel):
    title: str
    description: Optional[str] = None
    cover_emoji: Optional[str] = "🎁"
    is_public: bool = True


class WishlistUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_emoji: Optional[str] = None
    is_public: Optional[bool] = None


class WishlistOut(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    cover_emoji: Optional[str] = None
    slug: str
    is_public: bool
    created_at: datetime
    updated_at: datetime
    item_count: int = 0

    class Config:
        from_attributes = True


# Items
class ItemCreate(BaseModel):
    name: str
    url: Optional[str] = None
    price: Optional[Decimal] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    priority: int = 2
    is_group_gift: bool = False
    target_amount: Optional[Decimal] = None


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    price: Optional[Decimal] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    is_group_gift: Optional[bool] = None
    target_amount: Optional[Decimal] = None


class ContributionInfo(BaseModel):
    contributor_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class ItemOut(BaseModel):
    id: str
    wishlist_id: str
    name: str
    url: Optional[str] = None
    price: Optional[Decimal] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    priority: int
    is_group_gift: bool
    target_amount: Optional[Decimal] = None
    is_deleted: bool
    created_at: datetime
    # Reservation info (no names for wishlist owner)
    is_reserved: bool = False
    # Contribution info (total only, no names for wishlist owner)
    total_contributed: Decimal = Decimal("0")
    contributors_count: int = 0
    contributors: list[ContributionInfo] = []

    class Config:
        from_attributes = True


class WishlistWithItems(WishlistOut):
    items: list[ItemOut] = []
    owner_name: str = ""

    class Config:
        from_attributes = True


# Reservations
class ReserveItem(BaseModel):
    reserver_name: str
    reserver_email: Optional[str] = None


class ReservationOut(BaseModel):
    id: str
    item_id: str
    reserver_name: str
    created_at: datetime

    class Config:
        from_attributes = True


# Contributions
class ContributeToItem(BaseModel):
    contributor_name: str
    contributor_email: Optional[str] = None
    amount: Decimal

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class ContributionOut(BaseModel):
    id: str
    item_id: str
    contributor_name: str
    amount: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


# URL Scraper
class ScrapeResult(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
