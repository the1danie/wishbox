import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Boolean, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wishlists = relationship("Wishlist", back_populates="owner", cascade="all, delete-orphan")


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    cover_emoji = Column(String(10), nullable=True, default="🎁")
    slug = Column(String(100), unique=True, nullable=False, index=True)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="wishlists")
    items = relationship("Item", back_populates="wishlist", cascade="all, delete-orphan")


class Item(Base):
    __tablename__ = "items"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    wishlist_id = Column(UUID(as_uuid=False), ForeignKey("wishlists.id"), nullable=False)
    name = Column(String(300), nullable=False)
    url = Column(Text, nullable=True)
    price = Column(Numeric(12, 2), nullable=True)
    image_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    priority = Column(Integer, default=2)  # 1=low, 2=medium, 3=high
    is_group_gift = Column(Boolean, default=False)  # allow multiple contributions
    target_amount = Column(Numeric(12, 2), nullable=True)  # for group gifts
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wishlist = relationship("Wishlist", back_populates="items")
    reservation = relationship("Reservation", back_populates="item", uselist=False, cascade="all, delete-orphan")
    contributions = relationship("Contribution", back_populates="item", cascade="all, delete-orphan")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    item_id = Column(UUID(as_uuid=False), ForeignKey("items.id"), nullable=False, unique=True)
    reserver_name = Column(String(100), nullable=False)
    reserver_email = Column(String(255), nullable=True)
    reserver_user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    is_cancelled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("Item", back_populates="reservation")


class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    item_id = Column(UUID(as_uuid=False), ForeignKey("items.id"), nullable=False)
    contributor_name = Column(String(100), nullable=False)
    contributor_email = Column(String(255), nullable=True)
    contributor_user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("Item", back_populates="contributions")
