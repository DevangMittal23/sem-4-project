from app.models.models import UserProfile

class ProfileService:
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