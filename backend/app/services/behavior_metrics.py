from sqlalchemy.orm import Session
from app.models.models import ActivitySubmission, Activity
from datetime import datetime, timedelta
from collections import Counter

class BehaviorMetricsService:
    @staticmethod
    def calculate_engagement_score(db: Session, user_id: int) -> float:
        """Calculate user engagement based on completion rate, attempts, and frequency"""
        submissions = db.query(ActivitySubmission).filter(
            ActivitySubmission.user_id == user_id
        ).all()
        
        if not submissions:
            return 0.0
        
        total_activities = db.query(Activity).count()
        completed = len(submissions)
        
        # Completion rate (0-40 points)
        completion_rate = (completed / max(total_activities, 1)) * 40
        
        # Average rating (0-30 points)
        ratings = [s.feedback_rating for s in submissions if s.feedback_rating]
        avg_rating = (sum(ratings) / len(ratings) * 6) if ratings else 0
        
        # Activity frequency (0-30 points)
        recent_submissions = [s for s in submissions if 
                            (datetime.utcnow() - s.submitted_at).days <= 30]
        frequency_score = min(len(recent_submissions) * 3, 30)
        
        total_score = completion_rate + avg_rating + frequency_score
        return round(min(total_score, 100), 2)
    
    @staticmethod
    def calculate_consistency_score(db: Session, user_id: int, days: int = 7) -> float:
        """Calculate consistency based on weekly participation and gaps"""
        start_date = datetime.utcnow() - timedelta(days=days)
        submissions = db.query(ActivitySubmission).filter(
            ActivitySubmission.user_id == user_id,
            ActivitySubmission.submitted_at >= start_date
        ).all()
        
        if not submissions:
            return 0.0
        
        # Unique days with activity
        active_days = set([s.submitted_at.date() for s in submissions])
        consistency = (len(active_days) / days) * 100
        
        return round(min(consistency, 100), 2)
    
    @staticmethod
    def calculate_domain_participation(db: Session, user_id: int) -> dict:
        """Calculate participation score per domain"""
        submissions = db.query(ActivitySubmission).join(Activity).filter(
            ActivitySubmission.user_id == user_id
        ).all()
        
        domain_counts = {}
        for sub in submissions:
            activity = db.query(Activity).filter(Activity.id == sub.activity_id).first()
            if activity:
                domain = activity.domain
                if domain not in domain_counts:
                    domain_counts[domain] = {
                        'count': 0,
                        'avg_rating': 0,
                        'total_time': 0
                    }
                domain_counts[domain]['count'] += 1
                if sub.feedback_rating:
                    domain_counts[domain]['avg_rating'] += sub.feedback_rating
                if sub.completion_time:
                    domain_counts[domain]['total_time'] += sub.completion_time
        
        # Calculate averages
        for domain in domain_counts:
            count = domain_counts[domain]['count']
            if count > 0:
                domain_counts[domain]['avg_rating'] = round(
                    domain_counts[domain]['avg_rating'] / count, 2
                )
                domain_counts[domain]['participation_score'] = min(count * 10, 100)
        
        return domain_counts
    
    @staticmethod
    def get_behavior_summary(db: Session, user_id: int) -> dict:
        """Get comprehensive behavior summary for AI readiness"""
        submissions = db.query(ActivitySubmission).filter(
            ActivitySubmission.user_id == user_id
        ).all()
        
        if not submissions:
            return {
                'engagement_score': 0,
                'consistency_score': 0,
                'total_activities': 0,
                'avg_completion_time': 0,
                'retry_rate': 0,
                'domain_participation': {},
                'weekly_activity_count': 0
            }
        
        # Calculate metrics
        engagement = BehaviorMetricsService.calculate_engagement_score(db, user_id)
        consistency = BehaviorMetricsService.calculate_consistency_score(db, user_id)
        domain_participation = BehaviorMetricsService.calculate_domain_participation(db, user_id)
        
        # Completion time
        completion_times = [s.completion_time for s in submissions if s.completion_time]
        avg_completion_time = sum(completion_times) / len(completion_times) if completion_times else 0
        
        # Retry rate
        total_attempts = sum([s.attempts_count for s in submissions])
        retry_rate = ((total_attempts - len(submissions)) / len(submissions)) * 100 if submissions else 0
        
        # Weekly activity count
        week_ago = datetime.utcnow() - timedelta(days=7)
        weekly_count = len([s for s in submissions if s.submitted_at >= week_ago])
        
        return {
            'engagement_score': engagement,
            'consistency_score': consistency,
            'total_activities': len(submissions),
            'avg_completion_time': round(avg_completion_time, 2),
            'retry_rate': round(retry_rate, 2),
            'domain_participation': domain_participation,
            'weekly_activity_count': weekly_count,
            'last_activity_date': max([s.submitted_at for s in submissions]).isoformat() if submissions else None
        }
