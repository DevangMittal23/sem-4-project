from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    submissions = relationship("ActivitySubmission", back_populates="user")
    progress_logs = relationship("ProgressLog", back_populates="user")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String, nullable=False)
    current_job_role = Column(String)
    years_of_experience = Column(Float)
    weekly_available_time = Column(Float)
    career_goal = Column(String)
    risk_tolerance = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    domain = Column(String)
    difficulty = Column(String)
    estimated_time = Column(Float)
    submission_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    submissions = relationship("ActivitySubmission", back_populates="activity")

class ActivitySubmission(Base):
    __tablename__ = "activity_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    submission_content = Column(Text)
    submission_url = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    completion_time = Column(Float)
    attempts_count = Column(Integer, default=1)
    completion_status = Column(String, default="completed")
    feedback_rating = Column(Integer)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="submissions")
    activity = relationship("Activity", back_populates="submissions")

class ProgressLog(Base):
    __tablename__ = "progress_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    consistency_score = Column(Float)
    engagement_score = Column(Float)
    domain_summary = Column(Text)
    week_start = Column(DateTime)
    week_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="progress_logs")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    career_paths = Column(Text)
    weekly_roadmap = Column(Text)
    progress_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
