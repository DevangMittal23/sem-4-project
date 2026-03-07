from app.database.connection import SessionLocal, engine
from app.models.models import Base, UserBehaviorEvent
from sqlalchemy import inspect

def migrate_database():
    """Add user_behavior_events table if it doesn't exist"""
    db = SessionLocal()
    inspector = inspect(engine)
    
    if 'user_behavior_events' not in inspector.get_table_names():
        print("Creating user_behavior_events table...")
        Base.metadata.create_all(bind=engine, tables=[UserBehaviorEvent.__table__])
        print("user_behavior_events table created successfully!")
    else:
        print("user_behavior_events table already exists")
    
    db.close()

if __name__ == "__main__":
    migrate_database()
