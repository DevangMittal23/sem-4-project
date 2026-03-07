from sqlalchemy.orm import Session
from app.models.models import UserStreak, Badge, UserBadge, UserActivityLog, ActivitySubmission
from datetime import datetime, timedelta

class GamificationService:
    @staticmethod
    def update_streak(db: Session, user_id: int):
        """Update user streak based on activity"""
        streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        today = datetime.utcnow().date()
        
        if not streak:
            streak = UserStreak(
                user_id=user_id,
                current_streak=1,
                longest_streak=1,
                last_active_date=datetime.utcnow(),
                weekly_completed=1,
                week_start=datetime.utcnow()
            )
            db.add(streak)
        else:
            last_date = streak.last_active_date.date() if streak.last_active_date else None
            
            if last_date == today:
                return streak
            elif last_date == today - timedelta(days=1):
                streak.current_streak += 1
                if streak.current_streak > streak.longest_streak:
                    streak.longest_streak = streak.current_streak
            else:
                streak.current_streak = 1
            
            streak.last_active_date = datetime.utcnow()
            
            # Weekly goal tracking
            if streak.week_start and (datetime.utcnow() - streak.week_start).days >= 7:
                streak.weekly_completed = 0
                streak.week_start = datetime.utcnow()
            streak.weekly_completed += 1
        
        db.commit()
        db.refresh(streak)
        GamificationService.check_and_award_badges(db, user_id)
        return streak
    
    @staticmethod
    def get_user_streak(db: Session, user_id: int):
        """Get user streak data"""
        streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        if not streak:
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "weekly_goal": 5,
                "weekly_completed": 0,
                "weekly_progress": 0
            }
        
        weekly_progress = (streak.weekly_completed / streak.weekly_goal * 100) if streak.weekly_goal > 0 else 0
        
        return {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "weekly_goal": streak.weekly_goal,
            "weekly_completed": streak.weekly_completed,
            "weekly_progress": round(weekly_progress, 1)
        }
    
    @staticmethod
    def check_and_award_badges(db: Session, user_id: int):
        """Check and award badges based on achievements"""
        completed_count = db.query(UserActivityLog).filter(
            UserActivityLog.user_id == user_id,
            UserActivityLog.status == "completed"
        ).count()
        
        streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        
        badges_to_award = []
        
        # First Activity
        if completed_count >= 1:
            badges_to_award.append("first_activity")
        
        # 5 Activities
        if completed_count >= 5:
            badges_to_award.append("5_activities")
        
        # 10 Activities
        if completed_count >= 10:
            badges_to_award.append("10_activities")
        
        # 5 Day Streak
        if streak and streak.current_streak >= 5:
            badges_to_award.append("5_day_streak")
        
        # 10 Day Streak
        if streak and streak.current_streak >= 10:
            badges_to_award.append("10_day_streak")
        
        # Award badges
        for badge_criteria in badges_to_award:
            badge = db.query(Badge).filter(Badge.criteria == badge_criteria).first()
            if badge:
                existing = db.query(UserBadge).filter(
                    UserBadge.user_id == user_id,
                    UserBadge.badge_id == badge.id
                ).first()
                
                if not existing:
                    user_badge = UserBadge(user_id=user_id, badge_id=badge.id)
                    db.add(user_badge)
        
        db.commit()
    
    @staticmethod
    def get_user_badges(db: Session, user_id: int):
        """Get all badges earned by user"""
        user_badges = db.query(UserBadge, Badge).join(Badge).filter(
            UserBadge.user_id == user_id
        ).all()
        
        return [{
            "id": badge.id,
            "name": badge.name,
            "description": badge.description,
            "icon": badge.icon,
            "earned_at": user_badge.earned_at.isoformat()
        } for user_badge, badge in user_badges]
    
    @staticmethod
    def seed_badges(db: Session):
        """Seed initial badges"""
        badges = [
            Badge(name="First Steps", description="Complete your first activity", icon="🎯", criteria="first_activity"),
            Badge(name="Getting Started", description="Complete 5 activities", icon="⭐", criteria="5_activities"),
            Badge(name="Dedicated Learner", description="Complete 10 activities", icon="🏆", criteria="10_activities"),
            Badge(name="5 Day Streak", description="Maintain a 5-day learning streak", icon="🔥", criteria="5_day_streak"),
            Badge(name="10 Day Streak", description="Maintain a 10-day learning streak", icon="💪", criteria="10_day_streak"),
            Badge(name="Week Warrior", description="Complete weekly goal", icon="⚡", criteria="weekly_goal"),
        ]
        
        for badge in badges:
            existing = db.query(Badge).filter(Badge.criteria == badge.criteria).first()
            if not existing:
                db.add(badge)
        
        db.commit()
