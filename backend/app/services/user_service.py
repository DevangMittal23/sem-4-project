from sqlalchemy.orm import Session
from app.models.models import User, UserProfile
from app.schemas.schemas import UserProfileUpdate
from app.services.profile_service import ProfileService

class UserService:
    @staticmethod
    def get_profile(db: Session, user_id: int):
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if profile:
            # Add completion status
            profile.is_profile_complete = ProfileService.check_profile_completion(profile)
        return profile
    
    @staticmethod
    def update_profile(db: Session, user_id: int, profile_data: UserProfileUpdate):
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            return None
        
        for key, value in profile_data.dict(exclude_unset=True).items():
            setattr(profile, key, value)
        
        db.commit()
        db.refresh(profile)
        
        # Add completion status
        profile.is_profile_complete = ProfileService.check_profile_completion(profile)
        return profile
