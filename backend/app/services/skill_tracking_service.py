from sqlalchemy.orm import Session
from app.models.models import UserSkill, ActivitySkill, SkillGrowthLog
from datetime import datetime

class SkillTrackingService:
    @staticmethod
    def get_completion_factor(difficulty_feedback: str) -> float:
        """Convert difficulty feedback to completion factor"""
        factors = {
            "easy": 1.2,
            "medium": 1.0,
            "hard": 0.8
        }
        return factors.get(difficulty_feedback.lower(), 1.0)
    
    @staticmethod
    def update_skills_on_completion(db: Session, user_id: int, activity_id: int, difficulty_feedback: str):
        """Update user skills when activity is completed"""
        # Get activity skills
        activity_skills = db.query(ActivitySkill).filter(
            ActivitySkill.activity_id == activity_id
        ).all()
        
        if not activity_skills:
            return []
        
        completion_factor = SkillTrackingService.get_completion_factor(difficulty_feedback)
        updated_skills = []
        
        for activity_skill in activity_skills:
            # Find or create user skill
            user_skill = db.query(UserSkill).filter(
                UserSkill.user_id == user_id,
                UserSkill.skill_name == activity_skill.skill_name
            ).first()
            
            if user_skill:
                previous_score = user_skill.confidence_score
                # Calculate new score
                increase = activity_skill.weight * completion_factor * 10
                new_score = min(100, previous_score + increase)
                user_skill.confidence_score = int(new_score)
                
                # Update skill level based on score
                if new_score >= 75:
                    user_skill.skill_level = "advanced"
                elif new_score >= 40:
                    user_skill.skill_level = "intermediate"
                else:
                    user_skill.skill_level = "beginner"
                
                # Log growth
                growth_log = SkillGrowthLog(
                    user_id=user_id,
                    skill_name=activity_skill.skill_name,
                    previous_score=previous_score,
                    new_score=int(new_score),
                    activity_id=activity_id
                )
                db.add(growth_log)
                updated_skills.append({
                    "skill_name": activity_skill.skill_name,
                    "previous_score": previous_score,
                    "new_score": int(new_score),
                    "increase": int(new_score - previous_score)
                })
            else:
                # Create new skill
                initial_score = int(activity_skill.weight * completion_factor * 20)
                user_skill = UserSkill(
                    user_id=user_id,
                    skill_name=activity_skill.skill_name,
                    skill_category="Technical",
                    skill_level="beginner",
                    confidence_score=min(100, initial_score)
                )
                db.add(user_skill)
                updated_skills.append({
                    "skill_name": activity_skill.skill_name,
                    "previous_score": 0,
                    "new_score": min(100, initial_score),
                    "increase": min(100, initial_score)
                })
        
        db.commit()
        return updated_skills
