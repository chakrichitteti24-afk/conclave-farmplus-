"""Judge Test Suite routes"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.schemas.judge import JudgeBatchRequest, JudgeSummary, JudgeResultResponse
from app.services.judge_service import (
    run_judge_batch,
    get_past_results,
    BUILT_IN_TESTS,
    JudgeTestCase,
)

router = APIRouter(prefix="/judge")


@router.get("/built-in-tests", response_model=List[dict])
async def list_built_in_tests():
    """Return the catalogue of built-in evaluation test cases."""
    return BUILT_IN_TESTS


@router.post("/run", response_model=JudgeSummary)
async def run_tests(payload: JudgeBatchRequest, db: AsyncSession = Depends(get_db)):
    """Execute a batch of evaluation test cases and return scored results."""
    return await run_judge_batch(payload.test_cases, db)


@router.post("/run-built-in", response_model=JudgeSummary)
async def run_built_in(db: AsyncSession = Depends(get_db)):
    """Run all built-in benchmark test cases."""
    test_cases = [JudgeTestCase(**t) for t in BUILT_IN_TESTS]
    return await run_judge_batch(test_cases, db)


@router.get("/results", response_model=List[JudgeResultResponse])
async def past_results(db: AsyncSession = Depends(get_db)):
    """Retrieve the last 100 judge test results."""
    results = await get_past_results(db)
    return [JudgeResultResponse.model_validate(r) for r in results]
