from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TransactionInput(BaseModel):
    amount_risk: float  # Normalized 0-1
    payee_risk: float   # Historical risk
    frequency_risk: float
    timing_risk: float
    device_risk: float
    # Optional metadata if needed for logs, but not model features
    metadata: Optional[dict] = None

class AnalysisResult(BaseModel):
    risk_score: float
    risk_label: str  # "safe", "warning", "danger"
    reasons: List[str]
    timestamp: datetime = datetime.now()
