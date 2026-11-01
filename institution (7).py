from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.schemas.common import TimestampSchema


class InstitutionBase(BaseModel):
    name: str = Field(..., max_length=200)
    code: Optional[str] = Field(None, max_length=40)
    address: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=30)
    email: Optional[EmailStr] = None
    is_active: bool = True


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    code: Optional[str] = Field(None, max_length=40)
    address: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=30)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class InstitutionOut(InstitutionBase, TimestampSchema):
    id: str

    class Config:
        from_attributes = True
