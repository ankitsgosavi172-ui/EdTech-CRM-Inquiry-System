"""
Follow-up service: scheduling, completion, overdue queries.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.follow_up import FollowUp
from app.schemas.follow_up import FollowUpCreate, FollowUpUpdate


class FollowUpService:
    @staticmethod
    def create_follow_up(db: Session, obj_in: FollowUpCreate, institution_id: str) -> FollowUp:
        follow_up = FollowUp(
            institution_id=uuid.UUID(institution_id),
            inquiry_id=uuid.UUID(obj_in.inquiry_id),
            assigned_to=uuid.UUID(obj_in.assigned_to),
            due_at=obj_in.due_at,
            channel=obj_in.channel,
            purpose=obj_in.purpose,
            status=obj_in.status,
            outcome=obj_in.outcome,
        )
        db.add(follow_up)
        db.commit()
        db.refresh(follow_up)
        return follow_up

    @staticmethod
    def get_follow_up(db: Session, follow_up_id: str, institution_id: str) -> Optional[FollowUp]:
        return (
            db.query(FollowUp)
            .filter(FollowUp.id == uuid.UUID(follow_up_id))
            .filter(FollowUp.institution_id == uuid.UUID(institution_id))
            .first()
        )

    @staticmethod
    def list_follow_ups(
        db: Session,
        institution_id: str,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        assigned_to: Optional[str] = None,
        inquiry_id: Optional[str] = None,
        overdue_only: bool = False,
    ) -> Tuple[List[FollowUp], int]:
        query = db.query(FollowUp).filter(FollowUp.institution_id == uuid.UUID(institution_id))
        if status:
            query = query.filter(FollowUp.status == status)
        if assigned_to:
            query = query.filter(FollowUp.assigned_to == uuid.UUID(assigned_to))
        if inquiry_id:
            query = query.filter(FollowUp.inquiry_id == uuid.UUID(inquiry_id))
        if overdue_only:
            query = query.filter(
                FollowUp.status == "pending",
                FollowUp.due_at < datetime.now(timezone.utc),
            )
        total = query.count()
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total

    @staticmethod
    def complete_follow_up(
        db: Session, follow_up_id: str, institution_id: str, outcome: Optional[str] = None
    ) -> Optional[FollowUp]:
        follow_up = FollowUpService.get_follow_up(db, follow_up_id, institution_id)
        if not follow_up:
            return None
        follow_up.status = "completed"
        follow_up.completed_at = datetime.now(timezone.utc)
        if outcome:
            follow_up.outcome = outcome
        db.commit()
        db.refresh(follow_up)
        return follow_up

    @staticmethod
    def update_follow_up(
        db: Session, follow_up_id: str, institution_id: str, obj_in: FollowUpUpdate
    ) -> Optional[FollowUp]:
        follow_up = FollowUpService.get_follow_up(db, follow_up_id, institution_id)
        if not follow_up:
            return None
        data = obj_in.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(follow_up, field, value)
        db.commit()
        db.refresh(follow_up)
        return follow_up

    @staticmethod
    def delete_follow_up(db: Session, follow_up_id: str, institution_id: str) -> bool:
        follow_up = FollowUpService.get_follow_up(db, follow_up_id, institution_id)
        if not follow_up:
            return False
        db.delete(follow_up)
        db.commit()
        return True
