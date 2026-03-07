from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from app.models.models import UserBehaviorEvent, ActivitySubmission, UserActivityLog
from datetime import datetime, timedelta
import json

class BehaviorTrackingService:
    @staticmethod
    def log_event(db: Session, user_id: int, event_type: str, page: str = None, 
                  activity_id: int = None, metadata: dict = None):
        """Manually log a behavior event"""
        event = UserBehaviorEvent(
            user_id=user_id,
            event_type=event_type,
            page=page,
            activity_id=activity_id,
            timestamp=datetime.utcnow(),
            metadata_json=json.dumps(metadata or {})
        )
        db.add(event)
        db.commit()
        return event
    
    @staticmethod
    def get_user_engagement_metrics(db: Session, user_id: int, days: int = 30):
        """Calculate comprehensive engagement metrics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get all events
        events = db.query(UserBehaviorEvent).filter(
            UserBehaviorEvent.user_id == user_id,
            UserBehaviorEvent.timestamp >= start_date
        ).all()
        
        if not events:
            return {
                "login_frequency": 0,
                "average_session_time": 0,
                "activity_start_rate": 0,
                "activity_completion_rate": 0,
                "engagement_score": 0,
                "learning_streak": 0,
                "weekly_activity_rate": 0,
                "total_events": 0
            }
        
        # Login frequency
        login_events = [e for e in events if e.event_type == "login"]
        login_frequency = len(login_events) / days if days > 0 else 0
        
        # Session time estimation (time between login and last event in session)
        sessions = []
        current_session = []
        for event in sorted(events, key=lambda x: x.timestamp):
            if event.event_type == "login":
                if current_session:
                    sessions.append(current_session)
                current_session = [event]
            else:
                current_session.append(event)
        if current_session:
            sessions.append(current_session)
        
        session_times = []
        for session in sessions:
            if len(session) > 1:
                duration = (session[-1].timestamp - session[0].timestamp).total_seconds() / 60
                session_times.append(duration)
        
        avg_session_time = sum(session_times) / len(session_times) if session_times else 0
        
        # Activity rates
        start_events = [e for e in events if e.event_type == "start_activity"]
        complete_events = [e for e in events if e.event_type == "complete_activity"]
        
        activity_start_rate = len(start_events) / days if days > 0 else 0
        activity_completion_rate = (len(complete_events) / len(start_events) * 100) if start_events else 0
        
        # Learning streak (consecutive days with activity)
        event_dates = sorted(set([e.timestamp.date() for e in events]))
        streak = 0
        current_streak = 0
        for i, date in enumerate(event_dates):
            if i == 0:
                current_streak = 1
            elif (date - event_dates[i-1]).days == 1:
                current_streak += 1
            else:
                streak = max(streak, current_streak)
                current_streak = 1
        streak = max(streak, current_streak)
        
        # Weekly activity rate
        weekly_events = [e for e in events if e.timestamp >= datetime.utcnow() - timedelta(days=7)]
        weekly_activity_rate = len(weekly_events) / 7
        
        # Engagement score (0-100)
        engagement_score = min(100, (
            (login_frequency * 10) +
            (min(avg_session_time, 30) / 30 * 20) +
            (activity_start_rate * 15) +
            (activity_completion_rate * 0.3) +
            (streak * 2) +
            (weekly_activity_rate * 5)
        ))
        
        return {
            "login_frequency": round(login_frequency, 2),
            "average_session_time": round(avg_session_time, 2),
            "activity_start_rate": round(activity_start_rate, 2),
            "activity_completion_rate": round(activity_completion_rate, 2),
            "engagement_score": round(engagement_score, 2),
            "learning_streak": streak,
            "weekly_activity_rate": round(weekly_activity_rate, 2),
            "total_events": len(events)
        }
    
    @staticmethod
    def get_event_timeline(db: Session, user_id: int, days: int = 30):
        """Get timeline of user events"""
        start_date = datetime.utcnow() - timedelta(days=days)
        events = db.query(UserBehaviorEvent).filter(
            UserBehaviorEvent.user_id == user_id,
            UserBehaviorEvent.timestamp >= start_date
        ).order_by(UserBehaviorEvent.timestamp.desc()).limit(100).all()
        
        return [{
            "event_type": e.event_type,
            "page": e.page,
            "activity_id": e.activity_id,
            "timestamp": e.timestamp.isoformat(),
            "metadata": json.loads(e.metadata_json) if e.metadata_json else {}
        } for e in events]
