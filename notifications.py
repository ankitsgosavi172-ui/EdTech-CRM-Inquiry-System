"""
Notification endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, get_institution_id
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationOut
import uuid

router = APIRouter()


@router.get("/", response_model=List[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .filter(Notification.institution_id == uuid.UUID(institution_id))
        .order_by(Notification.created_at.desc())
        .all()
    )
    return notifications


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    from datetime import datetime, timezone
    notification = (
        db.query(Notification)
        .filter(Notification.id == uuid.UUID(notification_id))
        .filter(Notification.user_id == current_user.id)
        .filter(Notification.institution_id == uuid.UUID(institution_id))
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification.read_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(notification)
    return notification
