from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.gamification_service import GamificationService
from app.auth.auth import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/streak")
def get_streak(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user streak data"""
    return GamificationService.get_user_streak(db, current_user.id)

@router.get("/badges")
def get_badges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user badges"""
    badges = GamificationService.get_user_badges(db, current_user.id)
    return {"badges": badges}
