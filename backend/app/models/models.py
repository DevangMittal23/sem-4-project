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
    activity_logs = relationship("UserActivityLog", back_populates="user")
    skills = relationship("UserSkill", back_populates="user")
    links = relationship("UserLink", back_populates="user")
    interests = relationship("UserInterest", back_populates="user")

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
    bio = Column(Text)
    location = Column(String)
    education = Column(String)
    preferred_learning_style = Column(String)
    target_role = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")

class UserSkill(Base):
    __tablename__ = "user_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_name = Column(String, nullable=False)
    skill_category = Column(String)
    skill_level = Column(String)
    confidence_score = Column(Integer)
    
    user = relationship("User", back_populates="skills")

class UserLink(Base):
    __tablename__ = "user_links"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, nullable=False)
    url = Column(String, nullable=False)
    
    user = relationship("User", back_populates="links")

class UserInterest(Base):
    __tablename__ = "user_interests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    domain = Column(String, nullable=False)
    
    user = relationship("User", back_populates="interests")

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
    activity_logs = relationship("UserActivityLog", back_populates="activity")
    activity_skills = relationship("ActivitySkill", back_populates="activity")

class ActivitySkill(Base):
    __tablename__ = "activity_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    skill_name = Column(String, nullable=False)
    weight = Column(Float, nullable=False)
    
    activity = relationship("Activity", back_populates="activity_skills")

class SkillGrowthLog(Base):
    __tablename__ = "skill_growth_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_name = Column(String, nullable=False)
    previous_score = Column(Integer)
    new_score = Column(Integer)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class UserActivityLog(Base):
    __tablename__ = "user_activity_log"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    status = Column(String, default="not_started")  # not_started, in_progress, completed, paused
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    time_spent_minutes = Column(Integer)
    difficulty_feedback = Column(String)  # easy, medium, hard
    completion_notes = Column(Text)
    project_link = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="activity_logs")
    activity = relationship("Activity", back_populates="activity_logs")

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
