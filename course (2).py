from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.common import TimestampSchema


class CourseBase(BaseModel):
    name: str = Field(..., max_length=160)
    code: str = Field(..., max_length=40)
    description: Optional[str] = None
    duration_months: int = Field(..., gt=0)
    fee: float = Field(..., ge=0)
    currency: str = Field(default="INR", max_length=3)
    is_active: bool = True


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=160)
    code: Optional[str] = Field(None, max_length=40)
    description: Optional[str] = None
    duration_months: Optional[int] = Field(None, gt=0)
    fee: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=3)
    is_active: Optional[bool] = None


class CourseOut(CourseBase, TimestampSchema):
    id: str
    institution_id: str

    class Config:
        from_attributes = True
