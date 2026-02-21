import json
import os
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session

from app.schemas import TransactionInput, AnalysisResult
from app.services.inference import analyze_transaction
from app.database import engine, get_db
from app import models
from app.user_settings import (
    load_settings,
    update_user_info,
    update_notifications,
    update_preferences
)
from app.routers import ml

# Create DB tables on startup (no-op if already exist)
models.Base.metadata.create_all(bind=engine)

# Rate limiter keyed by client IP
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Cypher Threat Engine")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — only allow our frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cypher-self.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "Authorization"],
)

# Register ML router
app.include_router(ml.router, prefix="/api", tags=["ml"])

# ===== USER SETTINGS ENDPOINTS =====
@app.get("/api/user/settings")
def get_user_settings():
    return load_settings()

@app.post("/api/user/info")
def update_user(data: dict):
    settings = update_user_info(name=data.get("name"), email=data.get("email"))
    return {"success": True, "settings": settings}

@app.post("/api/user/notifications")
def update_notification_settings(data: dict):
    settings = update_notifications(
        push_enabled=data.get("push_enabled"),
        email_alerts=data.get("email_alerts"),
        security_alerts=data.get("security_alerts")
    )
    return {"success": True, "settings": settings}

@app.post("/api/user/preferences")
def update_user_preferences(data: dict):
    settings = update_preferences(
        dark_mode=data.get("dark_mode"),
        haptic_feedback=data.get("haptic_feedback"),
        language=data.get("language")
    )
    return {"success": True, "settings": settings}

# ===== ANALYSIS ENDPOINT — 30/min per IP =====
@app.post("/analyze", response_model=AnalysisResult)
@limiter.limit("30/minute")
async def analyze(request: Request, data: TransactionInput, db: Session = Depends(get_db)):
    try:
        result = analyze_transaction(data)

        # Persist to database
        record = models.ScanRecord(
            upi_id=data.payee_id,
            risk_score=result.risk_score,
            risk_label=result.risk_label,
            reasons=json.dumps(result.reasons),
            user_id=request.headers.get("X-User-Id"),  # Clerk user ID from frontend header
        )
        db.add(record)
        db.commit()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== HISTORY — from PostgreSQL =====
@app.get("/history", response_model=list[AnalysisResult])
@limiter.limit("60/minute")
async def get_history(request: Request, db: Session = Depends(get_db)):
    user_id = request.headers.get("X-User-Id")
    # If user ID provided, return their history; otherwise return last 50 records
    if user_id:
        records = db.query(models.ScanRecord).filter(
            models.ScanRecord.user_id == user_id
        ).order_by(models.ScanRecord.timestamp.desc()).limit(50).all()
    else:
        records = db.query(models.ScanRecord).order_by(
            models.ScanRecord.timestamp.desc()
        ).limit(50).all()

    return [
        AnalysisResult(
            risk_score=r.risk_score,
            risk_label=r.risk_label,
            reasons=json.loads(r.reasons) if r.reasons else [],
            timestamp=r.timestamp,
        )
        for r in records
    ]

@app.get("/health")
def health_check():
    return {"status": "active", "engine": "cypher-ml-v1"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
