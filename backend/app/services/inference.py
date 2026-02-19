from app.schemas import TransactionInput, AnalysisResult
from datetime import datetime
from app.services.cypher_ml_logic import analyze_transaction as ml_analyze

def analyze_transaction(data: TransactionInput) -> AnalysisResult:
    """
    Orchestrates the ML analysis.
    Converts Pydantic model to dict, calls ML logic, and returns result.
    """
    # 1. Build full feature dict — include optional context for ML-enhanced analysis
    features = {
        "amount_risk": data.amount_risk,
        "payee_risk": data.payee_risk,
        "frequency_risk": data.frequency_risk,
        "timing_risk": data.timing_risk,
        "device_risk": data.device_risk,
    }

    # Pass optional enriched context so ML logic can analyze the actual UPI ID
    if data.payee_id is not None:
        features["payee_id"] = data.payee_id
    if data.amount_value is not None:
        features["amount_value"] = data.amount_value
    if data.hour_of_day is not None:
        features["hour_of_day"] = data.hour_of_day

    # 2. Call the ML Logic (Separation of Concerns)
    result = ml_analyze(features)

    # 3. Return Structured Response
    return AnalysisResult(
        risk_score=result["risk_score"],
        risk_label=result["risk_label"],
        reasons=result["reasons"],
        timestamp=datetime.now()
    )

