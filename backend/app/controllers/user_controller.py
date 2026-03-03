from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.schemas import UserProfileResponse, UserProfileUpdate
from app.services.user_service import UserService
from app.services.profile_service import ProfileService
from app.auth.auth import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = UserService.get_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return UserProfileResponse(
        id=profile.id,
        name=profile.name,
        current_job_role=profile.current_job_role,
        years_of_experience=profile.years_of_experience,
        weekly_available_time=profile.weekly_available_time,
        career_goal=profile.career_goal,
        risk_tolerance=profile.risk_tolerance,
        is_profile_complete=ProfileService.check_profile_completion(profile)
    )

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(profile_data: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"Updating profile for user {current_user.id} with data: {profile_data.dict()}")
    profile = UserService.update_profile(db, current_user.id, profile_data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    is_complete = ProfileService.check_profile_completion(profile)
    print(f"Profile updated successfully: {is_complete}")
    
    return UserProfileResponse(
        id=profile.id,
        name=profile.name,
        current_job_role=profile.current_job_role,
        years_of_experience=profile.years_of_experience,
        weekly_available_time=profile.weekly_available_time,
        career_goal=profile.career_goal,
        risk_tolerance=profile.risk_tolerance,
        is_profile_complete=is_complete
    )
