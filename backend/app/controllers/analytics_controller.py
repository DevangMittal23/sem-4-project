from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.analytics_service import AnalyticsService
from app.services.skill_growth_analytics_service import SkillGrowthAnalyticsService
from app.auth.auth import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/completion-chart")
def get_completion_chart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AnalyticsService.get_activity_completion_chart(db, current_user.id)

@router.get("/domain-engagement")
def get_domain_engagement(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AnalyticsService.get_domain_engagement_chart(db, current_user.id)

@router.get("/consistency-score")
def get_consistency_score(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    score = AnalyticsService.calculate_consistency_score(db, current_user.id)
    return {"consistency_score": score}

@router.get("/engagement-score")
def get_engagement_score(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    score = AnalyticsService.calculate_engagement_score(db, current_user.id)
    return {"engagement_score": score}

@router.get("/skill-growth")
def get_skill_growth(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return SkillGrowthAnalyticsService.get_skill_growth_data(db, current_user.id)
