from pydantic import BaseModel, field_validator, model_validator
from typing import List, Optional
from datetime import datetime


class TransactionInput(BaseModel):
    amount_risk: float
    payee_risk: float
    frequency_risk: float
    timing_risk: float
    device_risk: float
    # Enhanced context
    payee_id: Optional[str] = None
    amount_value: Optional[float] = None
    hour_of_day: Optional[int] = None
    metadata: Optional[dict] = None

    # ── Sanitize UPI ID ──────────────────────────────────────────
    @field_validator("payee_id", mode="before")
    @classmethod
    def sanitize_payee_id(cls, v):
        if v is None:
            return v
        v = str(v).strip()
        if v and "@" not in v:
            raise ValueError("payee_id must be a valid UPI ID containing '@'")
        if len(v) > 100:
            raise ValueError("payee_id too long (max 100 chars)")
        return v or None  # empty string → None

    # ── Clamp risk floats to [0.0, 1.0] ─────────────────────────
    @field_validator(
        "amount_risk", "payee_risk", "frequency_risk", "timing_risk", "device_risk",
        mode="before"
    )
    @classmethod
    def clamp_risk(cls, v):
        try:
            f = float(v)
        except (TypeError, ValueError):
            raise ValueError("Risk field must be a number")
        return max(0.0, min(1.0, f))

    # ── Validate optional numeric fields ─────────────────────────
    @field_validator("amount_value", mode="before")
    @classmethod
    def validate_amount(cls, v):
        if v is None:
            return v
        try:
            f = float(v)
        except (TypeError, ValueError):
            raise ValueError("amount_value must be a number")
        if f < 0:
            raise ValueError("amount_value must be non-negative")
        return f

    @field_validator("hour_of_day", mode="before")
    @classmethod
    def validate_hour(cls, v):
        if v is None:
            return v
        try:
            i = int(v)
        except (TypeError, ValueError):
            raise ValueError("hour_of_day must be an integer")
        if not (0 <= i <= 23):
            raise ValueError("hour_of_day must be between 0 and 23")
        return i


class AnalysisResult(BaseModel):
    risk_score: float
    risk_label: str  # "safe", "warning", "danger"
    reasons: List[str]
    timestamp: datetime = datetime.now()
