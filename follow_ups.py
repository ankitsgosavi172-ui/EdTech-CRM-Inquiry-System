"""
Follow-up endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_role, get_institution_id
from app.models.user import User
from app.schemas.follow_up import FollowUpCreate, FollowUpUpdate, FollowUpOut
from app.services.follow_up import FollowUpService

router = APIRouter()


@router.get("/", response_model=dict)
def list_follow_ups(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    inquiry_id: Optional[str] = Query(None),
    overdue_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    items, total = FollowUpService.list_follow_ups(
        db,
        institution_id,
        page=page,
        page_size=page_size,
        status=status,
        assigned_to=assigned_to,
        inquiry_id=inquiry_id,
        overdue_only=overdue_only,
    )
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("/", response_model=FollowUpOut, status_code=status.HTTP_201_CREATED)
def create_follow_up(
    follow_up_in: FollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin", "counsellor", "admission_manager"])),
    institution_id: str = Depends(get_institution_id),
):
    return FollowUpService.create_follow_up(db, follow_up_in, institution_id)


@router.patch("/{follow_up_id}/complete", response_model=FollowUpOut)
def complete_follow_up(
    follow_up_id: str,
    outcome: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin", "counsellor", "admission_manager"])),
    institution_id: str = Depends(get_institution_id),
):
    follow_up = FollowUpService.complete_follow_up(db, follow_up_id, institution_id, outcome=outcome)
    if not follow_up:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Follow-up not found")
    return follow_up


@router.put("/{follow_up_id}", response_model=FollowUpOut)
def update_follow_up(
    follow_up_id: str,
    follow_up_in: FollowUpUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin", "counsellor", "admission_manager"])),
    institution_id: str = Depends(get_institution_id),
):
    follow_up = FollowUpService.update_follow_up(db, follow_up_id, institution_id, follow_up_in)
    if not follow_up:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Follow-up not found")
    return follow_up
