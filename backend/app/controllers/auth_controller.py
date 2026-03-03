from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.schemas import UserCreate, UserLogin, Token
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user = AuthService.register_user(db, user_data)
    token = AuthService.create_token(user.email)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = AuthService.create_token(user.email)
    return {"access_token": token, "token_type": "bearer"}
