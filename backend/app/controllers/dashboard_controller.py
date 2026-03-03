from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.schemas import DashboardResponse
from app.services.dashboard_service import DashboardService
from app.auth.auth import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/", response_model=DashboardResponse)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return DashboardService.get_dashboard_data(db, current_user.id)
