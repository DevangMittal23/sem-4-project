from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.behavior_tracking_service import BehaviorTrackingService
from app.auth.auth import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/user-engagement")
def get_user_engagement(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get comprehensive user engagement metrics"""
    metrics = BehaviorTrackingService.get_user_engagement_metrics(db, current_user.id)
    return metrics

@router.get("/event-timeline")
def get_event_timeline(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user event timeline"""
    timeline = BehaviorTrackingService.get_event_timeline(db, current_user.id)
    return {"events": timeline}
