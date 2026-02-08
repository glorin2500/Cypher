"""
ML Router - API endpoints for ML predictions
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os

# Add backend root to path
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

try:
    from ml.predictor import UPIPhishingPredictor
    predictor = UPIPhishingPredictor()
    ML_AVAILABLE = True
except Exception as e:
    print(f"⚠️  ML model not loaded: {e}")
    import traceback
    traceback.print_exc()
    ML_AVAILABLE = False

router = APIRouter()


class UPIPredictionRequest(BaseModel):
    upi_id: str


class UPIPredictionResponse(BaseModel):
    upi_id: str
    is_phishing: bool
    phishing_probability: float
    confidence: str
    ml_available: bool


@router.post("/ml/predict_payee_risk", response_model=UPIPredictionResponse)
async def predict_payee_risk(request: UPIPredictionRequest):
    """
    Predict phishing probability for a UPI ID using ML model
    
    Args:
        upi_id: UPI ID string (e.g., "merchant@paytm")
    
    Returns:
        Prediction with phishing probability and confidence
    """
    if not ML_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="ML model not available. Please train the model first."
        )
    
    try:
        result = predictor.predict(request.upi_id)
        result['ml_available'] = True
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/ml/health")
async def ml_health():
    """Check if ML model is loaded and ready"""
    return {
        "ml_available": ML_AVAILABLE,
        "model_path": "ml/models/upi_classifier.pkl" if ML_AVAILABLE else None
    }
