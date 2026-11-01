from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.schemas.common import TimestampSchema


class UserBase(BaseModel):
    full_name: str = Field(..., max_length=120)
    email: EmailStr
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role_id: str
    institution_id: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=120)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    role_id: Optional[str] = None


class UserOut(UserBase, TimestampSchema):
    id: str
    institution_id: str
    role_id: str
    role_name: Optional[str] = None

    class Config:
        from_attributes = True
