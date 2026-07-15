from typing import Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import verify_access_token
from app.models.recommendation import Recommendation
from app.models.history import UserHistory

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/{dosha}")
def get_recommendations(
    dosha: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_access_token),
    x_language: str = Header(default="en"),
):
    """Fetches personalized recommendations based on the user's dominant Dosha."""
    dosha_lower = dosha.lower()
    lang_lower = x_language.lower()

    row = (
        db.query(Recommendation)
        .filter(
            Recommendation.dosha == dosha_lower, Recommendation.language == lang_lower
        )
        .first()
    )

    if not row and lang_lower != "en":
        row = (
            db.query(Recommendation)
            .filter(Recommendation.dosha == dosha_lower, Recommendation.language == "en")
            .first()
        )

    if not row:
        return {}

    data = {
        "diet": row.diet,
        "yoga": row.yoga,
        "ayurvedic_guidance": row.ayurvedic_guidance,
        "routine": row.routine,
    }

    # Record history — fail silently
    try:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(seconds=60)
        recent = (
            db.query(UserHistory)
            .filter(
                UserHistory.user_id == str(user_id),
                UserHistory.dosha == dosha_lower,
                UserHistory.event_type == "recommendations_viewed",
                UserHistory.created_at >= cutoff,
            )
            .first()
        )
        if not recent:
            db.add(
                UserHistory(
                    user_id=str(user_id),
                    dosha=dosha_lower,
                    event_type="recommendations_viewed",
                )
            )
            db.commit()
    except Exception:
        db.rollback()

    return data
