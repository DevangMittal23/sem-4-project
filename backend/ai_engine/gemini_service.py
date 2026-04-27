import json
import logging
from google import genai
from google.genai import types
from django.conf import settings

logger = logging.getLogger("ai_engine")


def _call(prompt: str, temperature: float = 0.7) -> str:
    if not settings.GEMINI_API_KEY:
        return ""
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=2048,
            ),
        )
        return response.text.strip()
    except Exception as e:
        logger.error("Gemini API error: %s", e)
        return ""


def _parse_json(text: str):
    try:
        # Find outermost [ or {
        a = text.find("[")
        b = text.find("{")
        if a == -1 and b == -1:
            return {}
        if a != -1 and (b == -1 or a < b):
            return json.loads(text[a: text.rfind("]") + 1])
        return json.loads(text[b: text.rfind("}") + 1])
    except Exception:
        return {}


def predict_career(profile) -> list[dict]:
    if not settings.GEMINI_API_KEY:
        return _fallback_career(profile)

    prompt = f"""You are an expert career counselor. Based on this user profile, suggest exactly 3 career paths.

User Profile:
- Name: {profile.name}
- Profession: {profile.profession}
- Experience: {profile.experience_years} years ({profile.experience_level})
- Goal: {profile.goal}
- Skills: {', '.join(profile.skills) if profile.skills else 'Not specified'}
- Thinking Style: {profile.thinking_style}
- Preferred Domain: {profile.preferred_domain}
- Education: {profile.education}

Return ONLY a valid JSON array with exactly 3 objects:
[
  {{
    "title": "Career Title",
    "description": "2-3 sentence description of why this fits the user",
    "required_skills": ["skill1", "skill2", "skill3"],
    "match_score": 85,
    "timeline": "6-12 months",
    "reasoning": "One sentence on why this is a strong match"
  }}
]"""

    raw = _call(prompt, 0.5)
    result = _parse_json(raw)
    if isinstance(result, list) and result:
        return result
    return _fallback_career(profile)


def generate_roadmap(profile, career_title: str) -> dict:
    if not settings.GEMINI_API_KEY:
        return _fallback_roadmap(career_title)

    prompt = f"""Create a detailed, actionable career roadmap for becoming a {career_title}.

User Context:
- Current Level: {profile.experience_level}
- Current Skills: {', '.join(profile.skills) if profile.skills else 'Beginner'}
- Weekly Availability: {profile.availability}
- Goal: {profile.goal}

Return ONLY a valid JSON object:
{{
  "title": "{career_title} Roadmap",
  "total_weeks": 10,
  "phases": [
    {{
      "phase": "Phase Name",
      "weeks": "1-3",
      "goal": "What to achieve",
      "topics": ["topic1", "topic2"],
      "resources": ["resource1", "resource2"],
      "milestone": "Measurable outcome"
    }}
  ]
}}"""

    raw = _call(prompt, 0.4)
    result = _parse_json(raw)
    if isinstance(result, dict) and result.get("phases"):
        return result
    return _fallback_roadmap(career_title)


def generate_tasks(profile, roadmap: dict, week_number: int) -> list[dict]:
    if not settings.GEMINI_API_KEY:
        return _fallback_tasks(week_number)

    phase_info = "\n".join(
        f"Phase: {p.get('phase')} | Topics: {', '.join(p.get('topics', []))}"
        for p in roadmap.get("phases", [])
    )

    prompt = f"""Generate exactly 5 specific, actionable tasks for week {week_number} of a career development plan.

User Profile:
- Level: {profile.experience_level}
- Skills: {', '.join(profile.skills) if profile.skills else 'General'}
- Availability: {profile.availability}

Roadmap Context:
{phase_info or 'General career development'}

Return ONLY a valid JSON array of exactly 5 tasks:
[
  {{
    "title": "Specific task title",
    "description": "Clear description of what to do",
    "difficulty": "easy|medium|hard",
    "estimated_time": "30 min",
    "tag": "Learning|Practice|Reading|Career|Project",
    "week_number": {week_number}
  }}
]"""

    raw = _call(prompt, 0.6)
    result = _parse_json(raw)
    if isinstance(result, list) and result:
        return result
    return _fallback_tasks(week_number)


def analyze_performance(profile, task_logs: list[dict]) -> dict:
    if not settings.GEMINI_API_KEY or not task_logs:
        return _fallback_analysis()

    prompt = f"""Analyze this user's career development performance and provide actionable insights.

User Profile:
- Level: {profile.experience_level}
- Goal: {profile.goal}
- Skills: {', '.join(profile.skills) if profile.skills else 'General'}

Task Completion Data:
{json.dumps(task_logs[:20], indent=2)}

Return ONLY a valid JSON object:
{{
  "overall_score": 75,
  "learning_pace": "fast|normal|slow",
  "strengths": ["strength1", "strength2"],
  "improvement_areas": ["area1", "area2"],
  "insights": ["insight1", "insight2", "insight3"],
  "next_week_recommendation": "Specific recommendation for next week",
  "difficulty_adjustment": "increase|maintain|decrease"
}}"""

    raw = _call(prompt, 0.4)
    result = _parse_json(raw)
    if isinstance(result, dict) and result.get("insights"):
        return result
    return _fallback_analysis()


# ── Fallbacks ─────────────────────────────────────────────────────────────────

def _fallback_career(profile) -> list[dict]:
    domain = getattr(profile, "preferred_domain", "") or getattr(profile, "profession", "Technology")
    skills = getattr(profile, "skills", [])
    return [
        {"title": f"Senior {domain} Engineer", "description": f"Leverage your {getattr(profile, 'experience_level', 'current')} experience to advance in {domain}.", "required_skills": skills[:3] or ["Problem Solving", "Communication", "Technical Skills"], "match_score": 88, "timeline": "6-12 months", "reasoning": "Strong alignment with your current trajectory."},
        {"title": "Full Stack Developer", "description": "Build end-to-end applications combining frontend and backend expertise.", "required_skills": ["JavaScript", "Python", "System Design"], "match_score": 82, "timeline": "8-12 months", "reasoning": "High demand role with broad applicability."},
        {"title": "Technical Lead", "description": "Combine technical expertise with leadership to guide engineering teams.", "required_skills": ["Architecture", "Mentoring", "Project Management"], "match_score": 76, "timeline": "12-18 months", "reasoning": "Natural progression for experienced engineers."},
    ]


def _fallback_roadmap(career_title: str) -> dict:
    return {
        "title": f"{career_title} Roadmap",
        "total_weeks": 10,
        "phases": [
            {"phase": "Foundation", "weeks": "1-3", "goal": "Build core fundamentals", "topics": ["Core concepts", "Basic tooling"], "resources": ["Official documentation", "Online courses"], "milestone": "Complete introductory project"},
            {"phase": "Skill Building", "weeks": "4-7", "goal": "Develop practical expertise", "topics": ["Advanced topics", "Real projects"], "resources": ["Project-based learning", "Community forums"], "milestone": "Build portfolio project"},
            {"phase": "Application", "weeks": "8-10", "goal": "Apply skills professionally", "topics": ["Interview prep", "Portfolio polish"], "resources": ["Mock interviews", "Job boards"], "milestone": "Apply to 5+ positions"},
        ],
    }


def _fallback_tasks(week: int) -> list[dict]:
    return [
        {"title": "Complete a learning module", "description": "Study a core concept for 45 minutes.", "difficulty": "easy", "estimated_time": "45 min", "tag": "Learning", "week_number": week},
        {"title": "Practice coding problems", "description": "Solve 2 problems on LeetCode or HackerRank.", "difficulty": "medium", "estimated_time": "60 min", "tag": "Practice", "week_number": week},
        {"title": "Read technical article", "description": "Read and summarize one technical blog post.", "difficulty": "easy", "estimated_time": "20 min", "tag": "Reading", "week_number": week},
        {"title": "Work on portfolio project", "description": "Add a new feature to your portfolio project.", "difficulty": "medium", "estimated_time": "90 min", "tag": "Project", "week_number": week},
        {"title": "Update professional profile", "description": "Update LinkedIn or resume with recent work.", "difficulty": "easy", "estimated_time": "30 min", "tag": "Career", "week_number": week},
    ]


def _fallback_analysis() -> dict:
    return {
        "overall_score": 70,
        "learning_pace": "normal",
        "strengths": ["Consistent effort", "Task completion"],
        "improvement_areas": ["Time management", "Depth of practice"],
        "insights": [
            "You're making steady progress on your career goals.",
            "Consider increasing practice time for technical skills.",
            "Consistent daily practice beats occasional intense sessions.",
        ],
        "next_week_recommendation": "Focus on completing all pending tasks before adding new ones.",
        "difficulty_adjustment": "maintain",
    }
