from sqlalchemy.orm import Session
from app.models.models import Activity, ActivitySubmission
from app.schemas.schemas import ActivityCreate, ActivitySubmissionCreate
from typing import List

class ActivityService:
    @staticmethod
    def create_activity(db: Session, activity_data: ActivityCreate):
        activity = Activity(**activity_data.dict())
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity
    
    @staticmethod
    def get_all_activities(db: Session) -> List[Activity]:
        return db.query(Activity).all()
    
    @staticmethod
    def get_activity(db: Session, activity_id: int):
        return db.query(Activity).filter(Activity.id == activity_id).first()
    
    @staticmethod
    def update_activity(db: Session, activity_id: int, activity_data: ActivityCreate):
        activity = db.query(Activity).filter(Activity.id == activity_id).first()
        if not activity:
            return None
        
        for key, value in activity_data.dict().items():
            setattr(activity, key, value)
        
        db.commit()
        db.refresh(activity)
        return activity
    
    @staticmethod
    def delete_activity(db: Session, activity_id: int):
        activity = db.query(Activity).filter(Activity.id == activity_id).first()
        if activity:
            db.delete(activity)
            db.commit()
            return True
        return False
    
    @staticmethod
    def submit_activity(db: Session, user_id: int, submission_data: ActivitySubmissionCreate):
        submission = ActivitySubmission(user_id=user_id, **submission_data.dict())
        db.add(submission)
        db.commit()
        db.refresh(submission)
        return submission
    
    @staticmethod
    def get_user_submissions(db: Session, user_id: int):
        return db.query(ActivitySubmission).filter(ActivitySubmission.user_id == user_id).all()
