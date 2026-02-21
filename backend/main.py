from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.schemas import TransactionInput, AnalysisResult
from app.services.inference import analyze_transaction
from app.user_settings import (
    load_settings,
    update_user_info,
    update_notifications,
    update_preferences
)
from app.routers import ml

# Rate limiter keyed by client IP
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Cypher Threat Engine")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allow frontend to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cypher-self.vercel.app",
        "http://localhost:3000",            # local dev
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "Authorization"],
)

# Register ML router
app.include_router(ml.router, prefix="/api", tags=["ml"])

# In-memory history (session-scoped)
scan_history = []

# ===== USER SETTINGS ENDPOINTS =====
@app.get("/api/user/settings")
def get_user_settings():
    return load_settings()

@app.post("/api/user/info")
def update_user(data: dict):
    name = data.get("name")
    email = data.get("email")
    settings = update_user_info(name=name, email=email)
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

# ===== ANALYSIS ENDPOINT — 30 requests/minute per IP =====
@app.post("/analyze", response_model=AnalysisResult)
@limiter.limit("30/minute")
async def analyze(request: Request, data: TransactionInput):
    try:
        result = analyze_transaction(data)
        scan_history.append(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history", response_model=list[AnalysisResult])
@limiter.limit("60/minute")
async def get_history(request: Request):
    return scan_history

@app.get("/health")
def health_check():
    return {"status": "active", "engine": "cypher-ml-v1"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
