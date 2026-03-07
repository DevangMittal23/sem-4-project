from sqlalchemy.orm import Session
from app.models.models import UserProfile, UserSkill, ActivitySkill

COMPLETION_FACTORS = {"easy": 0.8, "medium": 1.0, "hard": 1.2}

class ProfileService:
    @staticmethod
    def update_user_skills_after_activity_completion(
        db: Session, user_id: int, activity_id: int, difficulty_feedback: str
    ) -> list:
        activity_skills = db.query(ActivitySkill).filter(
            ActivitySkill.activity_id == activity_id
        ).all()

        if not activity_skills:
            return []

        completion_factor = COMPLETION_FACTORS.get(
            difficulty_feedback.lower() if difficulty_feedback else "medium", 1.0
        )
        updated_skills = []

        for act_skill in activity_skills:
            user_skill = db.query(UserSkill).filter(
                UserSkill.user_id == user_id,
                UserSkill.skill_name == act_skill.skill_name
            ).first()

            if user_skill:
                previous = user_skill.confidence_score or 0
                increase = act_skill.weight * completion_factor * 20
                new_score = min(100, int(previous + increase))
                user_skill.confidence_score = new_score

                if new_score >= 75:
                    user_skill.skill_level = "advanced"
                elif new_score >= 40:
                    user_skill.skill_level = "intermediate"
                else:
                    user_skill.skill_level = "beginner"

                updated_skills.append({
                    "skill_name": act_skill.skill_name,
                    "previous_score": previous,
                    "new_score": new_score,
                })
            else:
                user_skill = UserSkill(
                    user_id=user_id,
                    skill_name=act_skill.skill_name,
                    skill_category="technical",
                    skill_level="beginner",
                    confidence_score=20,
                )
                db.add(user_skill)
                updated_skills.append({
                    "skill_name": act_skill.skill_name,
                    "previous_score": 0,
                    "new_score": 20,
                })

        db.commit()
        return updated_skills

    @staticmethod
    def check_profile_completion(user_profile: UserProfile) -> bool:
        """Check if user profile has all required fields completed"""
        if not user_profile:
            return False
            
        required_fields = [
            user_profile.name,
            user_profile.current_job_role,
            user_profile.years_of_experience,
            user_profile.weekly_available_time,
            user_profile.career_goal,
            user_profile.risk_tolerance
        ]
        
        return all(field is not None and str(field).strip() != '' for field in required_fields)