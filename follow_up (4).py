from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FollowUpBase(BaseModel):
    inquiry_id: str
    assigned_to: str
    due_at: datetime
    channel: Optional[str] = Field(None, max_length=30)
    purpose: Optional[str] = None
    status: str = Field(default="pending", max_length=20)
    outcome: Optional[str] = None


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpUpdate(BaseModel):
    due_at: Optional[datetime] = None
    channel: Optional[str] = Field(None, max_length=30)
    purpose: Optional[str] = None
    status: Optional[str] = Field(None, max_length=20)
    outcome: Optional[str] = None
    assigned_to: Optional[str] = None


class FollowUpOut(FollowUpBase):
    id: str
    institution_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
