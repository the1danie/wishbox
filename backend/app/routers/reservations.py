from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..websocket_manager import manager

router = APIRouter(prefix="/wishlists/{slug}/items/{item_id}/reserve", tags=["reservations"])


@router.post("/", response_model=schemas.ReservationOut, status_code=201)
async def reserve_item(
    slug: str,
    item_id: str,
    data: schemas.ReserveItem,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    wl = db.query(models.Wishlist).filter(models.Wishlist.slug == slug).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    # Owner cannot reserve their own items
    if user and user.id == wl.user_id:
        raise HTTPException(status_code=400, detail="Cannot reserve items in your own wishlist")

    item = (
        db.query(models.Item)
        .filter(models.Item.id == item_id, models.Item.wishlist_id == wl.id)
        .options(joinedload(models.Item.reservation))
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.is_deleted:
        raise HTTPException(status_code=400, detail="This item has been removed from the wishlist")
    if item.is_group_gift:
        raise HTTPException(status_code=400, detail="This is a group gift — use contributions instead")

    existing = item.reservation
    if existing and not existing.is_cancelled:
        raise HTTPException(status_code=400, detail="This item is already reserved")

    if existing and existing.is_cancelled:
        existing.reserver_name = data.reserver_name
        existing.reserver_email = data.reserver_email
        existing.reserver_user_id = user.id if user else None
        existing.is_cancelled = False
        db.commit()
        db.refresh(existing)
        reservation = existing
    else:
        reservation = models.Reservation(
            item_id=item.id,
            reserver_name=data.reserver_name,
            reserver_email=data.reserver_email,
            reserver_user_id=user.id if user else None,
        )
        db.add(reservation)
        db.commit()
        db.refresh(reservation)

    await manager.broadcast(slug, {
        "type": "item_reserved",
        "item_id": item_id,
        "reserver_name": data.reserver_name,
    })

    return schemas.ReservationOut(
        id=reservation.id,
        item_id=reservation.item_id,
        reserver_name=reservation.reserver_name,
        created_at=reservation.created_at,
    )


@router.delete("/", status_code=204)
async def cancel_reservation(
    slug: str,
    item_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    wl = db.query(models.Wishlist).filter(models.Wishlist.slug == slug).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    item = (
        db.query(models.Item)
        .filter(models.Item.id == item_id, models.Item.wishlist_id == wl.id)
        .options(joinedload(models.Item.reservation))
        .first()
    )
    if not item or not item.reservation or item.reservation.is_cancelled:
        raise HTTPException(status_code=404, detail="No active reservation found")

    item.reservation.is_cancelled = True
    db.commit()

    await manager.broadcast(slug, {"type": "item_unreserved", "item_id": item_id})
