from app.database.connection import SessionLocal, init_db
from app.models.models import User, UserProfile, Activity, UserSkill, UserLink, UserInterest, ActivitySkill
from app.auth.auth import get_password_hash

def seed_database():
    init_db()
    db = SessionLocal()
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == "admin@example.com").first()
    if existing_admin:
        print("Admin user already exists. Skipping user creation.")
        db.close()
        return
    
    # Create admin user
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        is_admin=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    admin_profile = UserProfile(
        user_id=admin.id,
        name="Admin User",
        current_job_role="Platform Administrator",
        years_of_experience=5.0,
        weekly_available_time=10.0,
        career_goal="Manage platform",
        risk_tolerance="Medium",
        bio="Experienced platform administrator with a passion for helping professionals grow their careers.",
        location="San Francisco, CA",
        education="BS Computer Science",
        preferred_learning_style="Visual",
        target_role="Senior Platform Manager"
    )
    db.add(admin_profile)
    db.commit()
    
    # Add sample skills
    skills = [
        UserSkill(user_id=admin.id, skill_name="Python", skill_category="Programming", skill_level="advanced", confidence_score=85),
        UserSkill(user_id=admin.id, skill_name="JavaScript", skill_category="Programming", skill_level="intermediate", confidence_score=70),
        UserSkill(user_id=admin.id, skill_name="Project Management", skill_category="Management", skill_level="advanced", confidence_score=90),
    ]
    for skill in skills:
        db.add(skill)
    
    # Add sample links
    links = [
        UserLink(user_id=admin.id, type="github", url="https://github.com/adminuser"),
        UserLink(user_id=admin.id, type="linkedin", url="https://linkedin.com/in/adminuser"),
    ]
    for link in links:
        db.add(link)
    
    # Add sample interests
    interests = [
        UserInterest(user_id=admin.id, domain="Machine Learning"),
        UserInterest(user_id=admin.id, domain="Web Development"),
        UserInterest(user_id=admin.id, domain="Leadership"),
    ]
    for interest in interests:
        db.add(interest)
    
    # Create sample activities
    activities = [
        Activity(
            title="Build a Personal Portfolio Website",
            description="Create a professional portfolio showcasing your projects and skills",
            domain="Technical",
            difficulty="Intermediate",
            estimated_time=8.0,
            submission_type="URL"
        ),
        Activity(
            title="Write a Technical Blog Post",
            description="Write an article explaining a technical concept you've learned",
            domain="Writing",
            difficulty="Beginner",
            estimated_time=3.0,
            submission_type="Text"
        ),
        Activity(
            title="Complete a Data Structures Course",
            description="Learn fundamental data structures and algorithms",
            domain="Technical",
            difficulty="Advanced",
            estimated_time=40.0,
            submission_type="Certificate"
        ),
        Activity(
            title="Network with Industry Professionals",
            description="Connect with 5 professionals in your target industry on LinkedIn",
            domain="Communication",
            difficulty="Beginner",
            estimated_time=2.0,
            submission_type="Text"
        ),
        Activity(
            title="Create a Business Case Study",
            description="Analyze a business problem and propose solutions",
            domain="Business",
            difficulty="Intermediate",
            estimated_time=6.0,
            submission_type="Document"
        ),
        Activity(
            title="Learn a New Programming Language",
            description="Complete a beginner course in a new programming language",
            domain="Technical",
            difficulty="Intermediate",
            estimated_time=20.0,
            submission_type="Certificate"
        ),
        Activity(
            title="Prepare an Elevator Pitch",
            description="Create and practice a 60-second professional introduction",
            domain="Communication",
            difficulty="Beginner",
            estimated_time=1.0,
            submission_type="Text"
        ),
        Activity(
            title="Conduct Market Research",
            description="Research and analyze market trends in your target industry",
            domain="Business",
            difficulty="Intermediate",
            estimated_time=5.0,
            submission_type="Document"
        )
    ]
    
    for activity in activities:
        db.add(activity)
    
    db.commit()
    
    # Add activity skills
    activity_skills_data = [
        # Portfolio Website
        {"activity_title": "Build a Personal Portfolio Website", "skills": [("HTML", 0.3), ("CSS", 0.3), ("React", 0.4)]},
        # Blog Post
        {"activity_title": "Write a Technical Blog Post", "skills": [("Writing", 0.5), ("Communication", 0.3), ("Technical Knowledge", 0.2)]},
        # Data Structures
        {"activity_title": "Complete a Data Structures Course", "skills": [("Algorithms", 0.4), ("Problem Solving", 0.3), ("Python", 0.3)]},
        # Networking
        {"activity_title": "Network with Industry Professionals", "skills": [("Communication", 0.5), ("Networking", 0.5)]},
        # Business Case
        {"activity_title": "Create a Business Case Study", "skills": [("Business Analysis", 0.4), ("Critical Thinking", 0.3), ("Writing", 0.3)]},
        # New Language
        {"activity_title": "Learn a New Programming Language", "skills": [("JavaScript", 0.6), ("Programming", 0.4)]},
        # Elevator Pitch
        {"activity_title": "Prepare an Elevator Pitch", "skills": [("Communication", 0.6), ("Public Speaking", 0.4)]},
        # Market Research
        {"activity_title": "Conduct Market Research", "skills": [("Research", 0.4), ("Data Analysis", 0.3), ("Business Analysis", 0.3)]},
    ]
    
    for item in activity_skills_data:
        activity = db.query(Activity).filter(Activity.title == item["activity_title"]).first()
        if activity:
            for skill_name, weight in item["skills"]:
                activity_skill = ActivitySkill(
                    activity_id=activity.id,
                    skill_name=skill_name,
                    weight=weight
                )
                db.add(activity_skill)
    
    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
