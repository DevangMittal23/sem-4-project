from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.schemas import RecommendationResponse
from app.services.recommendation_service import RecommendationService
from app.auth.auth import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/generate", response_model=RecommendationResponse)
def generate_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return RecommendationService.generate_recommendations(db, current_user.id)
