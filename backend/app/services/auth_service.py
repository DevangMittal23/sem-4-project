from sqlalchemy.orm import Session
from app.models.models import User, UserProfile
from app.schemas.schemas import UserCreate
from app.auth.auth import get_password_hash, verify_password, create_access_token
from datetime import timedelta
from fastapi import HTTPException

class AuthService:
    @staticmethod
    def register_user(db: Session, user_data: UserCreate):
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = get_password_hash(user_data.password)
        new_user = User(email=user_data.email, hashed_password=hashed_password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        profile = UserProfile(user_id=new_user.id, name=user_data.name)
        db.add(profile)
        db.commit()
        
        return new_user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def create_token(email: str):
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": email}, expires_delta=access_token_expires
        )
        return access_token
