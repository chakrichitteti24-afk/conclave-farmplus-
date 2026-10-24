"""Pydantic schemas for Proactive Alerts"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertResponse(BaseModel):
    id: str
    field_id: Optional[str]
    severity: str
    category: str
    title: str
    message: str
    recommendation: Optional[str]
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertMarkRead(BaseModel):
    ids: list[str]
