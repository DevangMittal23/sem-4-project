from sqlalchemy.orm import Session
from app.models.models import UserActivityLog, Activity, UserSkill, UserProfile
from app.services.analytics_service import AnalyticsService

class AIRecommendationEngine:
    """
    Rule-based recommendation engine.
    Designed to be replaced with ML/LLM in future.
    """
    
    @staticmethod
    def get_personalized_recommendations(db: Session, user_id: int):
        """Generate personalized recommendations using rules"""
        
        # Get user data
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        completed = db.query(UserActivityLog).filter(
            UserActivityLog.user_id == user_id,
            UserActivityLog.status == "completed"
        ).all()
        
        skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
        consistency = AnalyticsService.calculate_consistency_score(db, user_id)
        
        # Rule-based logic
        recommended_activities = []
        skill_focus = []
        weekly_plan = []
        
        # Rule 1: Low consistency -> Recommend beginner activities
        if consistency < 30:
            activities = db.query(Activity).filter(
                Activity.difficulty == "Beginner"
            ).limit(3).all()
            recommended_activities.extend(activities)
            skill_focus.append("Start with small, manageable tasks")
            weekly_plan.append("Complete 2-3 beginner activities this week")
        
        # Rule 2: High technical skills -> Recommend advanced projects
        tech_skills = [s for s in skills if s.skill_category in ["Programming", "Technical"]]
        avg_tech_score = sum([s.confidence_score for s in tech_skills]) / len(tech_skills) if tech_skills else 0
        
        if avg_tech_score > 70:
            activities = db.query(Activity).filter(
                Activity.domain == "Technical",
                Activity.difficulty == "Advanced"
            ).limit(3).all()
            recommended_activities.extend(activities)
            skill_focus.append("Advanced technical projects")
            weekly_plan.append("Work on 1 complex technical project")
        
        # Rule 3: Career goal alignment
        if profile and profile.career_goal:
            if "data" in profile.career_goal.lower():
                activities = db.query(Activity).filter(
                    Activity.domain == "Technical"
                ).limit(2).all()
                recommended_activities.extend(activities)
                skill_focus.append("Data analysis and technical skills")
            elif "management" in profile.career_goal.lower():
                activities = db.query(Activity).filter(
                    Activity.domain == "Business"
                ).limit(2).all()
                recommended_activities.extend(activities)
                skill_focus.append("Business and leadership skills")
        
        # Rule 4: Weak skills -> Recommend improvement
        weak_skills = sorted(skills, key=lambda s: s.confidence_score)[:3]
        for skill in weak_skills:
            skill_focus.append(f"Improve {skill.skill_name} (current: {skill.confidence_score}%)")
        
        # Rule 5: Balanced learning
        if len(completed) > 5:
            domain_counts = {}
            for log in completed:
                activity = db.query(Activity).filter(Activity.id == log.activity_id).first()
                if activity:
                    domain_counts[activity.domain] = domain_counts.get(activity.domain, 0) + 1
            
            least_domain = min(domain_counts, key=domain_counts.get) if domain_counts else "Communication"
            activities = db.query(Activity).filter(
                Activity.domain == least_domain
            ).limit(2).all()
            recommended_activities.extend(activities)
            weekly_plan.append(f"Explore {least_domain} domain for balanced growth")
        
        # Default recommendations
        if not recommended_activities:
            recommended_activities = db.query(Activity).limit(5).all()
            skill_focus.append("Explore various domains")
            weekly_plan.append("Complete 3 activities this week")
        
        # Remove duplicates
        seen = set()
        unique_activities = []
        for activity in recommended_activities:
            if activity.id not in seen:
                seen.add(activity.id)
                unique_activities.append(activity)
        
        return {
            "recommended_activities": [{
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "domain": a.domain,
                "difficulty": a.difficulty,
                "estimated_time": a.estimated_time
            } for a in unique_activities[:5]],
            "skill_focus": list(set(skill_focus))[:5],
            "weekly_learning_plan": list(set(weekly_plan))[:5],
            "recommendation_reason": "Based on your progress and goals"
        }
    
    @staticmethod
    def prepare_training_data(db: Session):
        """
        Prepare data for future ML training.
        This is a placeholder for future AI integration.
        """
        # TODO: Export user behavior, completions, and outcomes
        # TODO: Create feature vectors for ML models
        # TODO: Store in backend/ai/datasets/
        return {"status": "placeholder", "message": "ML training data preparation not implemented"}
