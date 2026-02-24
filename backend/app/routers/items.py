from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from ..database import get_db
from ..auth import require_user
from ..websocket_manager import manager
from .wishlists import build_item_out

router = APIRouter(prefix="/wishlists/{slug}/items", tags=["items"])


def get_wishlist_or_404(slug: str, db: Session) -> models.Wishlist:
    wl = db.query(models.Wishlist).filter(models.Wishlist.slug == slug).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    return wl


@router.post("/", response_model=schemas.ItemOut, status_code=201)
async def add_item(
    slug: str,
    data: schemas.ItemCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_user),
):
    wl = get_wishlist_or_404(slug, db)
    if wl.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    item = models.Item(
        wishlist_id=wl.id,
        name=data.name,
        url=str(data.url) if data.url else None,
        price=data.price,
        image_url=str(data.image_url) if data.image_url else None,
        description=data.description,
        priority=data.priority,
        is_group_gift=data.is_group_gift,
        target_amount=data.target_amount,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    out = schemas.ItemOut(
        id=item.id, wishlist_id=item.wishlist_id, name=item.name, url=item.url,
        price=item.price, image_url=item.image_url, description=item.description,
        priority=item.priority, is_group_gift=item.is_group_gift,
        target_amount=item.target_amount, is_deleted=item.is_deleted,
        created_at=item.created_at, is_reserved=False,
        total_contributed=Decimal("0"), contributors_count=0, contributors=[],
    )

    await manager.broadcast(slug, {"type": "item_added", "item": out.model_dump(mode="json")})
    return out


@router.patch("/{item_id}", response_model=schemas.ItemOut)
async def update_item(
    slug: str,
    item_id: str,
    data: schemas.ItemUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_user),
):
    wl = get_wishlist_or_404(slug, db)
    if wl.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    item = (
        db.query(models.Item)
        .filter(models.Item.id == item_id, models.Item.wishlist_id == wl.id)
        .options(joinedload(models.Item.reservation), joinedload(models.Item.contributions))
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)

    out = build_item_out(item, True)
    await manager.broadcast(slug, {"type": "item_updated", "item": out.model_dump(mode="json")})
    return out


@router.delete("/{item_id}", status_code=204)
async def delete_item(
    slug: str,
    item_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_user),
):
    wl = get_wishlist_or_404(slug, db)
    if wl.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    item = db.query(models.Item).filter(
        models.Item.id == item_id, models.Item.wishlist_id == wl.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.is_deleted = True
    item.deleted_at = datetime.utcnow()
    db.commit()

    await manager.broadcast(slug, {"type": "item_deleted", "item_id": item_id})
