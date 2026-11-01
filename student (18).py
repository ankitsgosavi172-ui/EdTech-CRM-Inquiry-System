"""
Student service: CRUD for student profiles.
"""
import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate


class StudentService:
    @staticmethod
    def create_student(db: Session, obj_in: StudentCreate, institution_id: str) -> Student:
        student = Student(
            institution_id=uuid.UUID(institution_id),
            full_name=obj_in.full_name,
            email=obj_in.email,
            phone=obj_in.phone,
            date_of_birth=obj_in.date_of_birth,
            academic_background=obj_in.academic_background,
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        return student

    @staticmethod
    def get_student(db: Session, student_id: str, institution_id: str) -> Optional[Student]:
        return (
            db.query(Student)
            .filter(Student.id == uuid.UUID(student_id))
            .filter(Student.institution_id == uuid.UUID(institution_id))
            .first()
        )

    @staticmethod
    def list_students(
        db: Session,
        institution_id: str,
        page: int = 1,
        page_size: int = 20,
        q: Optional[str] = None,
    ) -> Tuple[List[Student], int]:
        query = db.query(Student).filter(Student.institution_id == uuid.UUID(institution_id))
        if q:
            search = f"%{q}%"
            query = query.filter(
                Student.full_name.ilike(search)
                | Student.email.ilike(search)
                | Student.phone.ilike(search)
            )
        total = query.count()
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total

    @staticmethod
    def update_student(
        db: Session, student_id: str, institution_id: str, obj_in: StudentUpdate
    ) -> Optional[Student]:
        student = StudentService.get_student(db, student_id, institution_id)
        if not student:
            return None
        data = obj_in.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(student, field, value)
        db.commit()
        db.refresh(student)
        return student

    @staticmethod
    def delete_student(db: Session, student_id: str, institution_id: str) -> bool:
        student = StudentService.get_student(db, student_id, institution_id)
        if not student:
            return False
        db.delete(student)
        db.commit()
        return True
