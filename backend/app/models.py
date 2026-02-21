"""
models.py — SQLAlchemy ORM models
"""
from sqlalchemy import Column, String, Float, DateTime, Integer
from datetime import datetime
from app.database import Base


class ScanRecord(Base):
    __tablename__ = "scan_records"

    id        = Column(Integer, primary_key=True, index=True, autoincrement=True)
    upi_id    = Column(String(120), nullable=True, index=True)
    risk_score = Column(Float, nullable=False)
    risk_label = Column(String(20), nullable=False)           # safe / warning / danger
    reasons   = Column(String(2000), nullable=True)           # JSON-encoded list
    user_id   = Column(String(120), nullable=True, index=True) # Clerk user ID (optional)
    timestamp = Column(DateTime, default=datetime.utcnow)
