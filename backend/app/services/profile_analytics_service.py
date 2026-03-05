from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import UserSkill, UserActivityLog, ProgressLog

class ProfileAnalyticsService:
    @staticmethod
    def get_analytics(db: Session, user_id: int):
        skill_count = db.query(UserSkill).filter(UserSkill.user_id == user_id).count()
        
        # Strongest and weakest domains by confidence
        skills = db.query(UserSkill.skill_category, func.avg(UserSkill.confidence_score).label('avg_score'))\
            .filter(UserSkill.user_id == user_id)\
            .group_by(UserSkill.skill_category)\
            .all()
        
        strongest_domain = max(skills, key=lambda x: x.avg_score).skill_category if skills else None
        weakest_domain = min(skills, key=lambda x: x.avg_score).skill_category if skills else None
        
        # Activity completion rate
        total_activities = db.query(UserActivityLog).filter(UserActivityLog.user_id == user_id).count()
        completed = db.query(UserActivityLog).filter(
            UserActivityLog.user_id == user_id,
            UserActivityLog.status == "completed"
        ).count()
        completion_rate = (completed / total_activities * 100) if total_activities > 0 else 0.0
        
        # Latest consistency score
        latest_log = db.query(ProgressLog).filter(ProgressLog.user_id == user_id)\
            .order_by(ProgressLog.created_at.desc()).first()
        consistency_score = latest_log.consistency_score if latest_log else 0.0
        
        return {
            "skill_count": skill_count,
            "strongest_domain": strongest_domain,
            "weakest_domain": weakest_domain,
            "activity_completion_rate": round(completion_rate, 2),
            "consistency_score": round(consistency_score, 2)
        }
