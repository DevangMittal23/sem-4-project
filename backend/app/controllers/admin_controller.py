from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.schemas import ActivityCreate, ActivityResponse
from app.services.activity_service import ActivityService
from app.auth.auth import get_current_admin
from app.models.models import User, ActivitySubmission

router = APIRouter()

@router.post("/activities", response_model=ActivityResponse)
def create_activity(activity_data: ActivityCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return ActivityService.create_activity(db, activity_data)

@router.put("/activities/{activity_id}", response_model=ActivityResponse)
def update_activity(activity_id: int, activity_data: ActivityCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    activity = ActivityService.update_activity(db, activity_id, activity_data)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.delete("/activities/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    success = ActivityService.delete_activity(db, activity_id)
    if not success:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity deleted successfully"}

@router.get("/user-progress")
def get_user_progress(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    submissions = db.query(ActivitySubmission).all()
    user_stats = {}
    for sub in submissions:
        if sub.user_id not in user_stats:
            user_stats[sub.user_id] = 0
        user_stats[sub.user_id] += 1
    return user_stats
