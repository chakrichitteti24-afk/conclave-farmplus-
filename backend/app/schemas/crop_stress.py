"""Pydantic schemas for Crop Stress Analysis"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class CropStressInput(BaseModel):
    field_id: Optional[str] = None
    crop_type: str = Field(..., examples=["Rice"])
    growth_stage: str = Field(..., examples=["Tillering"])
    # Environmental readings
    temperature_c: float = Field(..., ge=-10, le=60)
    humidity_pct: float = Field(..., ge=0, le=100)
    soil_moisture_pct: float = Field(..., ge=0, le=100)
    rainfall_mm_last7d: float = Field(default=0.0, ge=0)
    # Optional leaf/visual cues
    leaf_color: Optional[str] = Field(default=None, examples=["Yellow-green"])
    visible_symptoms: Optional[str] = Field(default=None, examples=["Brown spots on lower leaves"])
    # Nutrient readings
    n_ppm: Optional[float] = None
    p_ppm: Optional[float] = None
    k_ppm: Optional[float] = None


class StressFactor(BaseModel):
    factor: str
    severity: str          # low | medium | high | critical
    confidence: float      # 0-1
    explanation: str
    contributing_features: List[str]


class ActionItem(BaseModel):
    priority: int          # 1 = highest
    action: str
    reason: str
    timeline: str
    estimated_yield_impact: Optional[str] = None


class CropStressResult(BaseModel):
    overall_stress_level: str   # none | low | medium | high | critical
    stress_score: float         # 0-100
    primary_stressors: List[StressFactor]
    action_items: List[ActionItem]
    explainability_notes: str
    model_confidence: float
    raw_features: Dict[str, Any]
