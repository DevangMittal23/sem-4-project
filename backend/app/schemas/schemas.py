from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    current_job_role: Optional[str] = None
    years_of_experience: Optional[float] = None
    weekly_available_time: Optional[float] = None
    career_goal: Optional[str] = None
    risk_tolerance: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    education: Optional[str] = None
    preferred_learning_style: Optional[str] = None
    target_role: Optional[str] = None

class UserSkillCreate(BaseModel):
    skill_name: str
    skill_category: str
    skill_level: str
    confidence_score: int

class UserSkillResponse(BaseModel):
    id: int
    skill_name: str
    skill_category: str
    skill_level: str
    confidence_score: int
    
    class Config:
        from_attributes = True

class UserLinkCreate(BaseModel):
    type: str
    url: str

class UserLinkResponse(BaseModel):
    id: int
    type: str
    url: str
    
    class Config:
        from_attributes = True

class UserInterestCreate(BaseModel):
    domain: str

class UserInterestResponse(BaseModel):
    id: int
    domain: str
    
    class Config:
        from_attributes = True

class ProfileAnalytics(BaseModel):
    skill_count: int
    strongest_domain: Optional[str]
    weakest_domain: Optional[str]
    activity_completion_rate: float
    consistency_score: float

class UserProfileResponse(BaseModel):
    id: int
    name: str
    current_job_role: Optional[str]
    years_of_experience: Optional[float]
    weekly_available_time: Optional[float]
    career_goal: Optional[str]
    risk_tolerance: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    education: Optional[str]
    preferred_learning_style: Optional[str]
    target_role: Optional[str]
    is_profile_complete: bool
    skills: List[UserSkillResponse] = []
    links: List[UserLinkResponse] = []
    interests: List[UserInterestResponse] = []
    analytics: Optional[ProfileAnalytics] = None
    
    class Config:
        from_attributes = True

class ActivityCreate(BaseModel):
    title: str
    description: str
    domain: str
    difficulty: str
    estimated_time: float
    submission_type: str

class ActivityResponse(BaseModel):
    id: int
    title: str
    description: str
    domain: str
    difficulty: str
    estimated_time: float
    submission_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ActivitySubmissionCreate(BaseModel):
    activity_id: int
    submission_content: Optional[str] = None
    submission_url: Optional[str] = None
    completion_time: Optional[float] = None
    feedback_rating: Optional[int] = None

class ActivitySubmissionResponse(BaseModel):
    id: int
    activity_id: int
    submission_content: Optional[str]
    submission_url: Optional[str]
    completion_time: Optional[float]
    attempts_count: int
    completion_status: str
    feedback_rating: Optional[int]
    submitted_at: datetime
    
    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    profile: UserProfileResponse
    completed_activities: int
    weekly_consistency: float
    progress_indicator: float
    recommended_activities: List[ActivityResponse]

class RecommendationResponse(BaseModel):
    career_paths: List[str]
    weekly_roadmap: dict
    progress_summary: str
