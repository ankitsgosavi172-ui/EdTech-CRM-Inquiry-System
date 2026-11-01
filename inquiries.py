"""
Inquiry endpoints: CRUD, assignment, activities.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_role, get_institution_id
from app.models.user import User
from app.models.inquiry import Inquiry
from app.schemas.inquiry import InquiryCreate, InquiryUpdate, InquiryOut
from app.services.inquiry import InquiryService
import uuid

router = APIRouter()


@router.get("/", response_model=dict)
def list_inquiries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    course_id: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    items, total = InquiryService.list_inquiries(
        db=db,
        institution_id=institution_id,
        page=page,
        page_size=page_size,
        q=q,
        status=status,
        source=source,
        course_id=course_id,
        assigned_to=assigned_to,
        from_date=from_date,
        to_date=to_date,
        user_role=current_user.role.name if current_user.role else None,
        user_id=str(current_user.id),
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/", response_model=InquiryOut, status_code=status.HTTP_201_CREATED)
def create_inquiry(
    inquiry_in: InquiryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin", "counsellor", "admission_manager"])),
    institution_id: str = Depends(get_institution_id),
):
    return InquiryService.create_inquiry(
        db, inquiry_in, institution_id, actor_id=str(current_user.id)
    )


@router.get("/{inquiry_id}", response_model=InquiryOut)
def get_inquiry(
    inquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    inquiry = InquiryService.get_inquiry(db, inquiry_id, institution_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    # Counsellors can only view assigned inquiries
    if current_user.role and current_user.role.name == "counsellor":
        if inquiry.assigned_to != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to this inquiry")
    return inquiry


@router.put("/{inquiry_id}", response_model=InquiryOut)
def update_inquiry(
    inquiry_id: str,
    inquiry_in: InquiryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin", "counsellor", "admission_manager"])),
    institution_id: str = Depends(get_institution_id),
):
    try:
        inquiry = InquiryService.update_inquiry(
            db, inquiry_id, institution_id, inquiry_in, actor_id=str(current_user.id)
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return inquiry


@router.delete("/{inquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inquiry(
    inquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin"])),
    institution_id: str = Depends(get_institution_id),
):
    success = InquiryService.delete_inquiry(db, inquiry_id, institution_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return None


@router.post("/{inquiry_id}/assign", response_model=InquiryOut)
def assign_inquiry(
    inquiry_id: str,
    assigned_to: str = Query(..., description="User ID to assign"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin", "admission_manager"])),
    institution_id: str = Depends(get_institution_id),
):
    inquiry = InquiryService.assign_inquiry(
        db, inquiry_id, institution_id, assigned_to, actor_id=str(current_user.id)
    )
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return inquiry


@router.get("/{inquiry_id}/activities", response_model=List[dict])
def get_inquiry_activities(
    inquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    activities = InquiryService.get_activities(db, inquiry_id, institution_id)
    return activities


@router.get("/export/csv")
def export_inquiries_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    from fastapi.responses import StreamingResponse
    import csv
    import io

    inquiries = (
        db.query(Inquiry)
        .filter(Inquiry.institution_id == uuid.UUID(institution_id))
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "full_name", "email", "phone", "source", "status", "course_id", "assigned_to", "created_at"])
    for inq in inquiries:
        writer.writerow([
            str(inq.id),
            inq.full_name,
            inq.email or "",
            inq.phone or "",
            inq.source or "",
            inq.status,
            str(inq.course_id) if inq.course_id else "",
            str(inq.assigned_to) if inq.assigned_to else "",
            inq.created_at.isoformat() if inq.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="inquiries.csv"'},
    )
