"""SQLAlchemy ORM — Judge Test Result model"""
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, func, Text, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class JudgeResult(Base):
    __tablename__ = "judge_results"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    test_name: Mapped[str] = mapped_column(String(200), nullable=False)
    test_category: Mapped[str] = mapped_column(String(80), nullable=False)
    input_payload: Mapped[str] = mapped_column(Text, nullable=False)
    expected_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    actual_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending|pass|fail|error
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
