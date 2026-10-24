"""Pydantic schemas for Judge Test Suite"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class JudgeTestCase(BaseModel):
    test_name: str = Field(..., examples=["Rice heat stress — critical threshold"])
    test_category: str = Field(..., examples=["crop_stress"])
    input_payload: dict
    expected_output: Optional[dict] = None


class JudgeBatchRequest(BaseModel):
    test_cases: List[JudgeTestCase]
    judge_model: str = Field(default="heuristic", examples=["heuristic", "gemini"])


class JudgeResultResponse(BaseModel):
    id: str
    test_name: str
    test_category: str
    input_payload: str
    expected_output: Optional[str]
    actual_output: Optional[str]
    score: Optional[float]
    latency_ms: Optional[int]
    status: str
    explanation: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class JudgeSummary(BaseModel):
    total: int
    passed: int
    failed: int
    errors: int
    avg_score: Optional[float]
    avg_latency_ms: Optional[float]
    results: List[JudgeResultResponse]
