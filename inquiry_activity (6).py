from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class InquiryActivityOut(BaseModel):
    id: str
    inquiry_id: str
    actor_id: Optional[str] = None
    activity_type: str
    from_status: Optional[str] = None
    to_status: Optional[str] = None
    notes: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True
