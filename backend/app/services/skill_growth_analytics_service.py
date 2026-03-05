from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import UserSkill, SkillGrowthLog, UserActivityLog
from datetime import datetime, timedelta

class SkillGrowthAnalyticsService:
    @staticmethod
    def get_skill_growth_data(db: Session, user_id: int):
        """Get comprehensive skill growth analytics"""
        
        # Get all user skills
        skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
        
        # Get skill growth logs
        growth_logs = db.query(SkillGrowthLog).filter(
            SkillGrowthLog.user_id == user_id
        ).order_by(SkillGrowthLog.created_at.desc()).all()
        
        # Calculate top improving skills (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_growth = db.query(
            SkillGrowthLog.skill_name,
            func.sum(SkillGrowthLog.new_score - SkillGrowthLog.previous_score).label('total_growth')
        ).filter(
            SkillGrowthLog.user_id == user_id,
            SkillGrowthLog.created_at >= thirty_days_ago
        ).group_by(SkillGrowthLog.skill_name).order_by(func.sum(SkillGrowthLog.new_score - SkillGrowthLog.previous_score).desc()).limit(5).all()
        
        top_improving = [{"skill": r.skill_name, "growth": r.total_growth} for r in recent_growth]
        
        # Get weakest skills (lowest confidence scores)
        weakest_skills = sorted(skills, key=lambda s: s.confidence_score)[:5]
        weakest = [{"skill": s.skill_name, "score": s.confidence_score, "category": s.skill_category} for s in weakest_skills]
        
        # Skill progress timeline (last 10 growth events)
        timeline = [{
            "skill": log.skill_name,
            "previous": log.previous_score,
            "new": log.new_score,
            "date": log.created_at.strftime("%Y-%m-%d")
        } for log in growth_logs[:10]]
        
        # Radar chart data (all skills with scores)
        radar_data = {
            "labels": [s.skill_name for s in skills],
            "scores": [s.confidence_score for s in skills]
        }
        
        # Domain analysis
        domain_scores = {}
        for skill in skills:
            if skill.skill_category not in domain_scores:
                domain_scores[skill.skill_category] = []
            domain_scores[skill.skill_category].append(skill.confidence_score)
        
        domain_avg = {domain: sum(scores)/len(scores) for domain, scores in domain_scores.items()}
        strongest_domain = max(domain_avg.items(), key=lambda x: x[1]) if domain_avg else ("N/A", 0)
        weakest_domain = min(domain_avg.items(), key=lambda x: x[1]) if domain_avg else ("N/A", 0)
        
        return {
            "radar_chart": radar_data,
            "top_improving_skills": top_improving,
            "weakest_skills": weakest,
            "skill_timeline": timeline,
            "strongest_domain": {"name": strongest_domain[0], "score": round(strongest_domain[1], 2)},
            "weakest_domain": {"name": weakest_domain[0], "score": round(weakest_domain[1], 2)},
            "total_skills": len(skills),
            "average_skill_score": round(sum([s.confidence_score for s in skills]) / len(skills), 2) if skills else 0
        }
