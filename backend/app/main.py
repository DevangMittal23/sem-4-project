from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.database.connection import init_db
from app.middleware.error_handler import validation_exception_handler, general_exception_handler
from app.controllers import auth_controller, user_controller, activity_controller, dashboard_controller
from app.controllers import analytics_controller, recommendation_controller, admin_controller, ai_controller

app = FastAPI(
    title="AI-Assisted Career Transition Platform",
    description="A platform for career growth and job transitions",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Routes
app.include_router(auth_controller.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_controller.router, prefix="/api/user", tags=["User"])
app.include_router(activity_controller.router, prefix="/api/activities", tags=["Activities"])
app.include_router(dashboard_controller.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(analytics_controller.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(recommendation_controller.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(admin_controller.router, prefix="/api/admin", tags=["Admin"])
app.include_router(ai_controller.router, prefix="/api/ai", tags=["AI (Placeholder)"])

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def root():
    return {"message": "AI-Assisted Career Transition Platform API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
