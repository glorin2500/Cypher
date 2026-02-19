from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TransactionInput(BaseModel):
    amount_risk: float  # Normalized 0-1
    payee_risk: float   # Historical risk
    frequency_risk: float
    timing_risk: float
    device_risk: float
    # Enhanced context — used by ML model for accurate UPI-specific analysis
    payee_id: Optional[str] = None       # Actual UPI ID (e.g. "merchant@paytm")
    amount_value: Optional[float] = None # Actual amount in ₹
    hour_of_day: Optional[int] = None    # 0-23, used for timing context
    # Optional metadata
    metadata: Optional[dict] = None

class AnalysisResult(BaseModel):
    risk_score: float
    risk_label: str  # "safe", "warning", "danger"
    reasons: List[str]
    timestamp: datetime = datetime.now()
