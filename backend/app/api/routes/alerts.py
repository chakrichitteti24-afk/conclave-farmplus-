"""Proactive Alerts routes"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.schemas.alert import AlertResponse, AlertMarkRead
from app.services.alert_service import (
    get_all_alerts,
    mark_alerts_read,
    seed_alerts_if_empty,
)

router = APIRouter(prefix="/alerts")


@router.get("", response_model=List[AlertResponse])
async def list_alerts(db: AsyncSession = Depends(get_db)):
    await seed_alerts_if_empty(db)
    return await get_all_alerts(db)


@router.post("/mark-read", response_model=dict)
async def mark_read(payload: AlertMarkRead, db: AsyncSession = Depends(get_db)):
    count = await mark_alerts_read(db, payload.ids)
    return {"marked": count}
