from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from app.schemas.common import TimestampSchema


class StudentBase(BaseModel):
    full_name: str = Field(..., max_length=160)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=30)
    date_of_birth: Optional[date] = None
    academic_background: Optional[str] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(StudentBase):
    pass


class StudentOut(StudentBase, TimestampSchema):
    id: str
    institution_id: str

    class Config:
        from_attributes = True
