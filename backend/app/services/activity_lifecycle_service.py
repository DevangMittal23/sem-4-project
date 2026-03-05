from sqlalchemy.orm import Session
from app.models.models import UserActivityLog, Activity
from app.services.skill_tracking_service import SkillTrackingService
from datetime import datetime
from typing import Optional

class ActivityLifecycleService:
    @staticmethod
    def start_activity(db: Session, user_id: int, activity_id: int):
        # Check if already exists
        existing = db.query(UserActivityLog).filter(
            UserActivityLog.user_id == user_id,
            UserActivityLog.activity_id == activity_id
        ).first()
        
        if existing:
            if existing.status == "completed":
                return {"error": "Activity already completed"}
            existing.status = "in_progress"
            existing.start_time = datetime.utcnow()
            existing.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
            return existing
        
        log = UserActivityLog(
            user_id=user_id,
            activity_id=activity_id,
            status="in_progress",
            start_time=datetime.utcnow()
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
    
    @staticmethod
    def pause_activity(db: Session, user_id: int, activity_id: int):
        log = db.query(UserActivityLog).filter(
            UserActivityLog.user_id == user_id,
            UserActivityLog.activity_id == activity_id
        ).first()
        
        if not log:
            return None
        
        log.status = "paused"
        log.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(log)
        return log
    
    @staticmethod
    def resume_activity(db: Session, user_id: int, activity_id: int):
        log = db.query(UserActivityLog).filter(
            UserActivityLog.user_id == user_id,
            UserActivityLog.activity_id == activity_id
        ).first()
        
        if not log:
            return None
        
        log.status = "in_progress"
        log.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(log)
        return log
    
    @staticmethod
    def complete_activity(db: Session, user_id: int, activity_id: int, 
                         time_spent: int, difficulty: str, notes: Optional[str], 
                         project_link: Optional[str]):
        log = db.query(UserActivityLog).filter(
            UserActivityLog.user_id == user_id,
            UserActivityLog.activity_id == activity_id
        ).first()
        
        if not log:
            log = UserActivityLog(
                user_id=user_id,
                activity_id=activity_id,
                start_time=datetime.utcnow()
            )
            db.add(log)
        
        log.status = "completed"
        log.end_time = datetime.utcnow()
        log.time_spent_minutes = time_spent
        log.difficulty_feedback = difficulty
        log.completion_notes = notes
        log.project_link = project_link
        log.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(log)
        
        # Update skills based on activity completion
        updated_skills = SkillTrackingService.update_skills_on_completion(
            db, user_id, activity_id, difficulty
        )
        
        return {"log": log, "updated_skills": updated_skills}
    
    @staticmethod
    def get_user_progress(db: Session, user_id: int):
        logs = db.query(UserActivityLog).filter(
            UserActivityLog.user_id == user_id
        ).all()
        
        total_activities = db.query(Activity).count()
        completed = [l for l in logs if l.status == "completed"]
        in_progress = [l for l in logs if l.status == "in_progress"]
        
        avg_time = sum([l.time_spent_minutes for l in completed if l.time_spent_minutes]) / len(completed) if completed else 0
        
        return {
            "total_completed": len(completed),
            "in_progress": len(in_progress),
            "completion_rate": (len(completed) / total_activities * 100) if total_activities > 0 else 0,
            "average_time_minutes": round(avg_time, 2),
            "activities": logs
        }
    
    @staticmethod
    def get_activity_status(db: Session, user_id: int, activity_id: int):
        log = db.query(UserActivityLog).filter(
            UserActivityLog.user_id == user_id,
            UserActivityLog.activity_id == activity_id
        ).first()
        
        return log if log else None
