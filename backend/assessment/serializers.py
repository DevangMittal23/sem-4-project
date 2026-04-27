from rest_framework import serializers
from .models import AssessmentAnswer


class AssessmentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentAnswer
        fields = ("id", "question_id", "question_text", "answer", "answer_type", "section", "created_at")
        read_only_fields = ("id", "created_at")


class AssessmentSubmitSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
    )

    def validate_answers(self, value):
        required_keys = {"question_id", "question_text", "answer"}
        for item in value:
            missing = required_keys - set(item.keys())
            if missing:
                raise serializers.ValidationError(f"Each answer must include: {missing}")
        return value


# ── Profile extraction from assessment answers ────────────────────────────────

FIELD_MAP = {
    "S1Q1": "name",
    "S1Q2": "profession",
    "S1Q3": "experience_years",
    "S1Q4": "experience_level",
    "S1Q5": "goal",
    "S2_SWITCH_Q1": "preferred_domain",
    "S2_SWITCH_Q2": "thinking_style",
    "S2_SWITCH_Q3": "skills",
    "S2_EXCEL_Q1": "skills",
    "S2_EXCEL_Q2": "thinking_style",
    "S3Q2": "career_priority",
    "S3Q3": "availability",
}

GOAL_MAP = {
    "Switch Domain": "switch_domain",
    "Excel in Current Domain": "excel_current",
}

LEVEL_MAP = {
    "Fresher": "fresher",
    "Junior": "junior",
    "Mid": "mid",
    "Senior": "senior",
    "Lead": "lead",
}

AVAILABILITY_MAP = {
    "remote": "gt20",
    "office": "10_20",
    "hybrid": "10_20",
    "flexible": "5_10",
}


def extract_profile_data(answers: list[dict]) -> dict:
    """Map raw assessment answers to UserProfile fields."""
    profile = {}
    interests = []

    for item in answers:
        qid = item.get("question_id", "")
        answer = item.get("answer", "")
        field = FIELD_MAP.get(qid)

        if not field:
            continue

        if field == "goal":
            profile["goal"] = GOAL_MAP.get(answer, "excel_current")

        elif field == "experience_level":
            profile["experience_level"] = LEVEL_MAP.get(answer, "fresher")

        elif field == "skills":
            raw_skills = [s.strip() for s in answer.replace(",", " ").split() if s.strip()]
            profile["skills"] = raw_skills
            interests.extend(raw_skills[:2])

        elif field == "thinking_style":
            # derive thinking style from free-text answer keywords
            lower = answer.lower()
            if any(w in lower for w in ["analytic", "logic", "data", "system"]):
                profile["thinking_style"] = "Analytical"
            elif any(w in lower for w in ["creat", "design", "art", "visual"]):
                profile["thinking_style"] = "Creative"
            elif any(w in lower for w in ["people", "team", "communicat", "lead"]):
                profile["thinking_style"] = "Collaborative"
            else:
                profile["thinking_style"] = "Structured"

        elif field == "availability":
            profile["availability"] = AVAILABILITY_MAP.get(answer, "10_20")

        else:
            profile[field] = answer

    if interests:
        profile["interests"] = list(dict.fromkeys(interests))

    return profile
