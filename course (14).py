"""
Course service: CRUD for course catalogue.
"""
import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate


class CourseService:
    @staticmethod
    def create_course(db: Session, obj_in: CourseCreate, institution_id: str) -> Course:
        course = Course(
            institution_id=uuid.UUID(institution_id),
            name=obj_in.name,
            code=obj_in.code,
            description=obj_in.description,
            duration_months=obj_in.duration_months,
            fee=obj_in.fee,
            currency=obj_in.currency,
            is_active=obj_in.is_active,
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def get_course(db: Session, course_id: str, institution_id: str) -> Optional[Course]:
        return (
            db.query(Course)
            .filter(Course.id == uuid.UUID(course_id))
            .filter(Course.institution_id == uuid.UUID(institution_id))
            .first()
        )

    @staticmethod
    def list_courses(
        db: Session,
        institution_id: str,
        page: int = 1,
        page_size: int = 20,
        is_active: Optional[bool] = None,
    ) -> Tuple[List[Course], int]:
        query = db.query(Course).filter(Course.institution_id == uuid.UUID(institution_id))
        if is_active is not None:
            query = query.filter(Course.is_active == is_active)
        total = query.count()
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total

    @staticmethod
    def update_course(
        db: Session, course_id: str, institution_id: str, obj_in: CourseUpdate
    ) -> Optional[Course]:
        course = CourseService.get_course(db, course_id, institution_id)
        if not course:
            return None
        data = obj_in.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(course, field, value)
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def delete_course(db: Session, course_id: str, institution_id: str) -> bool:
        course = CourseService.get_course(db, course_id, institution_id)
        if not course:
            return False
        db.delete(course)
        db.commit()
        return True
