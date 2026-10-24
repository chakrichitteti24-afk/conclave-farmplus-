"""Field Profile CRUD routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.core.database import get_db
from app.models.field import Field
from app.schemas.field import FieldCreate, FieldUpdate, FieldResponse

router = APIRouter(prefix="/fields")


@router.get("", response_model=List[FieldResponse])
async def list_fields(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Field).order_by(Field.created_at.desc()))
    return list(result.scalars().all())


@router.post("", response_model=FieldResponse, status_code=status.HTTP_201_CREATED)
async def create_field(payload: FieldCreate, db: AsyncSession = Depends(get_db)):
    field = Field(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(field)
    await db.commit()
    await db.refresh(field)
    return field


@router.get("/{field_id}", response_model=FieldResponse)
async def get_field(field_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Field).where(Field.id == field_id))
    field = result.scalar_one_or_none()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field


@router.patch("/{field_id}", response_model=FieldResponse)
async def update_field(field_id: str, payload: FieldUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Field).where(Field.id == field_id))
    field = result.scalar_one_or_none()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(field, k, v)
    await db.commit()
    await db.refresh(field)
    return field


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_field(field_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Field).where(Field.id == field_id))
    field = result.scalar_one_or_none()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    await db.delete(field)
    await db.commit()
