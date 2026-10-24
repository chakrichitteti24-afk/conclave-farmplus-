"""Crop Stress analysis routes"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.crop_stress import CropStressInput, CropStressResult
from app.services.crop_stress_engine import analyze_crop_stress

router = APIRouter(prefix="/crop-stress")


@router.post("/analyze", response_model=CropStressResult)
async def analyze(
    payload: CropStressInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Submit sensor/observation data for an explainable crop stress diagnosis.
    Returns stressor identification, severity, feature attribution, and action items.
    """
    result = await analyze_crop_stress(payload)
    return result
