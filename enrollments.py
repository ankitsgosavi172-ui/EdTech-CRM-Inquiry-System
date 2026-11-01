"""
Enrollment endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session, joinedload
from app.api.deps import get_db, get_current_user, require_role, get_institution_id
from app.models.user import User
from app.models.enrollment import Enrollment
from app.schemas.enrollment import EnrollmentCreate, EnrollmentOut
import uuid

router = APIRouter()


@router.get("/", response_model=dict)
def list_enrollments(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    query = db.query(Enrollment).filter(Enrollment.institution_id == uuid.UUID(institution_id))
    total = query.count()
    offset = (page - 1) * page_size
    items = (
        query.options(
            joinedload(Enrollment.student),
            joinedload(Enrollment.course),
            joinedload(Enrollment.inquiry),
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("/", response_model=EnrollmentOut, status_code=status.HTTP_201_CREATED)
def create_enrollment(
    enrollment_in: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin", "admission_manager", "counsellor"])),
    institution_id: str = Depends(get_institution_id),
):
    # Check inquiry exists and belongs to institution
    inquiry = (
        db.query(__import__("app.models.inquiry", fromlist=["Inquiry"]).Inquiry)
        .filter(__import__("app.models.inquiry", fromlist=["Inquiry"]).Inquiry.id == uuid.UUID(enrollment_in.inquiry_id))
        .filter(__import__("app.models.inquiry", fromlist=["Inquiry"]).Inquiry.institution_id == uuid.UUID(institution_id))
        .first()
    )
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")

    enrollment = Enrollment(
        institution_id=uuid.UUID(institution_id),
        student_id=uuid.UUID(enrollment_in.student_id),
        inquiry_id=uuid.UUID(enrollment_in.inquiry_id),
        course_id=uuid.UUID(enrollment_in.course_id),
        enrollment_date=enrollment_in.enrollment_date,
        status=enrollment_in.status,
        fee_agreed=enrollment_in.fee_agreed,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/{enrollment_id}", response_model=EnrollmentOut)
def get_enrollment(
    enrollment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.id == uuid.UUID(enrollment_id))
        .filter(Enrollment.institution_id == uuid.UUID(institution_id))
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return enrollment
