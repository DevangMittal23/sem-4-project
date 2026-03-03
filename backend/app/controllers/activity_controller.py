from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.schemas import ActivityResponse, ActivityCreate, ActivitySubmissionCreate, ActivitySubmissionResponse
from app.services.activity_service import ActivityService
from app.auth.auth import get_current_user, get_current_admin
from app.models.models import User

router = APIRouter()

@router.get("/", response_model=List[ActivityResponse])
def get_activities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ActivityService.get_all_activities(db)

@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    activity = ActivityService.get_activity(db, activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.post("/submit", response_model=ActivitySubmissionResponse)
def submit_activity(submission_data: ActivitySubmissionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ActivityService.submit_activity(db, current_user.id, submission_data)

@router.get("/submissions/me", response_model=List[ActivitySubmissionResponse])
def get_my_submissions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ActivityService.get_user_submissions(db, current_user.id)
