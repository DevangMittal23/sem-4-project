from app.database.connection import SessionLocal, engine
from app.models.models import Base, UserStreak, Badge, UserBadge
from app.services.gamification_service import GamificationService
from sqlalchemy import inspect

def migrate_gamification():
    db = SessionLocal()
    inspector = inspect(engine)
    
    tables_to_create = []
    
    if 'user_streaks' not in inspector.get_table_names():
        tables_to_create.append(UserStreak.__table__)
        print("Creating user_streaks table...")
    
    if 'badges' not in inspector.get_table_names():
        tables_to_create.append(Badge.__table__)
        print("Creating badges table...")
    
    if 'user_badges' not in inspector.get_table_names():
        tables_to_create.append(UserBadge.__table__)
        print("Creating user_badges table...")
    
    if tables_to_create:
        Base.metadata.create_all(bind=engine, tables=tables_to_create)
        print("Gamification tables created successfully!")
        
        # Seed badges
        GamificationService.seed_badges(db)
        print("Badges seeded successfully!")
    else:
        print("All gamification tables already exist")
    
    db.close()

if __name__ == "__main__":
    migrate_gamification()
