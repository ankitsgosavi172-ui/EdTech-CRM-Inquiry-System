"""
Course endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_role, get_institution_id
from app.models.user import User
from app.schemas.course import CourseCreate, CourseUpdate, CourseOut
from app.services.course import CourseService

router = APIRouter()


@router.get("/", response_model=dict)
def list_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    items, total = CourseService.list_courses(
        db, institution_id, page=page, page_size=page_size, is_active=is_active
    )
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("/", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin"])),
    institution_id: str = Depends(get_institution_id),
):
    return CourseService.create_course(db, course_in, institution_id)


@router.get("/{course_id}", response_model=CourseOut)
def get_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    institution_id: str = Depends(get_institution_id),
):
    course = CourseService.get_course(db, course_id, institution_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: str,
    course_in: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin"])),
    institution_id: str = Depends(get_institution_id),
):
    course = CourseService.update_course(db, course_id, institution_id, course_in)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin"])),
    institution_id: str = Depends(get_institution_id),
):
    success = CourseService.delete_course(db, course_id, institution_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return None
