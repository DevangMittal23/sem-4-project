from sqlalchemy.orm import Session
from app.models.models import User, UserProfile, UserSkill, UserLink, UserInterest
from app.schemas.schemas import UserProfileUpdate, UserSkillCreate, UserLinkCreate, UserInterestCreate
from app.services.profile_service import ProfileService
from app.services.profile_analytics_service import ProfileAnalyticsService

class UserService:
    @staticmethod
    def get_profile(db: Session, user_id: int):
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.profile:
            return None
        
        profile = user.profile
        profile.is_profile_complete = ProfileService.check_profile_completion(profile)
        profile.skills = user.skills
        profile.links = user.links
        profile.interests = user.interests
        profile.analytics = ProfileAnalyticsService.get_analytics(db, user_id)
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
        
        profile.is_profile_complete = ProfileService.check_profile_completion(profile)
        return profile
    
    @staticmethod
    def add_skill(db: Session, user_id: int, skill_data: UserSkillCreate):
        skill = UserSkill(user_id=user_id, **skill_data.dict())
        db.add(skill)
        db.commit()
        db.refresh(skill)
        return skill
    
    @staticmethod
    def delete_skill(db: Session, user_id: int, skill_id: int):
        skill = db.query(UserSkill).filter(UserSkill.id == skill_id, UserSkill.user_id == user_id).first()
        if skill:
            db.delete(skill)
            db.commit()
            return True
        return False
    
    @staticmethod
    def add_link(db: Session, user_id: int, link_data: UserLinkCreate):
        link = UserLink(user_id=user_id, **link_data.dict())
        db.add(link)
        db.commit()
        db.refresh(link)
        return link
    
    @staticmethod
    def delete_link(db: Session, user_id: int, link_id: int):
        link = db.query(UserLink).filter(UserLink.id == link_id, UserLink.user_id == user_id).first()
        if link:
            db.delete(link)
            db.commit()
            return True
        return False
    
    @staticmethod
    def add_interest(db: Session, user_id: int, interest_data: UserInterestCreate):
        interest = UserInterest(user_id=user_id, **interest_data.dict())
        db.add(interest)
        db.commit()
        db.refresh(interest)
        return interest
    
    @staticmethod
    def delete_interest(db: Session, user_id: int, interest_id: int):
        interest = db.query(UserInterest).filter(UserInterest.id == interest_id, UserInterest.user_id == user_id).first()
        if interest:
            db.delete(interest)
            db.commit()
            return True
        return False
