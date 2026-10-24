"""
Judge Test Suite Service
Runs evaluation test cases against the crop stress engine and scores them.
"""
from __future__ import annotations
import json
import time
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.judge_result import JudgeResult
from app.schemas.judge import JudgeTestCase, JudgeSummary
from app.schemas.crop_stress import CropStressInput
from app.services.crop_stress_engine import analyze_crop_stress


BUILT_IN_TESTS: list[dict] = [
    {
        "test_name": "Critical heat — Rice tillering",
        "test_category": "crop_stress",
        "input_payload": {
            "crop_type": "Rice", "growth_stage": "Tillering",
            "temperature_c": 44, "humidity_pct": 55,
            "soil_moisture_pct": 50, "rainfall_mm_last7d": 2,
        },
        "expected_output": {"overall_stress_level": "critical"},
    },
    {
        "test_name": "Drought — Cotton boll formation",
        "test_category": "crop_stress",
        "input_payload": {
            "crop_type": "Cotton", "growth_stage": "Boll Formation",
            "temperature_c": 36, "humidity_pct": 40,
            "soil_moisture_pct": 12, "rainfall_mm_last7d": 0,
        },
        "expected_output": {"overall_stress_level": "high"},
    },
    {
        "test_name": "Healthy field — Wheat vegetative",
        "test_category": "crop_stress",
        "input_payload": {
            "crop_type": "Wheat", "growth_stage": "Vegetative",
            "temperature_c": 24, "humidity_pct": 65,
            "soil_moisture_pct": 55, "rainfall_mm_last7d": 12,
        },
        "expected_output": {"overall_stress_level": "none"},
    },
    {
        "test_name": "Waterlogging — Rice post-monsoon",
        "test_category": "crop_stress",
        "input_payload": {
            "crop_type": "Rice", "growth_stage": "Panicle Initiation",
            "temperature_c": 29, "humidity_pct": 92,
            "soil_moisture_pct": 95, "rainfall_mm_last7d": 180,
        },
        "expected_output": {"overall_stress_level": "high"},
    },
    {
        "test_name": "N deficiency — Maize vegetative",
        "test_category": "crop_stress",
        "input_payload": {
            "crop_type": "Maize", "growth_stage": "V6",
            "temperature_c": 30, "humidity_pct": 60,
            "soil_moisture_pct": 45, "rainfall_mm_last7d": 8,
            "n_ppm": 5,
        },
        "expected_output": {"overall_stress_level": "medium"},
    },
]


def _score_result(actual: dict, expected: dict | None) -> tuple[float, str]:
    if expected is None:
        return 1.0, "No expected output — result recorded."
    matches = 0
    total = len(expected)
    notes = []
    for k, v in expected.items():
        if actual.get(k) == v:
            matches += 1
        else:
            notes.append(f"{k}: expected={v}, got={actual.get(k)}")
    score = matches / total if total > 0 else 1.0
    explanation = "All checks passed." if not notes else "Mismatches: " + "; ".join(notes)
    return score, explanation


async def run_judge_batch(
    test_cases: list[JudgeTestCase],
    db: AsyncSession,
) -> JudgeSummary:
    results: list[JudgeResult] = []

    for tc in test_cases:
        t0 = time.monotonic_ns()
        try:
            stress_input = CropStressInput(**tc.input_payload)
            stress_result = await analyze_crop_stress(stress_input)
            actual = stress_result.model_dump()
            latency = int((time.monotonic_ns() - t0) / 1_000_000)
            score, explanation = _score_result(actual, tc.expected_output)
            status = "pass" if score >= 1.0 else "fail"
        except Exception as exc:
            actual = {}
            latency = int((time.monotonic_ns() - t0) / 1_000_000)
            score = 0.0
            explanation = f"Error: {exc}"
            status = "error"

        jr = JudgeResult(
            test_name=tc.test_name,
            test_category=tc.test_category,
            input_payload=json.dumps(tc.input_payload),
            expected_output=json.dumps(tc.expected_output) if tc.expected_output else None,
            actual_output=json.dumps(actual),
            score=score,
            latency_ms=latency,
            status=status,
            explanation=explanation,
        )
        db.add(jr)
        results.append(jr)

    await db.commit()
    for r in results:
        await db.refresh(r)

    passed  = sum(1 for r in results if r.status == "pass")
    failed  = sum(1 for r in results if r.status == "fail")
    errors  = sum(1 for r in results if r.status == "error")
    scores  = [r.score for r in results if r.score is not None]
    lats    = [r.latency_ms for r in results if r.latency_ms is not None]

    from app.schemas.judge import JudgeResultResponse
    return JudgeSummary(
        total=len(results),
        passed=passed,
        failed=failed,
        errors=errors,
        avg_score=round(sum(scores) / len(scores), 3) if scores else None,
        avg_latency_ms=round(sum(lats) / len(lats), 1) if lats else None,
        results=[JudgeResultResponse.model_validate(r) for r in results],
    )


async def get_past_results(db: AsyncSession) -> list[JudgeResult]:
    res = await db.execute(
        select(JudgeResult).order_by(JudgeResult.created_at.desc()).limit(100)
    )
    return list(res.scalars().all())
