from sqlalchemy.orm import Session
from app.models.models import User, UserProfile
from app.schemas.schemas import UserProfileUpdate

class UserService:
    @staticmethod
    def get_profile(db: Session, user_id: int):
        return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    @staticmethod
    def update_profile(db: Session, user_id: int, profile_data: UserProfileUpdate):
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            return None
        
        for key, value in profile_data.dict(exclude_unset=True).items():
            setattr(profile, key, value)
        
        db.commit()
        db.refresh(profile)
        return profile
