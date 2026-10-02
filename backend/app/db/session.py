import logging
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, Text, DateTime, text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from ..core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

class UserPreferenceRecord(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(64), unique=True, index=True, default="default_user")
    name = Column(String(128), default="Ameya")
    persona = Column(String(64), default="commuter")
    preferred_transit = Column(String(64), default="two_wheeler")
    respiratory_sensitive = Column(Boolean, default=False)
    heat_sensitive = Column(Boolean, default=False)
    uv_sensitive = Column(Boolean, default=False)
    monsoon_vulnerable = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow)

class SavedLocationRecord(Base):
    __tablename__ = "saved_locations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(64), index=True, default="default_user")
    name = Column(String(128))
    state = Column(String(128))
    lat = Column(Float)
    lon = Column(Float)
    is_home = Column(Boolean, default=False)
    is_work = Column(Boolean, default=False)

class FeedbackRecord(Base):
    __tablename__ = "feedback_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(64), index=True, nullable=True)
    name = Column(String(128), nullable=True)
    email = Column(String(128), nullable=True)
    category = Column(String(64), nullable=False)
    rating = Column(Integer, nullable=False, default=5)
    comment = Column(Text, nullable=False)
    location = Column(String(128), nullable=True)
    submission_hash = Column(String(64), index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserPointsRecord(Base):
    """Authoritative server-side points and ranking record for citizens."""
    __tablename__ = "user_points"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(64), unique=True, index=True, nullable=False)
    display_name = Column(String(128), default="Anonymous Citizen")
    total_points = Column(Integer, default=0, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, index=True)

class PointTransactionRecord(Base):
    """Audit trail recording each server-side point award."""
    __tablename__ = "point_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(64), index=True, nullable=False)
    feedback_id = Column(Integer, index=True, nullable=True)
    points = Column(Integer, nullable=False)
    reason = Column(String(128), default="Valid feedback submission")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class IssueReportRecord(Base):
    __tablename__ = "issue_reports"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    location_name = Column(String(128), nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    app_version = Column(String(32), default="1.0.0")
    timestamp = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

def _ensure_schema_migrations(target_engine):
    """Safely adds missing columns to existing SQLite tables if not present."""
    try:
        with target_engine.connect() as conn:
            # Check feedback_records table columns
            res = conn.execute(text("PRAGMA table_info(feedback_records)")).fetchall()
            cols = [r[1] for r in res]
            if cols and "user_id" not in cols:
                conn.execute(text("ALTER TABLE feedback_records ADD COLUMN user_id VARCHAR(64)"))
            if cols and "submission_hash" not in cols:
                conn.execute(text("ALTER TABLE feedback_records ADD COLUMN submission_hash VARCHAR(64)"))
            conn.commit()
    except Exception as e:
        logger.warning(f"Schema migration note: {e}")

# Database Engine initialization with graceful fallback
try:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    _ensure_schema_migrations(engine)
except Exception as e:
    logger.warning(f"Could not connect to {settings.DATABASE_URL}: {e}. Falling back to SQLite memory/file.")
    engine = create_engine("sqlite:///./vayusync.db", connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    _ensure_schema_migrations(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
