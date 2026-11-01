from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None


class RoleOut(RoleBase):
    id: str

    class Config:
        from_attributes = True
