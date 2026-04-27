from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ("id", "title", "description", "status", "difficulty", "tag", "estimated_time", "time_taken", "notes", "week_number", "created_at")
        read_only_fields = ("id", "created_at")


# ── Rule-based career prediction ──────────────────────────────────────────────

CAREER_RULES = [
    {
        "conditions": {"goal": "switch_domain", "preferred_domain": "Data Science / AI"},
        "career": "Data Scientist / ML Engineer",
        "match": 91,
        "reason": "Your goal to switch into AI/ML combined with your analytical background makes this a strong fit.",
    },
    {
        "conditions": {"goal": "switch_domain", "preferred_domain": "Software Engineering"},
        "career": "Software Engineer",
        "match": 88,
        "reason": "Your transferable skills and motivation to switch position you well for a software engineering role.",
    },
    {
        "conditions": {"goal": "switch_domain", "preferred_domain": "Product Management"},
        "career": "Product Manager",
        "match": 85,
        "reason": "Your cross-domain experience and strategic thinking align with product management.",
    },
    {
        "conditions": {"goal": "switch_domain", "preferred_domain": "DevOps / Cloud"},
        "career": "DevOps / Cloud Engineer",
        "match": 87,
        "reason": "Infrastructure and automation skills are in high demand — your switch goal aligns perfectly.",
    },
    {
        "conditions": {"goal": "excel_current", "experience_level": "senior"},
        "career": "Senior / Principal Engineer",
        "match": 93,
        "reason": "With senior-level experience and a goal to excel, you're on track for a principal or staff role.",
    },
    {
        "conditions": {"goal": "excel_current", "experience_level": "mid"},
        "career": "Mid → Senior Engineer",
        "match": 89,
        "reason": "Deepening your current expertise is the fastest path to a senior role.",
    },
    {
        "conditions": {"goal": "excel_current", "experience_level": "junior"},
        "career": "Junior → Mid-level Developer",
        "match": 86,
        "reason": "Consistent skill-building will accelerate your path to mid-level.",
    },
    {
        "conditions": {"goal": "excel_current", "experience_level": "fresher"},
        "career": "Entry-level Developer",
        "match": 82,
        "reason": "Focus on fundamentals and portfolio projects to land your first role.",
    },
]

DEFAULT_CAREER = {
    "career": "Software Professional",
    "match": 80,
    "reason": "Complete your profile to get a more accurate career prediction.",
}


def predict_career(profile) -> dict:
    for rule in CAREER_RULES:
        if all(getattr(profile, k, "") == v for k, v in rule["conditions"].items()):
            return {"career": rule["career"], "match": rule["match"], "reason": rule["reason"]}
    return DEFAULT_CAREER


# ── Rule-based insights ───────────────────────────────────────────────────────

def generate_insights(profile) -> list[str]:
    insights = []
    level = getattr(profile, "experience_level", "")
    goal = getattr(profile, "goal", "")
    skills = getattr(profile, "skills", []) or []
    thinking = getattr(profile, "thinking_style", "")
    availability = getattr(profile, "availability", "")

    if level in ("fresher", "junior"):
        insights.append("Build 2–3 portfolio projects to stand out to recruiters.")
    if level in ("mid", "senior"):
        insights.append("Consider mentoring juniors — it accelerates your own growth.")
    if goal == "switch_domain":
        insights.append("Transferable skills are your biggest asset during a domain switch. Highlight them.")
    if goal == "excel_current":
        insights.append("Deep specialization will differentiate you from generalists in your field.")
    if thinking == "Analytical":
        insights.append("Your analytical thinking style is highly valued in data-driven roles.")
    if skills:
        insights.append(f"Your skills in {', '.join(skills[:2])} are in high demand right now.")
    if availability in ("lt5", "5_10"):
        insights.append("With limited time, focus on one high-impact skill per week rather than spreading thin.")
    if not insights:
        insights.append("Complete your profile to receive personalized AI insights.")

    return insights[:4]
