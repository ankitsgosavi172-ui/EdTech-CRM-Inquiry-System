from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class InquiryBase(BaseModel):
    student_id: Optional[str] = None
    assigned_to: Optional[str] = None
    course_id: Optional[str] = None
    full_name: str = Field(..., max_length=160)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=30)
    source: Optional[str] = Field(None, max_length=60)
    status: str = Field(default="new", max_length=40)
    notes: Optional[str] = None
    lost_reason: Optional[str] = None


class InquiryCreate(InquiryBase):
    pass


class InquiryUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=160)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=30)
    source: Optional[str] = Field(None, max_length=60)
    status: Optional[str] = Field(None, max_length=40)
    notes: Optional[str] = None
    lost_reason: Optional[str] = None
    assigned_to: Optional[str] = None
    course_id: Optional[str] = None
    student_id: Optional[str] = None


class InquiryOut(InquiryBase):
    id: str
    institution_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
