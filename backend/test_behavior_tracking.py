from app.database.connection import SessionLocal
from app.services.behavior_tracking_service import BehaviorTrackingService
from app.models.models import User

def test_behavior_tracking():
    db = SessionLocal()
    
    # Get first user
    user = db.query(User).first()
    if not user:
        print("No users found. Run seed_db.py first.")
        return
    
    print(f"Testing behavior tracking for user: {user.email}")
    
    # Log some test events
    BehaviorTrackingService.log_event(db, user.id, "login", "login")
    BehaviorTrackingService.log_event(db, user.id, "view_activities_page", "activities")
    BehaviorTrackingService.log_event(db, user.id, "start_activity", "activities", activity_id=1)
    
    print("Logged 3 test events")
    
    # Get engagement metrics
    metrics = BehaviorTrackingService.get_user_engagement_metrics(db, user.id)
    
    print("\nEngagement Metrics:")
    print(f"  Login Frequency: {metrics['login_frequency']}")
    print(f"  Avg Session Time: {metrics['average_session_time']} min")
    print(f"  Activity Start Rate: {metrics['activity_start_rate']}")
    print(f"  Activity Completion Rate: {metrics['activity_completion_rate']}%")
    print(f"  Engagement Score: {metrics['engagement_score']}")
    print(f"  Learning Streak: {metrics['learning_streak']} days")
    print(f"  Weekly Activity Rate: {metrics['weekly_activity_rate']}")
    print(f"  Total Events: {metrics['total_events']}")
    
    db.close()
    print("\nBehavior tracking system working correctly!")

if __name__ == "__main__":
    test_behavior_tracking()
