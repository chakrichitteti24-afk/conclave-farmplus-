"""Pydantic schemas for Field Profiles"""
from pydantic import BaseModel, Field as PydanticField
from typing import Optional
from datetime import datetime


class FieldCreate(BaseModel):
    name: str = PydanticField(..., min_length=2, max_length=120, examples=["North Block A"])
    crop_type: str = PydanticField(..., examples=["Rice"])
    area_acres: float = PydanticField(default=1.0, gt=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_type: Optional[str] = None
    irrigation_method: Optional[str] = None
    sowing_date: Optional[str] = None


class FieldUpdate(BaseModel):
    name: Optional[str] = None
    crop_type: Optional[str] = None
    area_acres: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_type: Optional[str] = None
    irrigation_method: Optional[str] = None
    sowing_date: Optional[str] = None


class FieldResponse(BaseModel):
    id: str
    name: str
    crop_type: str
    area_acres: float
    latitude: Optional[float]
    longitude: Optional[float]
    soil_type: Optional[str]
    irrigation_method: Optional[str]
    sowing_date: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
