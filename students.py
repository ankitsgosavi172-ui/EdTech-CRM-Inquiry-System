"""
Student endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_role, get_institution_id
from app.models.user import User
from app.schemas.student import StudentCreate, StudentUpdate, StudentOut
from app.services.student import StudentService

router = APIRouter()


@router.get("/", response_model=dict)
def list_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    items, total = StudentService.list_students(
        db, institution_id, page=page, page_size=page_size, q=q
    )
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin", "counsellor", "admission_manager"])),
    institution_id: str = Depends(get_institution_id),
):
    return StudentService.create_student(db, student_in, institution_id)


@router.get("/{student_id}", response_model=StudentOut)
def get_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    student = StudentService.get_student(db, student_id, institution_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: str,
    student_in: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin", "counsellor", "admission_manager"])),
    institution_id: str = Depends(get_institution_id),
):
    student = StudentService.update_student(db, student_id, institution_id, student_in)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin"])),
    institution_id: str = Depends(get_institution_id),
):
    success = StudentService.delete_student(db, student_id, institution_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return None
