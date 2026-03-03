from app.database.connection import SessionLocal, init_db
from app.models.models import User, UserProfile, Activity
from app.auth.auth import get_password_hash

def seed_database():
    init_db()
    db = SessionLocal()
    
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
        risk_tolerance="Medium"
    )
    db.add(admin_profile)
    
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
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
