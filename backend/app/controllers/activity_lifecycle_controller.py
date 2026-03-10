from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.activity_lifecycle_service import ActivityLifecycleService
from app.auth.auth import get_current_user
from app.models.models import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class CompleteActivityRequest(BaseModel):
    activity_id: int
    time_spent_minutes: int
    difficulty_feedback: str
    completion_notes: Optional[str] = None
    project_link: Optional[str] = None

@router.get("/user-progress")
def get_user_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ActivityLifecycleService.get_user_progress(db, current_user.id)

@router.post("/complete")
def complete_activity(data: CompleteActivityRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = ActivityLifecycleService.complete_activity(
        db, current_user.id, data.activity_id, 
        data.time_spent_minutes, data.difficulty_feedback,
        data.completion_notes, data.project_link
    )
    return {
        "message": "Activity completed",
        "status": result["log"].status,
        "updated_skills": result.get("updated_skills", [])
    }

@router.get("/status/{activity_id}")
def get_activity_status(activity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    status = ActivityLifecycleService.get_activity_status(db, current_user.id, activity_id)
    if not status:
        return {"status": "not_started"}
    return {
        "status": status.status,
        "start_time": status.start_time,
        "time_spent_minutes": status.time_spent_minutes,
        "difficulty_feedback": status.difficulty_feedback,
        "completion_notes": status.completion_notes,
        "project_link": status.project_link
    }

@router.post("/start/{activity_id}")
def start_activity(activity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = ActivityLifecycleService.start_activity(db, current_user.id, activity_id)
    if isinstance(result, dict) and "error" in result:
        return result
    return {"message": "Activity started", "status": result.status}

@router.post("/pause/{activity_id}")
def pause_activity(activity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = ActivityLifecycleService.pause_activity(db, current_user.id, activity_id)
    if not result:
        return {"error": "Activity not found"}
    return {"message": "Activity paused", "status": result.status}

@router.post("/resume/{activity_id}")
def resume_activity(activity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = ActivityLifecycleService.resume_activity(db, current_user.id, activity_id)
    if not result:
        return {"error": "Activity not found"}
    return {"message": "Activity resumed", "status": result.status}
