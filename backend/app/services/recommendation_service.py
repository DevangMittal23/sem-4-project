from sqlalchemy.orm import Session
from app.models.models import ActivitySubmission, Activity, Recommendation
from app.services.analytics_service import AnalyticsService
import json

class RecommendationService:
    @staticmethod
    def generate_recommendations(db: Session, user_id: int):
        domain_summary = AnalyticsService.get_domain_summary(db, user_id)
        
        career_paths = []
        
        # Rule-based logic
        if domain_summary.get("Technical", 0) >= 3:
            career_paths.append("Software Engineering & Technical Leadership")
        
        if domain_summary.get("Writing", 0) >= 2 or domain_summary.get("Communication", 0) >= 2:
            career_paths.append("Content Strategy & Communication")
        
        if domain_summary.get("Business", 0) >= 2:
            career_paths.append("Product Management & Strategy")
        
        if not career_paths:
            career_paths = ["Explore More Activities", "General Professional Development", "Skill Discovery Path"]
        
        # Generate weekly roadmap
        weekly_roadmap = {
            "week_1": "Complete 2 activities in your strongest domain",
            "week_2": "Explore 1 new domain activity",
            "week_3": "Focus on skill depth with advanced activities",
            "week_4": "Review progress and adjust goals"
        }
        
        # Progress summary
        consistency = AnalyticsService.calculate_consistency_score(db, user_id)
        engagement = AnalyticsService.calculate_engagement_score(db, user_id)
        progress_summary = f"Consistency: {consistency}%, Engagement: {engagement}%. Keep up the momentum!"
        
        # Save recommendation
        recommendation = Recommendation(
            user_id=user_id,
            career_paths=json.dumps(career_paths),
            weekly_roadmap=json.dumps(weekly_roadmap),
            progress_summary=progress_summary
        )
        db.add(recommendation)
        db.commit()
        
        return {
            "career_paths": career_paths,
            "weekly_roadmap": weekly_roadmap,
            "progress_summary": progress_summary
        }
    
    @staticmethod
    def get_recommended_activities(db: Session, user_id: int, limit: int = 3):
        domain_summary = AnalyticsService.get_domain_summary(db, user_id)
        
        if not domain_summary:
            return db.query(Activity).limit(limit).all()
        
        top_domain = max(domain_summary, key=domain_summary.get)
        
        activities = db.query(Activity).filter(Activity.domain == top_domain).limit(limit).all()
        
        if len(activities) < limit:
            additional = db.query(Activity).filter(Activity.domain != top_domain).limit(limit - len(activities)).all()
            activities.extend(additional)
        
        return activities
