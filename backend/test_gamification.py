from app.database.connection import SessionLocal
from app.services.gamification_service import GamificationService
from app.models.models import User
import sys
sys.path.append('.')
from ai.services.recommendation_engine import AIRecommendationEngine

def test_gamification():
    db = SessionLocal()
    
    user = db.query(User).first()
    if not user:
        print("No users found")
        return
    
    print(f"Testing gamification for: {user.email}\n")
    
    # Test streak
    streak = GamificationService.update_streak(db, user.id)
    print(f"Streak updated:")
    print(f"  Current: {streak.current_streak} days")
    print(f"  Longest: {streak.longest_streak} days")
    print(f"  Weekly: {streak.weekly_completed}/{streak.weekly_goal}\n")
    
    # Get streak data
    streak_data = GamificationService.get_user_streak(db, user.id)
    print(f"Streak Data: {streak_data}\n")
    
    # Get badges
    badges = GamificationService.get_user_badges(db, user.id)
    print(f"Badges earned: {len(badges)}")
    for badge in badges:
        print(f"  - {badge['icon']} {badge['name']}: {badge['description']}")
    
    # Test AI recommendations
    print("\nTesting AI Recommendations...")
    recs = AIRecommendationEngine.get_personalized_recommendations(db, user.id)
    print(f"Recommended Activities: {len(recs['recommended_activities'])}")
    print(f"Skill Focus Areas: {len(recs['skill_focus'])}")
    print(f"Weekly Plan Items: {len(recs['weekly_learning_plan'])}")
    
    db.close()
    print("\nGamification system working!")

if __name__ == "__main__":
    test_gamification()
