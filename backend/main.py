from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import TransactionInput, AnalysisResult
from app.services.inference import analyze_transaction
from app.user_settings import (
    load_settings, 
    update_user_info, 
    update_notifications, 
    update_preferences
)
from app.routers import ml

app = FastAPI(title="Cypher Threat Engine")

# Allow frontend to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local demo, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register ML router
app.include_router(ml.router, prefix="/api", tags=["ml"])

# In-memory history (Persistent for session)
scan_history = []

# ===== USER SETTINGS ENDPOINTS =====
@app.get("/api/user/settings")
def get_user_settings():
    """Get all user settings"""
    return load_settings()

@app.post("/api/user/info")
def update_user(data: dict):
    """Update user information"""
    name = data.get("name")
    email = data.get("email")
    settings = update_user_info(name=name, email=email)
    return {"success": True, "settings": settings}

@app.post("/api/user/notifications")
def update_notification_settings(data: dict):
    """Update notification settings"""
    settings = update_notifications(
        push_enabled=data.get("push_enabled"),
        email_alerts=data.get("email_alerts"),
        security_alerts=data.get("security_alerts")
    )
    return {"success": True, "settings": settings}

@app.post("/api/user/preferences")
def update_user_preferences(data: dict):
    """Update user preferences"""
    settings = update_preferences(
        dark_mode=data.get("dark_mode"),
        haptic_feedback=data.get("haptic_feedback"),
        language=data.get("language")
    )
    return {"success": True, "settings": settings}

# ===== ANALYSIS ENDPOINT =====
@app.post("/analyze", response_model=AnalysisResult)
async def analyze(data: TransactionInput):
    try:
        result = analyze_transaction(data)
        scan_history.append(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history", response_model=list[AnalysisResult])
def get_history():
    return scan_history

@app.get("/health")
def health_check():
    return {"status": "active", "engine": "cypher-ml-v1"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
