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
            config=types.GenerateContentConfig(temperature=temperature, max_output_tokens=4096),
        )
        return response.text.strip()
    except Exception as e:
        logger.error("Gemini API error: %s", e)
        return ""


def _parse_json(text: str):
    try:
        a, b = text.find("["), text.find("{")
        if a == -1 and b == -1:
            return {}
        if a != -1 and (b == -1 or a < b):
            return json.loads(text[a: text.rfind("]") + 1])
        return json.loads(text[b: text.rfind("}") + 1])
    except Exception:
        return {}


# ── Skill Gap Analysis ────────────────────────────────────────────────────────

def analyze_skill_gap(profile, market_data: dict) -> dict:
    """Full skill gap analysis using profile + live market data."""
    if not settings.GEMINI_API_KEY:
        return _fallback_skill_gap(profile)

    market_summary = json.dumps(market_data, indent=2)[:3000]

    prompt = f"""You are an expert career coach and skill gap analyst.

USER PROFILE:
- Name: {profile.name}
- Profession: {profile.profession}
- Experience: {profile.experience_years} years ({profile.experience_level})
- Education: {profile.education}
- Current Skills: {json.dumps(profile.skills)}
- Skill Levels: {json.dumps(profile.skill_levels)}
- Goal: {profile.goal}
- Target Role: {profile.target_role or profile.preferred_domain}
- Risk Tolerance: {profile.risk_tolerance}
- Availability: {profile.availability}
- Learning Style: {profile.learning_style or 'mixed'}
- Certifications: {json.dumps(profile.certifications)}
- Thinking Style: {profile.thinking_style}
- Side Income Type: {profile.side_income_type or 'N/A'}

LIVE MARKET DATA:
{market_summary}

Perform a comprehensive skill gap analysis. Return ONLY valid JSON:
{{
  "current_skills_assessment": [
    {{"skill": "Python", "current_level": "intermediate", "market_demand": "high", "gap": "needs advanced"}}
  ],
  "gap_skills": [
    {{"skill": "System Design", "priority": "critical", "estimated_weeks": 4, "reason": "Required for senior roles"}}
  ],
  "market_insights": [
    "insight about current market conditions"
  ],
  "job_market_data": {{
    "avg_salary_current": "$70,000",
    "avg_salary_target": "$110,000",
    "demand_level": "high",
    "top_hiring_companies": ["Google", "Amazon", "Meta"],
    "growth_rate": "15% YoY"
  }},
  "career_options": [
    {{
      "title": "Senior Software Engineer",
      "fit_score": 85,
      "time_to_achieve": "6-9 months",
      "salary_range": "$100,000-$140,000",
      "required_gap_skills": ["System Design", "Leadership"],
      "reason": "Strong alignment with current skills",
      "difficulty": "medium"
    }}
  ],
  "recommendations": [
    "Focus on system design — highest ROI for your goal",
    "Get AWS certification to increase market value by 20%"
  ],
  "risk_assessment": {{
    "low_risk_path": "Excel in current role with skill upgrades",
    "medium_risk_path": "Transition to adjacent role in 6 months",
    "high_risk_path": "Full domain switch in 3 months"
  }}
}}"""

    raw = _call(prompt, 0.3)
    result = _parse_json(raw)
    if isinstance(result, dict) and result.get("career_options"):
        return result
    return _fallback_skill_gap(profile)


# ── Career Prediction ─────────────────────────────────────────────────────────

def predict_career(profile) -> list[dict]:
    if not settings.GEMINI_API_KEY:
        return _fallback_career(profile)

    prompt = f"""Career counselor. Based on this profile, suggest exactly 3 career paths.

Profile: name={profile.name}, profession={profile.profession}, experience={profile.experience_years}y ({profile.experience_level}),
goal={profile.goal}, skills={profile.skills}, domain={profile.preferred_domain}, education={profile.education},
risk_tolerance={profile.risk_tolerance}, target_role={profile.target_role}

Return ONLY JSON array of 3:
[{{"title":"","description":"","required_skills":[],"match_score":85,"timeline":"","salary_range":"","market_demand":"high","reasoning":""}}]"""

    raw = _call(prompt, 0.5)
    result = _parse_json(raw)
    return result if isinstance(result, list) and result else _fallback_career(profile)


# ── Full Roadmap Generation ───────────────────────────────────────────────────

def generate_full_roadmap(profile, career_title: str, skill_gap: dict, total_weeks: int = 12) -> dict:
    """Generate a complete 12-week roadmap with weekly breakdown."""
    if not settings.GEMINI_API_KEY:
        return _fallback_roadmap(career_title, total_weeks)

    gap_skills = json.dumps(skill_gap.get("gap_skills", [])[:8])
    market_insights = json.dumps(skill_gap.get("market_insights", [])[:3])

    prompt = f"""You are an expert career coach. Create a detailed {total_weeks}-week learning roadmap.

TARGET: {career_title}
USER: {profile.experience_level} level, {profile.availability} availability, {profile.learning_style or "mixed"} learner, {profile.risk_tolerance or "medium"} risk tolerance
THINKING STYLE: {profile.thinking_style or "analytical"}
SKILL GAPS: {gap_skills}
MARKET INSIGHTS: {market_insights}

Return ONLY valid JSON:
{{
  "title": "{career_title} Roadmap",
  "total_weeks": {total_weeks},
  "phases": [
    {{
      "phase": "Phase Name",
      "phase_number": 1,
      "weeks": "1-3",
      "week_start": 1,
      "week_end": 3,
      "goal": "What to achieve",
      "focus_skills": ["skill1", "skill2"],
      "weekly_plans": [
        {{
          "week": 1,
          "theme": "Week theme",
          "goals": ["goal1", "goal2"],
          "tasks": [
            {{
              "title": "Task title",
              "description": "What to do specifically",
              "tag": "Learning|Practice|Project|Reading|Career",
              "difficulty": "easy|medium|hard",
              "estimated_time": "45 min",
              "resource_url": "",
              "order": 1
            }}
          ]
        }}
      ],
      "milestone": "Measurable outcome at phase end",
      "resources": ["resource1", "resource2"]
    }}
  ]
}}

Rules:
- Create {total_weeks} weeks total across 3-4 phases
- Each week has 4-6 specific, actionable tasks
- Tasks must be concrete (not vague)
- Increase difficulty progressively
- Include mix of Learning, Practice, Project, Reading, Career tasks"""

    raw = _call(prompt, 0.4)
    result = _parse_json(raw)
    if isinstance(result, dict) and result.get("phases"):
        return result
    return _fallback_roadmap(career_title, total_weeks)


# ── Adaptive Next Week ────────────────────────────────────────────────────────

def generate_next_week(profile, roadmap: dict, current_week: int, completed_tasks: list, task_logs: list) -> dict:
    """Generate adaptive next week plan based on performance."""
    if not settings.GEMINI_API_KEY:
        return _fallback_next_week(current_week + 1)

    next_week = current_week + 1
    completion_rate = len([t for t in completed_tasks if t.get("status") == "done"]) / max(len(completed_tasks), 1)
    avg_difficulty_feedback = _avg_difficulty(task_logs)

    prompt = f"""Adaptive learning system. Generate week {next_week} tasks based on performance.

USER: {profile.experience_level}, {profile.availability} available
ROADMAP TARGET: {roadmap.get("title", "Career Development")}
WEEK {current_week} PERFORMANCE:
- Completion rate: {completion_rate:.0%}
- Difficulty feedback: {avg_difficulty_feedback}
- Completed tasks: {json.dumps([t.get("title") for t in completed_tasks if t.get("status") == "done"][:5])}
- Skipped tasks: {json.dumps([t.get("title") for t in completed_tasks if t.get("status") == "skipped"][:3])}

ADAPTATION RULES:
- If completion < 60%: reduce difficulty, fewer tasks (4 tasks)
- If completion > 90% and difficulty "too_easy": increase difficulty, add stretch task
- If completion 60-90%: maintain pace (5 tasks)
- Always build on what was completed

Return ONLY valid JSON:
{{
  "week": {next_week},
  "theme": "Week theme based on progress",
  "adaptation_note": "Why this week is adjusted this way",
  "goals": ["goal1", "goal2"],
  "tasks": [
    {{
      "title": "Specific task",
      "description": "Detailed description",
      "tag": "Learning|Practice|Project|Reading|Career",
      "difficulty": "easy|medium|hard",
      "estimated_time": "45 min",
      "resource_url": "",
      "order": 1
    }}
  ]
}}"""

    raw = _call(prompt, 0.5)
    result = _parse_json(raw)
    if isinstance(result, dict) and result.get("tasks"):
        return result
    return _fallback_next_week(next_week)


def _avg_difficulty(task_logs: list) -> str:
    if not task_logs:
        return "just_right"
    feedbacks = [l.get("difficulty_feedback", "") for l in task_logs if l.get("difficulty_feedback")]
    if not feedbacks:
        return "just_right"
    if feedbacks.count("too_hard") > len(feedbacks) / 2:
        return "too_hard"
    if feedbacks.count("too_easy") > len(feedbacks) / 2:
        return "too_easy"
    return "just_right"


# ── Weekly Performance Analysis ───────────────────────────────────────────────

def analyze_performance(profile, task_logs: list[dict]) -> dict:
    if not settings.GEMINI_API_KEY or not task_logs:
        return _fallback_analysis()

    prompt = f"""Analyze career development performance.

User: {profile.experience_level}, goal={profile.goal}
Task logs: {json.dumps(task_logs[:20], indent=2)}

Return ONLY JSON:
{{
  "overall_score": 75,
  "learning_pace": "fast|normal|slow",
  "strengths": ["strength1"],
  "improvement_areas": ["area1"],
  "insights": ["insight1", "insight2", "insight3"],
  "next_week_recommendation": "Specific recommendation",
  "difficulty_adjustment": "increase|maintain|decrease",
  "weekly_summary": "2-3 sentence summary of this week"
}}"""

    raw = _call(prompt, 0.4)
    result = _parse_json(raw)
    return result if isinstance(result, dict) and result.get("insights") else _fallback_analysis()


# ── Fallbacks ─────────────────────────────────────────────────────────────────

def _fallback_skill_gap(profile) -> dict:
    skills = profile.skills or []
    domain = profile.preferred_domain or profile.profession or "Software Engineering"
    return {
        "current_skills_assessment": [{"skill": s, "current_level": "intermediate", "market_demand": "high", "gap": "needs practice"} for s in skills[:3]],
        "gap_skills": [
            {"skill": "System Design", "priority": "critical", "estimated_weeks": 4, "reason": "Required for senior roles"},
            {"skill": "Cloud Platforms", "priority": "high", "estimated_weeks": 3, "reason": "Industry standard"},
            {"skill": "Data Structures & Algorithms", "priority": "high", "estimated_weeks": 6, "reason": "Interview requirement"},
        ],
        "market_insights": [f"{domain} has high demand", "Remote work opportunities growing", "AI skills increasingly valued"],
        "job_market_data": {"avg_salary_current": "$70,000", "avg_salary_target": "$110,000", "demand_level": "high", "top_hiring_companies": ["Google", "Amazon", "Microsoft"], "growth_rate": "15% YoY"},
        "career_options": [
            {"title": f"Senior {domain} Engineer", "fit_score": 85, "time_to_achieve": "6-9 months", "salary_range": "$100,000-$140,000", "required_gap_skills": ["System Design"], "reason": "Natural progression", "difficulty": "medium"},
            {"title": "Full Stack Developer", "fit_score": 78, "time_to_achieve": "4-6 months", "salary_range": "$90,000-$130,000", "required_gap_skills": ["React", "Node.js"], "reason": "High demand role", "difficulty": "medium"},
        ],
        "recommendations": ["Focus on system design for highest ROI", "Build 2-3 portfolio projects", "Get cloud certification"],
        "risk_assessment": {"low_risk_path": "Upskill in current role", "medium_risk_path": "Switch to adjacent role", "high_risk_path": "Full domain switch"},
    }


def _fallback_career(profile) -> list[dict]:
    domain = profile.preferred_domain or profile.profession or "Technology"
    return [
        {"title": f"Senior {domain} Engineer", "description": f"Advance in {domain} with your current experience.", "required_skills": profile.skills[:3] or ["Problem Solving"], "match_score": 88, "timeline": "6-12 months", "salary_range": "$100k-$140k", "market_demand": "high", "reasoning": "Strong alignment."},
        {"title": "Full Stack Developer", "description": "Build end-to-end applications.", "required_skills": ["JavaScript", "Python", "System Design"], "match_score": 82, "timeline": "8-12 months", "salary_range": "$90k-$130k", "market_demand": "high", "reasoning": "High demand."},
        {"title": "Technical Lead", "description": "Lead engineering teams.", "required_skills": ["Architecture", "Mentoring"], "match_score": 76, "timeline": "12-18 months", "salary_range": "$120k-$160k", "market_demand": "medium", "reasoning": "Natural progression."},
    ]


def _fallback_roadmap(career_title: str, total_weeks: int = 12) -> dict:
    return {
        "title": f"{career_title} Roadmap",
        "total_weeks": total_weeks,
        "phases": [
            {
                "phase": "Foundation", "phase_number": 1, "weeks": "1-3", "week_start": 1, "week_end": 3,
                "goal": "Build core fundamentals", "focus_skills": ["Core concepts", "Basic tooling"],
                "weekly_plans": [
                    {"week": w, "theme": f"Week {w} — Foundation", "goals": ["Learn fundamentals", "Practice basics"],
                     "tasks": [
                         {"title": "Study core concepts", "description": "Read documentation and tutorials", "tag": "Learning", "difficulty": "easy", "estimated_time": "60 min", "resource_url": "", "order": 1},
                         {"title": "Complete practice exercises", "description": "Apply what you learned", "tag": "Practice", "difficulty": "easy", "estimated_time": "45 min", "resource_url": "", "order": 2},
                         {"title": "Build a small project", "description": "Create something simple", "tag": "Project", "difficulty": "medium", "estimated_time": "90 min", "resource_url": "", "order": 3},
                         {"title": "Review and reflect", "description": "Note what you learned", "tag": "Reading", "difficulty": "easy", "estimated_time": "20 min", "resource_url": "", "order": 4},
                     ]} for w in range(1, 4)
                ],
                "milestone": "Complete introductory project", "resources": ["Official docs", "Online courses"],
            },
            {
                "phase": "Skill Building", "phase_number": 2, "weeks": "4-8", "week_start": 4, "week_end": 8,
                "goal": "Develop practical expertise", "focus_skills": ["Advanced topics", "Real projects"],
                "weekly_plans": [
                    {"week": w, "theme": f"Week {w} — Skill Building", "goals": ["Deepen knowledge", "Build portfolio"],
                     "tasks": [
                         {"title": "Advanced topic study", "description": "Dive deeper into key concepts", "tag": "Learning", "difficulty": "medium", "estimated_time": "60 min", "resource_url": "", "order": 1},
                         {"title": "Portfolio project work", "description": "Add features to your project", "tag": "Project", "difficulty": "medium", "estimated_time": "120 min", "resource_url": "", "order": 2},
                         {"title": "Code review practice", "description": "Review others' code on GitHub", "tag": "Practice", "difficulty": "medium", "estimated_time": "30 min", "resource_url": "", "order": 3},
                         {"title": "Industry reading", "description": "Read tech blogs and articles", "tag": "Reading", "difficulty": "easy", "estimated_time": "20 min", "resource_url": "", "order": 4},
                         {"title": "Network outreach", "description": "Connect with 2 professionals", "tag": "Career", "difficulty": "easy", "estimated_time": "30 min", "resource_url": "", "order": 5},
                     ]} for w in range(4, 9)
                ],
                "milestone": "Complete portfolio project", "resources": ["Project-based learning", "GitHub"],
            },
            {
                "phase": "Application", "phase_number": 3, "weeks": "9-12", "week_start": 9, "week_end": total_weeks,
                "goal": "Apply skills professionally", "focus_skills": ["Interview prep", "Job search"],
                "weekly_plans": [
                    {"week": w, "theme": f"Week {w} — Application", "goals": ["Prepare for opportunities", "Apply skills"],
                     "tasks": [
                         {"title": "Mock interview practice", "description": "Practice common interview questions", "tag": "Practice", "difficulty": "hard", "estimated_time": "60 min", "resource_url": "", "order": 1},
                         {"title": "Resume/portfolio update", "description": "Update with recent work", "tag": "Career", "difficulty": "easy", "estimated_time": "45 min", "resource_url": "", "order": 2},
                         {"title": "Apply to opportunities", "description": "Apply to 3+ positions or clients", "tag": "Career", "difficulty": "medium", "estimated_time": "60 min", "resource_url": "", "order": 3},
                         {"title": "Skill reinforcement", "description": "Practice weak areas", "tag": "Practice", "difficulty": "medium", "estimated_time": "45 min", "resource_url": "", "order": 4},
                     ]} for w in range(9, total_weeks + 1)
                ],
                "milestone": "Land first opportunity", "resources": ["Job boards", "LinkedIn"],
            },
        ],
    }


def _fallback_next_week(week: int) -> dict:
    return {
        "week": week, "theme": f"Week {week} — Continued Progress",
        "adaptation_note": "Maintaining current pace based on your performance.",
        "goals": ["Continue skill development", "Apply learned concepts"],
        "tasks": [
            {"title": "Core skill practice", "description": "Practice the main skill for this week", "tag": "Practice", "difficulty": "medium", "estimated_time": "60 min", "resource_url": "", "order": 1},
            {"title": "Learning module", "description": "Complete a learning resource", "tag": "Learning", "difficulty": "medium", "estimated_time": "45 min", "resource_url": "", "order": 2},
            {"title": "Project work", "description": "Work on your portfolio project", "tag": "Project", "difficulty": "medium", "estimated_time": "90 min", "resource_url": "", "order": 3},
            {"title": "Industry reading", "description": "Read about industry trends", "tag": "Reading", "difficulty": "easy", "estimated_time": "20 min", "resource_url": "", "order": 4},
            {"title": "Career action", "description": "Take one career-building action", "tag": "Career", "difficulty": "easy", "estimated_time": "30 min", "resource_url": "", "order": 5},
        ],
    }


def _fallback_analysis() -> dict:
    return {
        "overall_score": 70, "learning_pace": "normal",
        "strengths": ["Consistent effort", "Task completion"],
        "improvement_areas": ["Time management", "Depth of practice"],
        "insights": ["You're making steady progress.", "Consider increasing practice time.", "Consistency beats intensity."],
        "next_week_recommendation": "Focus on completing all pending tasks.",
        "difficulty_adjustment": "maintain",
        "weekly_summary": "Good progress this week. Keep the momentum going.",
    }
