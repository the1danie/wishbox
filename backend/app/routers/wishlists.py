import re
import uuid
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from ..database import get_db
from ..auth import require_user, get_current_user

router = APIRouter(prefix="/wishlists", tags=["wishlists"])


def make_slug(title: str, db: Session) -> str:
    base = re.sub(r"[^a-zA-Zа-яА-Я0-9\s]", "", title).strip()
    base = re.sub(r"\s+", "-", base).lower()
    # transliterate basic cyrillic
    cyr_map = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo",
        "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
        "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
        "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
        "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    }
    slug = "".join(cyr_map.get(c, c) for c in base)
    slug = re.sub(r"-+", "-", slug).strip("-")[:50] or "wishlist"

    # ensure uniqueness
    candidate = slug
    counter = 1
    while db.query(models.Wishlist).filter(models.Wishlist.slug == candidate).first():
        candidate = f"{slug}-{counter}"
        counter += 1
    return candidate


def build_item_out(item: models.Item, is_owner: bool) -> schemas.ItemOut:
    total = sum(c.amount for c in item.contributions) if item.contributions else Decimal("0")
    contributors = [
        schemas.ContributionInfo(contributor_name=c.contributor_name, created_at=c.created_at)
        for c in item.contributions
    ] if not is_owner else []

    return schemas.ItemOut(
        id=item.id,
        wishlist_id=item.wishlist_id,
        name=item.name,
        url=item.url,
        price=item.price,
        image_url=item.image_url,
        description=item.description,
        priority=item.priority,
        is_group_gift=item.is_group_gift,
        target_amount=item.target_amount,
        is_deleted=item.is_deleted,
        created_at=item.created_at,
        is_reserved=bool(item.reservation and not item.reservation.is_cancelled),
        total_contributed=total,
        contributors_count=len(item.contributions),
        contributors=contributors,
    )


@router.get("/", response_model=list[schemas.WishlistOut])
def list_wishlists(
    db: Session = Depends(get_db),
    user: models.User = Depends(require_user),
):
    wishlists = (
        db.query(models.Wishlist)
        .filter(models.Wishlist.user_id == user.id)
        .options(joinedload(models.Wishlist.items))
        .order_by(models.Wishlist.created_at.desc())
        .all()
    )
    result = []
    for wl in wishlists:
        out = schemas.WishlistOut(
            id=wl.id,
            user_id=wl.user_id,
            title=wl.title,
            description=wl.description,
            cover_emoji=wl.cover_emoji,
            slug=wl.slug,
            is_public=wl.is_public,
            created_at=wl.created_at,
            updated_at=wl.updated_at,
            item_count=len([i for i in wl.items if not i.is_deleted]),
        )
        result.append(out)
    return result


@router.post("/", response_model=schemas.WishlistOut, status_code=201)
def create_wishlist(
    data: schemas.WishlistCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_user),
):
    slug = make_slug(data.title, db)
    wl = models.Wishlist(
        user_id=user.id,
        title=data.title,
        description=data.description,
        cover_emoji=data.cover_emoji or "🎁",
        slug=slug,
        is_public=data.is_public,
    )
    db.add(wl)
    db.commit()
    db.refresh(wl)
    return schemas.WishlistOut(
        id=wl.id,
        user_id=wl.user_id,
        title=wl.title,
        description=wl.description,
        cover_emoji=wl.cover_emoji,
        slug=wl.slug,
        is_public=wl.is_public,
        created_at=wl.created_at,
        updated_at=wl.updated_at,
        item_count=0,
    )


@router.get("/{slug}", response_model=schemas.WishlistWithItems)
def get_wishlist(
    slug: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    wl = (
        db.query(models.Wishlist)
        .filter(models.Wishlist.slug == slug)
        .options(
            joinedload(models.Wishlist.items)
            .joinedload(models.Item.reservation),
            joinedload(models.Wishlist.items)
            .joinedload(models.Item.contributions),
            joinedload(models.Wishlist.owner),
        )
        .first()
    )
    if not wl:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    if not wl.is_public and (not user or user.id != wl.user_id):
        raise HTTPException(status_code=403, detail="This wishlist is private")

    is_owner = bool(user and user.id == wl.user_id)
    items = [
        build_item_out(item, is_owner)
        for item in sorted(wl.items, key=lambda i: (-i.priority, i.created_at))
        if not item.is_deleted
    ]

    return schemas.WishlistWithItems(
        id=wl.id,
        user_id=wl.user_id,
        title=wl.title,
        description=wl.description,
        cover_emoji=wl.cover_emoji,
        slug=wl.slug,
        is_public=wl.is_public,
        created_at=wl.created_at,
        updated_at=wl.updated_at,
        item_count=len(items),
        items=items,
        owner_name=wl.owner.name if wl.owner else "",
    )


@router.patch("/{slug}", response_model=schemas.WishlistOut)
def update_wishlist(
    slug: str,
    data: schemas.WishlistUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_user),
):
    wl = db.query(models.Wishlist).filter(models.Wishlist.slug == slug).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    if wl.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(wl, field, value)

    db.commit()
    db.refresh(wl)
    items_count = db.query(models.Item).filter(
        models.Item.wishlist_id == wl.id, models.Item.is_deleted == False
    ).count()

    return schemas.WishlistOut(
        id=wl.id, user_id=wl.user_id, title=wl.title, description=wl.description,
        cover_emoji=wl.cover_emoji, slug=wl.slug, is_public=wl.is_public,
        created_at=wl.created_at, updated_at=wl.updated_at, item_count=items_count,
    )


@router.delete("/{slug}", status_code=204)
def delete_wishlist(
    slug: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_user),
):
    wl = db.query(models.Wishlist).filter(models.Wishlist.slug == slug).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    if wl.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    db.delete(wl)
    db.commit()
