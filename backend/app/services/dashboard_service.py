from sqlalchemy.orm import Session
from app.services.user_service import UserService
from app.services.activity_service import ActivityService
from app.services.analytics_service import AnalyticsService
from app.services.recommendation_service import RecommendationService

class DashboardService:
    @staticmethod
    def get_dashboard_data(db: Session, user_id: int):
        profile = UserService.get_profile(db, user_id)
        submissions = ActivityService.get_user_submissions(db, user_id)
        consistency = AnalyticsService.calculate_consistency_score(db, user_id)
        engagement = AnalyticsService.calculate_engagement_score(db, user_id)
        recommended = RecommendationService.get_recommended_activities(db, user_id)
        
        return {
            "profile": profile,
            "completed_activities": len(submissions),
            "weekly_consistency": consistency,
            "progress_indicator": engagement,
            "recommended_activities": recommended
        }
