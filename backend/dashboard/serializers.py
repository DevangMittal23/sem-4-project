from rest_framework import serializers
from .models import Task, TaskLog, Roadmap, WeeklyPlan, SkillGapAnalysis


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ("id", "title", "description", "resource_url", "status", "difficulty",
                  "tag", "estimated_time", "week_number", "order", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class TaskLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskLog
        fields = ("id", "task", "time_taken", "difficulty_feedback", "notes", "created_at")
        read_only_fields = ("id", "created_at")


class WeeklyPlanSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = WeeklyPlan
        fields = ("id", "week_number", "theme", "goals", "is_current", "is_completed",
                  "completion_pct", "ai_feedback", "tasks", "created_at")
        read_only_fields = ("id", "created_at")


class RoadmapSerializer(serializers.ModelSerializer):
    weekly_plans = WeeklyPlanSerializer(many=True, read_only=True)

    class Meta:
        model = Roadmap
        fields = ("id", "career_title", "total_weeks", "current_week", "phases",
                  "is_active", "weekly_plans", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class SkillGapSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillGapAnalysis
        fields = ("id", "current_skills", "required_skills", "gap_skills", "market_insights",
                  "job_market_data", "recommendations", "career_options", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


# Rule-based career prediction (fallback)
def predict_career(profile) -> dict:
    domain = getattr(profile, "preferred_domain", "") or getattr(profile, "profession", "Technology")
    return {"career": domain, "match": 85, "reason": f"Based on your {domain} background."}


def generate_insights(profile) -> list[str]:
    insights = []
    level = getattr(profile, "experience_level", "")
    goal = getattr(profile, "goal", "")
    skills = getattr(profile, "skills", []) or []
    if level in ("fresher", "junior"):
        insights.append("Build 2–3 portfolio projects to stand out to recruiters.")
    if goal == "switch_domain":
        insights.append("Transferable skills are your biggest asset during a domain switch.")
    if skills:
        insights.append(f"Your skills in {', '.join(skills[:2])} are in high demand.")
    if not insights:
        insights.append("Complete your profile to receive personalized AI insights.")
    return insights[:3]
