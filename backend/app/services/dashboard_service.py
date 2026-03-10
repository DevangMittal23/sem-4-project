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
        
        profile_dict = {
            "name": profile.name,
            "current_job_role": profile.current_job_role,
            "location": profile.location,
            "career_goal": profile.career_goal,
            "years_of_experience": profile.years_of_experience,
            "weekly_available_time": profile.weekly_available_time
        } if profile else {}
        
        return {
            "profile": profile_dict,
            "completed_activities": len(submissions),
            "weekly_consistency": consistency,
            "progress_indicator": engagement,
            "recommended_activities": recommended
        }
