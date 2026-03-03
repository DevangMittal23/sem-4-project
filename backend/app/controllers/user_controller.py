from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.schemas import UserProfileResponse, UserProfileUpdate
from app.services.user_service import UserService
from app.auth.auth import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = UserService.get_profile(db, current_user.id)
    return profile

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(profile_data: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = UserService.update_profile(db, current_user.id, profile_data)
    return profile
