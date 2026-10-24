"""
Alert generation service — seed + query helpers
"""
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.alert import Alert


SEED_ALERTS = [
    Alert(
        id="alert-001",
        field_id=None,
        severity="critical",
        category="Weather",
        title="Heat Wave Warning — Next 72 Hours",
        message="IMD forecast shows temperatures reaching 44°C in your district over the next 3 days.",
        recommendation="Irrigate in the early morning (5–7 AM). Apply mulch to reduce soil temp.",
        is_read=False,
    ),
    Alert(
        id="alert-002",
        field_id=None,
        severity="high",
        category="Pest",
        title="Brown Plant Hopper Outbreak Detected",
        message="BPH population has crossed economic threshold level (ETL) in neighboring farms.",
        recommendation="Scout your field. Apply Buprofezin 25% SC @ 1 L/ha if BPH > 5/hill.",
        is_read=False,
    ),
    Alert(
        id="alert-003",
        field_id=None,
        severity="medium",
        category="Nutrition",
        title="Zinc Deficiency Season Alert",
        message="Post-monsoon soil analyses in your block show widespread Zn deficiency.",
        recommendation="Apply 25 kg/ha ZnSO₄ as basal dose before transplanting.",
        is_read=True,
    ),
    Alert(
        id="alert-004",
        field_id=None,
        severity="low",
        category="Market",
        title="Paddy MSP Revision — New Season",
        message="GOI has revised MSP to ₹2,300/quintal for common variety paddy.",
        recommendation="Plan harvest timing to align with mandi arrival.",
        is_read=False,
    ),
]


async def seed_alerts_if_empty(db: AsyncSession) -> None:
    result = await db.execute(select(Alert).limit(1))
    if result.scalar_one_or_none() is None:
        db.add_all(SEED_ALERTS)
        await db.commit()


async def get_all_alerts(db: AsyncSession) -> list[Alert]:
    result = await db.execute(select(Alert).order_by(Alert.created_at.desc()))
    return list(result.scalars().all())


async def mark_alerts_read(db: AsyncSession, ids: list[str]) -> int:
    result = await db.execute(select(Alert).where(Alert.id.in_(ids)))
    alerts = list(result.scalars().all())
    for a in alerts:
        a.is_read = True
    await db.commit()
    return len(alerts)
