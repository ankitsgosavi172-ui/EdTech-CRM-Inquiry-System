"""
Reports endpoints: conversions.
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, get_institution_id
from app.models.user import User
from app.services.report import ReportService

router = APIRouter()


@router.get("/conversions")
def get_conversions_report(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    return ReportService.get_conversions(
        db,
        institution_id,
        from_date=from_date,
        to_date=to_date,
        user_role=current_user.role.name if current_user.role else None,
        user_id=str(current_user.id),
    )
