"""
Inquiry service: CRUD, lifecycle transitions, assignment, activity history.
"""
import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_
from app.models.inquiry import Inquiry
from app.models.inquiry_activity import InquiryActivity
from app.models.user import User
from app.models.course import Course
from app.models.student import Student
from app.schemas.inquiry import InquiryCreate, InquiryUpdate
from app.core.security import decode_access_token


# Valid lifecycle transitions per PRD
VALID_TRANSITIONS = {
    "new": {"contacted", "not_interested", "unreachable", "on_hold", "lost"},
    "contacted": {"interested", "not_interested", "unreachable", "on_hold", "lost"},
    "interested": {"follow_up_scheduled", "not_interested", "on_hold", "lost", "application_submitted"},
    "follow_up_scheduled": {"interested", "application_submitted", "not_interested", "on_hold", "lost", "unreachable"},
    "application_submitted": {"admission_confirmed", "not_interested", "on_hold", "lost"},
    "admission_confirmed": set(),
    # Terminal/paused can re-enter per policy
    "not_interested": {"contacted"},
    "unreachable": {"contacted"},
    "on_hold": {"contacted", "interested", "follow_up_scheduled"},
    "lost": {"contacted"},
}

TERMINAL_STATUSES = {"lost", "not_interested"}


class InquiryService:
    @staticmethod
    def create_inquiry(db: Session, obj_in: InquiryCreate, institution_id: str, actor_id: Optional[str] = None) -> Inquiry:
        data = obj_in.model_dump()
        inquiry = Inquiry(
            institution_id=uuid.UUID(institution_id),
            student_id=uuid.UUID(data["student_id"]) if data.get("student_id") else None,
            assigned_to=uuid.UUID(data["assigned_to"]) if data.get("assigned_to") else None,
            course_id=uuid.UUID(data["course_id"]) if data.get("course_id") else None,
            full_name=data["full_name"],
            email=data.get("email"),
            phone=data.get("phone"),
            source=data.get("source"),
            status=data.get("status", "new"),
            notes=data.get("notes"),
            lost_reason=data.get("lost_reason"),
        )
        db.add(inquiry)
        db.flush()
        InquiryService._log_activity(
            db, inquiry, actor_id, "created", None, inquiry.status,
            notes="Inquiry created"
        )
        db.commit()
        db.refresh(inquiry)
        return inquiry

    @staticmethod
    def get_inquiry(db: Session, inquiry_id: str, institution_id: str) -> Optional[Inquiry]:
        return (
            db.query(Inquiry)
            .options(
                joinedload(Inquiry.course),
                joinedload(Inquiry.student),
                joinedload(Inquiry.assigned_user),
            )
            .filter(Inquiry.id == uuid.UUID(inquiry_id))
            .filter(Inquiry.institution_id == uuid.UUID(institution_id))
            .first()
        )

    @staticmethod
    def list_inquiries(
        db: Session,
        institution_id: str,
        page: int = 1,
        page_size: int = 20,
        q: Optional[str] = None,
        status: Optional[str] = None,
        source: Optional[str] = None,
        course_id: Optional[str] = None,
        assigned_to: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        user_role: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> Tuple[List[Inquiry], int]:
        query = db.query(Inquiry).filter(Inquiry.institution_id == uuid.UUID(institution_id))

        # Counsellors see only their assigned inquiries
        if user_role == "counsellor" and user_id:
            query = query.filter(Inquiry.assigned_to == uuid.UUID(user_id))

        if q:
            search = f"%{q}%"
            query = query.filter(
                or_(
                    Inquiry.full_name.ilike(search),
                    Inquiry.email.ilike(search),
                    Inquiry.phone.ilike(search),
                )
            )
        if status:
            query = query.filter(Inquiry.status == status)
        if source:
            query = query.filter(Inquiry.source == source)
        if course_id:
            query = query.filter(Inquiry.course_id == uuid.UUID(course_id))
        if assigned_to:
            query = query.filter(Inquiry.assigned_to == uuid.UUID(assigned_to))
        if from_date:
            query = query.filter(Inquiry.created_at >= from_date)
        if to_date:
            query = query.filter(Inquiry.created_at <= to_date)

        total = query.count()
        offset = (page - 1) * page_size
        items = (
            query.options(
                joinedload(Inquiry.course),
                joinedload(Inquiry.student),
                joinedload(Inquiry.assigned_user),
            )
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return items, total

    @staticmethod
    def update_inquiry(
        db: Session,
        inquiry_id: str,
        institution_id: str,
        obj_in: InquiryUpdate,
        actor_id: Optional[str] = None,
    ) -> Optional[Inquiry]:
        inquiry = InquiryService.get_inquiry(db, inquiry_id, institution_id)
        if not inquiry:
            return None

        data = obj_in.model_dump(exclude_unset=True)
        old_status = inquiry.status

        for field, value in data.items():
            if field in ("student_id", "assigned_to", "course_id") and value:
                setattr(inquiry, field, uuid.UUID(value))
            elif field in ("student_id", "assigned_to", "course_id") and value is None:
                setattr(inquiry, field, None)
            else:
                setattr(inquiry, field, value)

        # Log status change
        if "status" in data and data["status"] != old_status:
            InquiryService._validate_transition(old_status, data["status"])
            InquiryService._log_activity(
                db, inquiry, actor_id, "status_changed", old_status, data["status"],
                notes=f"Status changed from {old_status} to {data['status']}"
            )

        db.commit()
        db.refresh(inquiry)
        return inquiry

    @staticmethod
    def delete_inquiry(db: Session, inquiry_id: str, institution_id: str) -> bool:
        inquiry = InquiryService.get_inquiry(db, inquiry_id, institution_id)
        if not inquiry:
            return False
        db.delete(inquiry)
        db.commit()
        return True

    @staticmethod
    def assign_inquiry(
        db: Session,
        inquiry_id: str,
        institution_id: str,
        assigned_to_id: str,
        actor_id: Optional[str] = None,
    ) -> Optional[Inquiry]:
        inquiry = InquiryService.get_inquiry(db, inquiry_id, institution_id)
        if not inquiry:
            return None
        old_assigned = str(inquiry.assigned_to) if inquiry.assigned_to else None
        inquiry.assigned_to = uuid.UUID(assigned_to_id)
        InquiryService._log_activity(
            db, inquiry, actor_id, "assigned", None, inquiry.status,
            notes=f"Assigned to user {assigned_to_id}",
            metadata={"previous_assigned_to": old_assigned},
        )
        db.commit()
        db.refresh(inquiry)
        return inquiry

    @staticmethod
    def get_activities(db: Session, inquiry_id: str, institution_id: str) -> List[InquiryActivity]:
        return (
            db.query(InquiryActivity)
            .filter(InquiryActivity.inquiry_id == uuid.UUID(inquiry_id))
            .filter(InquiryActivity.institution_id == uuid.UUID(institution_id))
            .order_by(InquiryActivity.created_at.desc())
            .all()
        )

    @staticmethod
    def _validate_transition(from_status: str, to_status: str) -> None:
        allowed = VALID_TRANSITIONS.get(from_status, set())
        if to_status not in allowed:
            raise ValueError(
                f"Invalid status transition from '{from_status}' to '{to_status}'. "
                f"Allowed: {sorted(allowed)}"
            )

    @staticmethod
    def _log_activity(
        db: Session,
        inquiry: Inquiry,
        actor_id: Optional[str],
        activity_type: str,
        from_status: Optional[str],
        to_status: Optional[str],
        notes: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> None:
        activity = InquiryActivity(
            institution_id=inquiry.institution_id,
            inquiry_id=inquiry.id,
            actor_id=uuid.UUID(actor_id) if actor_id else None,
            activity_type=activity_type,
            from_status=from_status,
            to_status=to_status,
            notes=notes,
            activity_metadata=metadata,
        )
        db.add(activity)
        db.flush()
