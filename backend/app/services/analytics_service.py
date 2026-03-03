from sqlalchemy.orm import Session
from app.models.models import ActivitySubmission, Activity, ProgressLog
from datetime import datetime, timedelta
from collections import Counter
import json

class AnalyticsService:
    @staticmethod
    def calculate_consistency_score(db: Session, user_id: int, days: int = 7):
        start_date = datetime.utcnow() - timedelta(days=days)
        submissions = db.query(ActivitySubmission).filter(
            ActivitySubmission.user_id == user_id,
            ActivitySubmission.submitted_at >= start_date
        ).all()
        
        if not submissions:
            return 0.0
        
        dates = set([s.submitted_at.date() for s in submissions])
        consistency = (len(dates) / days) * 100
        return round(min(consistency, 100), 2)
    
    @staticmethod
    def calculate_engagement_score(db: Session, user_id: int):
        submissions = db.query(ActivitySubmission).filter(
            ActivitySubmission.user_id == user_id
        ).all()
        
        if not submissions:
            return 0.0
        
        total_activities = db.query(Activity).count()
        completed = len(submissions)
        avg_rating = sum([s.feedback_rating for s in submissions if s.feedback_rating]) / len(submissions) if submissions else 0
        
        engagement = ((completed / max(total_activities, 1)) * 70) + (avg_rating * 6)
        return round(min(engagement, 100), 2)
    
    @staticmethod
    def get_domain_summary(db: Session, user_id: int):
        submissions = db.query(ActivitySubmission).join(Activity).filter(
            ActivitySubmission.user_id == user_id
        ).all()
        
        domains = [db.query(Activity).filter(Activity.id == s.activity_id).first().domain for s in submissions]
        domain_counts = Counter(domains)
        
        return dict(domain_counts)
    
    @staticmethod
    def create_progress_log(db: Session, user_id: int):
        consistency = AnalyticsService.calculate_consistency_score(db, user_id)
        engagement = AnalyticsService.calculate_engagement_score(db, user_id)
        domain_summary = AnalyticsService.get_domain_summary(db, user_id)
        
        log = ProgressLog(
            user_id=user_id,
            consistency_score=consistency,
            engagement_score=engagement,
            domain_summary=json.dumps(domain_summary),
            week_start=datetime.utcnow() - timedelta(days=7),
            week_end=datetime.utcnow()
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
    
    @staticmethod
    def get_activity_completion_chart(db: Session, user_id: int):
        submissions = db.query(ActivitySubmission).filter(
            ActivitySubmission.user_id == user_id
        ).all()
        
        dates = {}
        for s in submissions:
            date_key = s.submitted_at.strftime("%Y-%m-%d")
            dates[date_key] = dates.get(date_key, 0) + 1
        
        return dates
    
    @staticmethod
    def get_domain_engagement_chart(db: Session, user_id: int):
        return AnalyticsService.get_domain_summary(db, user_id)
