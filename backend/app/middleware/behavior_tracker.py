from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.models.models import UserBehaviorEvent
from app.database.connection import SessionLocal
from datetime import datetime
import json

class BehaviorTrackingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Track request
        user_id = None
        if hasattr(request.state, "user"):
            user_id = request.state.user.id
        
        path = request.url.path
        method = request.method
        
        # Determine event type and page
        event_type = None
        page = None
        activity_id = None
        metadata = {}
        
        if "/api/auth/login" in path and method == "POST":
            event_type = "login"
            page = "login"
        elif "/api/activities/" in path and method == "GET" and path.endswith("/activities/"):
            event_type = "view_activities_page"
            page = "activities"
        elif "/api/activities/start/" in path and method == "POST":
            event_type = "start_activity"
            activity_id = int(path.split("/")[-1])
            page = "activities"
        elif "/api/activities/pause/" in path and method == "POST":
            event_type = "pause_activity"
            activity_id = int(path.split("/")[-1])
            page = "activities"
        elif "/api/activities/complete" in path and method == "POST":
            event_type = "complete_activity"
            page = "activities"
        elif "/api/recommendations/generate" in path and method == "GET":
            event_type = "view_recommendation"
            page = "recommendations"
        elif "/api/user/profile" in path and method == "PUT":
            event_type = "profile_update"
            page = "profile"
        elif "/api/dashboard" in path and method == "GET":
            event_type = "view_dashboard"
            page = "dashboard"
        
        # Log event if relevant
        if event_type and user_id:
            db = SessionLocal()
            try:
                event = UserBehaviorEvent(
                    user_id=user_id,
                    event_type=event_type,
                    page=page,
                    activity_id=activity_id,
                    timestamp=datetime.utcnow(),
                    metadata_json=json.dumps(metadata)
                )
                db.add(event)
                db.commit()
            except:
                pass
            finally:
                db.close()
        
        response = await call_next(request)
        return response
