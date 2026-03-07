from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.auth.auth import get_current_user
from app.models.models import User
import sys
sys.path.append('.')
from ai.services.recommendation_engine import AIRecommendationEngine

router = APIRouter()

@router.get("/personalized")
def get_personalized_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get AI-powered personalized recommendations (currently rule-based)"""
    return AIRecommendationEngine.get_personalized_recommendations(db, current_user.id)
