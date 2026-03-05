from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.schemas import (
    UserProfileResponse, UserProfileUpdate, UserSkillCreate, UserSkillResponse,
    UserLinkCreate, UserLinkResponse, UserInterestCreate, UserInterestResponse
)
from app.services.user_service import UserService
from app.services.profile_service import ProfileService
from app.services.profile_analytics_service import ProfileAnalyticsService
from app.auth.auth import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = UserService.get_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(profile_data: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = UserService.update_profile(db, current_user.id, profile_data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserService.get_profile(db, current_user.id)

@router.post("/skills", response_model=UserSkillResponse)
def add_skill(skill_data: UserSkillCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return UserService.add_skill(db, current_user.id, skill_data)

@router.delete("/skills/{skill_id}")
def delete_skill(skill_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not UserService.delete_skill(db, current_user.id, skill_id):
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"message": "Skill deleted"}

@router.post("/links", response_model=UserLinkResponse)
def add_link(link_data: UserLinkCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return UserService.add_link(db, current_user.id, link_data)

@router.delete("/links/{link_id}")
def delete_link(link_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not UserService.delete_link(db, current_user.id, link_id):
        raise HTTPException(status_code=404, detail="Link not found")
    return {"message": "Link deleted"}

@router.post("/interests", response_model=UserInterestResponse)
def add_interest(interest_data: UserInterestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return UserService.add_interest(db, current_user.id, interest_data)

@router.delete("/interests/{interest_id}")
def delete_interest(interest_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not UserService.delete_interest(db, current_user.id, interest_id):
        raise HTTPException(status_code=404, detail="Interest not found")
    return {"message": "Interest deleted"}
