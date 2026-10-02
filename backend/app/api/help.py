import hashlib
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from ..core.config import settings
from ..db.session import (
    get_db, 
    FeedbackRecord, 
    IssueReportRecord, 
    UserPointsRecord, 
    PointTransactionRecord
)

router = APIRouter(prefix="/help", tags=["Help & Support"])

class FeedbackCreate(BaseModel):
    user_id: Optional[str] = Field(None, max_length=64)
    name: Optional[str] = Field(None, max_length=128)
    email: Optional[str] = Field(None, max_length=128)
    category: str = Field(..., max_length=64)
    rating: int = Field(5, ge=1, le=5)
    comment: str = Field(..., min_length=1, max_length=500)
    location: Optional[str] = Field(None, max_length=128)

class IssueReportCreate(BaseModel):
    category: str = Field(..., max_length=64)
    description: str = Field(..., min_length=1, max_length=1500)
    location_name: Optional[str] = Field(None, max_length=128)
    lat: Optional[float] = None
    lon: Optional[float] = None
    app_version: str = Field("1.0.0", max_length=32)
    timestamp: Optional[str] = None

EMERGENCY_NUMBERS = [
    {
        "service": "National Emergency Helpline (All-in-One)",
        "number": "112",
        "badge": "24/7 Pan-India",
        "description": "Unified emergency response for Police, Fire, Ambulance, and Disaster events.",
        "icon": "phone-call",
        "priority": "critical",
    },
    {
        "service": "National Disaster Management Helpline (NDMA)",
        "number": "1078",
        "badge": "Toll-Free",
        "description": "Emergency coordination for cyclones, severe floods, heatwaves, and landslides.",
        "icon": "shield-alert",
        "priority": "high",
    },
    {
        "service": "NDRF National Command Control Room",
        "number": "011-24363260",
        "badge": "Rescue Force",
        "description": "Direct dispatch operations for National Disaster Response Force deployment.",
        "icon": "life-buoy",
        "priority": "high",
    },
    {
        "service": "Ambulance & Medical Emergency",
        "number": "108",
        "badge": "Medical",
        "description": "Immediate trauma care, heatstroke response, and emergency hospitalization transit.",
        "icon": "heart-pulse",
        "priority": "critical",
    },
    {
        "service": "Fire & Rescue Services",
        "number": "101",
        "badge": "Fire Safety",
        "description": "Building fires, chemical hazards, and storm debris rescue.",
        "icon": "flame",
        "priority": "critical",
    },
    {
        "service": "Police Emergency",
        "number": "100",
        "badge": "Security",
        "description": "Public safety, highway traffic emergencies, and localized crowd safety.",
        "icon": "shield",
        "priority": "high",
    },
    {
        "service": "Women Safety Helpline",
        "number": "1091",
        "badge": "Assistance",
        "description": "Round-the-clock safety, transit escort helpline, and emergency distress support.",
        "icon": "users",
        "priority": "high",
    },
    {
        "service": "IMD Mausam Seva (Weather Enquiry)",
        "number": "1800-180-1717",
        "badge": "Meteorological",
        "description": "India Meteorological Department official public toll-free weather query line.",
        "icon": "cloud-sun",
        "priority": "standard",
    },
    {
        "service": "Kisan Call Centre (Agriculture / Krishi)",
        "number": "1800-180-1551",
        "badge": "Agromet",
        "description": "Ministry of Agriculture & Farmers Welfare crop weather protection advisory.",
        "icon": "sprout",
        "priority": "standard",
    },
]

HELPLINE_CATEGORIES = [
    {
        "category": "Weather & Disaster Assistance",
        "contacts": [
            {"title": "National Disaster Helpline", "number": "1078", "hours": "24/7 Toll-free"},
            {"title": "NDRF Control Room", "number": "9711077372", "hours": "24/7 Operations"},
            {"title": "IMD Weather Information Desk", "number": "011-24651212", "hours": "06:00 - 22:00 IST"},
            {"title": "Central Water Commission (Flood Alert)", "number": "011-26106523", "hours": "24/7 Monsoon Room"},
        ],
    },
    {
        "category": "Emergency & Medical Assistance",
        "contacts": [
            {"title": "National Emergency Unified", "number": "112", "hours": "24/7 All-in-One"},
            {"title": "National Health Helpline", "number": "1800-180-1104", "hours": "24/7 Medical Advice"},
            {"title": "Red Cross Emergency First Aid", "number": "011-23716441", "hours": "24/7 Support"},
        ],
    },
    {
        "category": "General & Citizen Support",
        "contacts": [
            {"title": "Kisan Call Centre (Krishi Support)", "number": "1800-180-1551", "hours": "06:00 - 22:00 IST (All Indian Languages)"},
            {"title": "National Highway Helpline (NHAI)", "number": "1033", "hours": "24/7 Interstate Road Assistance"},
            {"title": "CPCB Air Pollution Complaint Desk", "number": "011-43102480", "hours": "Office Hours"},
        ],
    },
    {
        "category": "Technical & Platform Support",
        "contacts": [
            {"title": "VayuSync Platform Desk", "number": "support@vayusync.in", "hours": "Email Response < 4 hrs"},
            {"title": "Mausam Help Desk", "number": "support@mausam.gov.in", "hours": "General Support"},
        ],
    },
]

@router.get("/emergency-contacts")
async def get_emergency_contacts():
    """Returns verified national emergency contacts and categorized helplines."""
    return {
        "emergency_numbers": EMERGENCY_NUMBERS,
        "helpline_categories": HELPLINE_CATEGORIES,
    }

@router.post("/feedback")
async def submit_feedback(
    payload: FeedbackCreate, 
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Validates and stores citizen feedback, atomically awards points, updates user total points,
    and returns updated points and national ranking.
    """
    clean_comment = payload.comment.strip()
    if len(clean_comment) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback comments must be at least 5 characters long.",
        )
    if not (1 <= payload.rating <= 5):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experience rating must be between 1 and 5.",
        )

    # Determine stable user identifier
    raw_user_id = payload.user_id or request.headers.get("x-user-id")
    user_id = (raw_user_id.strip() if raw_user_id else "default_user")[:64]

    # Clean display name (if provided, otherwise use existing or Anonymous Citizen)
    submitted_name = payload.name.strip() if payload.name and payload.name.strip() else None

    # Anti-abuse & Duplicate detection (cooldown within 60 seconds for identical content)
    submission_signature = f"{user_id}:{payload.category}:{clean_comment.lower()}".encode("utf-8")
    sub_hash = hashlib.sha256(submission_signature).hexdigest()

    cooldown_cutoff = datetime.utcnow() - timedelta(seconds=60)
    recent_duplicate = (
        db.query(FeedbackRecord)
        .filter(
            FeedbackRecord.user_id == user_id,
            FeedbackRecord.submission_hash == sub_hash,
            FeedbackRecord.created_at >= cooldown_cutoff
        )
        .first()
    )
    if recent_duplicate:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Identical feedback submitted recently. Please allow at least 60 seconds between identical submissions.",
        )

    points_to_award = settings.POINTS_PER_VALID_FEEDBACK

    try:
        # 1. Create Feedback Record
        feedback_record = FeedbackRecord(
            user_id=user_id,
            name=submitted_name or "Anonymous Citizen",
            email=payload.email,
            category=payload.category,
            rating=payload.rating,
            comment=clean_comment,
            location=payload.location,
            submission_hash=sub_hash,
            created_at=datetime.utcnow(),
        )
        db.add(feedback_record)
        db.flush()  # populate feedback_record.id

        # 2. Update or Create User Points Record
        user_points_rec = (
            db.query(UserPointsRecord)
            .filter(UserPointsRecord.user_id == user_id)
            .first()
        )
        now = datetime.utcnow()
        if not user_points_rec:
            user_points_rec = UserPointsRecord(
                user_id=user_id,
                display_name=submitted_name or "Anonymous Citizen",
                total_points=points_to_award,
                updated_at=now,
            )
            db.add(user_points_rec)
        else:
            user_points_rec.total_points += points_to_award
            if submitted_name:
                user_points_rec.display_name = submitted_name
            user_points_rec.updated_at = now

        # 3. Create Audit Trail Transaction Record
        transaction_rec = PointTransactionRecord(
            user_id=user_id,
            feedback_id=feedback_record.id,
            points=points_to_award,
            reason=f"Valid citizen feedback: {payload.category}",
            created_at=now,
        )
        db.add(transaction_rec)

        # Atomic commit
        db.commit()
        db.refresh(feedback_record)
        db.refresh(user_points_rec)

        # 4. Calculate Deterministic National Rank
        # Tie-breaking rule: Higher total_points first; if equal, earlier updated_at first.
        rank = (
            db.query(UserPointsRecord)
            .filter(
                (UserPointsRecord.total_points > user_points_rec.total_points)
                | (
                    (UserPointsRecord.total_points == user_points_rec.total_points)
                    & (UserPointsRecord.updated_at < user_points_rec.updated_at)
                )
            )
            .count()
            + 1
        )

        return {
            "status": "success",
            "id": feedback_record.id,
            "message": f"Thank you! Your feedback has been recorded. You earned +{points_to_award} points!",
            "points_awarded": points_to_award,
            "total_points": user_points_rec.total_points,
            "national_rank": rank,
            "created_at": feedback_record.created_at.isoformat(),
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record feedback: {str(e)}",
        )

@router.get("/leaderboard")
async def get_national_leaderboard(
    user_id: Optional[str] = Query(None),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Returns the National Top 100 Leaderboard sorted by total points in descending order.
    Tie-breaking rule:
      1. Higher total points first (total_points DESC).
      2. If points are equal, earlier achievement timestamp first (updated_at ASC).
    Also returns the requesting user's current points and national rank even if outside the Top 100.
    """
    effective_user_id = user_id or (request.headers.get("x-user-id") if request else None)
    if effective_user_id:
        effective_user_id = effective_user_id.strip()[:64]

    # Query Top 100
    top_records = (
        db.query(UserPointsRecord)
        .order_by(
            desc(UserPointsRecord.total_points),
            asc(UserPointsRecord.updated_at)
        )
        .limit(100)
        .all()
    )

    leaderboard_list = []
    current_user_found_in_top100 = False

    for idx, r in enumerate(top_records, start=1):
        is_me = bool(effective_user_id and r.user_id == effective_user_id)
        if is_me:
            current_user_found_in_top100 = True
        leaderboard_list.append({
            "rank": idx,
            "name": r.display_name or "Anonymous Citizen",
            "points": r.total_points,
            "is_current_user": is_me,
        })

    # Current user info
    current_user_info = {
        "user_id": effective_user_id or "guest",
        "name": "Anonymous Citizen",
        "points": 0,
        "rank": None,
        "in_top_100": False,
    }

    if effective_user_id:
        user_record = (
            db.query(UserPointsRecord)
            .filter(UserPointsRecord.user_id == effective_user_id)
            .first()
        )
        if user_record:
            # Deterministic rank calculation across all national users
            user_rank = (
                db.query(UserPointsRecord)
                .filter(
                    (UserPointsRecord.total_points > user_record.total_points)
                    | (
                        (UserPointsRecord.total_points == user_record.total_points)
                        & (UserPointsRecord.updated_at < user_record.updated_at)
                    )
                )
                .count()
                + 1
            )
            current_user_info["name"] = user_record.display_name or "Anonymous Citizen"
            current_user_info["points"] = user_record.total_points
            current_user_info["rank"] = user_rank
            current_user_info["in_top_100"] = user_rank <= 100

    return {
        "leaderboard": leaderboard_list,
        "currentUser": current_user_info,
        "pointsPerFeedback": settings.POINTS_PER_VALID_FEEDBACK,
    }

@router.post("/report-issue")
async def submit_issue_report(payload: IssueReportCreate, db: Session = Depends(get_db)):
    """Validates and logs an issue report with location and telemetry context."""
    try:
        record = IssueReportRecord(
            category=payload.category,
            description=payload.description.strip(),
            location_name=payload.location_name,
            lat=payload.lat,
            lon=payload.lon,
            app_version=payload.app_version,
            timestamp=payload.timestamp or datetime.utcnow().isoformat(),
            created_at=datetime.utcnow(),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return {
            "status": "success",
            "id": record.id,
            "ticket_number": f"MAUSAM-{record.id:05d}",
            "message": "Issue report logged successfully. Our team will review the telemetry.",
            "created_at": record.created_at.isoformat(),
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record issue report: {str(e)}",
        )
