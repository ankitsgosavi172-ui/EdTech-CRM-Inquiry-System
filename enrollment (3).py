from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class EnrollmentBase(BaseModel):
    student_id: str
    inquiry_id: str
    course_id: str
    enrollment_date: date
    status: str = Field(default="active", max_length=30)
    fee_agreed: Optional[float] = Field(None, ge=0)


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentOut(EnrollmentBase):
    id: str
    institution_id: str
    created_at: datetime

    class Config:
        from_attributes = True
