from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..websocket_manager import manager

router = APIRouter(prefix="/wishlists/{slug}/items/{item_id}/contribute", tags=["contributions"])


@router.post("/", response_model=schemas.ContributionOut, status_code=201)
async def contribute(
    slug: str,
    item_id: str,
    data: schemas.ContributeToItem,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    wl = db.query(models.Wishlist).filter(models.Wishlist.slug == slug).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    if user and user.id == wl.user_id:
        raise HTTPException(status_code=400, detail="Cannot contribute to your own wishlist items")

    item = (
        db.query(models.Item)
        .filter(models.Item.id == item_id, models.Item.wishlist_id == wl.id)
        .options(joinedload(models.Item.contributions))
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.is_deleted:
        raise HTTPException(
            status_code=400,
            detail="This item has been removed. Contributors should coordinate a refund outside the app."
        )
    if not item.is_group_gift:
        raise HTTPException(status_code=400, detail="This item doesn't accept group contributions")

    total_so_far = sum(c.amount for c in item.contributions)
    if item.target_amount and total_so_far >= item.target_amount:
        raise HTTPException(status_code=400, detail="Target amount already reached")

    contribution = models.Contribution(
        item_id=item.id,
        contributor_name=data.contributor_name,
        contributor_email=data.contributor_email,
        contributor_user_id=user.id if user else None,
        amount=data.amount,
    )
    db.add(contribution)
    db.commit()
    db.refresh(contribution)

    new_total = total_so_far + data.amount
    await manager.broadcast(slug, {
        "type": "contribution_added",
        "item_id": item_id,
        "total_contributed": float(new_total),
        "contributors_count": len(item.contributions) + 1,
        "contributor_name": data.contributor_name,
    })

    return schemas.ContributionOut(
        id=contribution.id,
        item_id=contribution.item_id,
        contributor_name=contribution.contributor_name,
        amount=contribution.amount,
        created_at=contribution.created_at,
    )
