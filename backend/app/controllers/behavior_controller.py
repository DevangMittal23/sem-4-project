from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.behavior_metrics import BehaviorMetricsService
from app.auth.auth import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/behavior-summary")
def get_behavior_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get comprehensive behavior metrics for AI readiness"""
    return BehaviorMetricsService.get_behavior_summary(db, current_user.id)
