"""
database.py — SQLAlchemy engine + session factory
Reads DATABASE_URL from environment. Falls back gracefully if not set.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL", "")

# Neon / Railway PostgreSQL use postgres:// — SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Use SQLite as local fallback when DATABASE_URL is not configured
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./cypher_local.db"

engine = create_engine(
    DATABASE_URL,
    # SQLite doesn't support pool options; skip for Postgres
    **({} if "sqlite" in DATABASE_URL else {"pool_pre_ping": True})
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
