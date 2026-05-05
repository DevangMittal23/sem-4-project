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
    """Full skill gap analysis using profile + Adzuna real job market data."""
    if not settings.GEMINI_API_KEY:
        return _fallback_skill_gap(profile)

    # Format Adzuna skill demand as a readable table
    adzuna_skills = market_data.get("adzuna_market_skills", [])
    adzuna_table  = "\n".join(
        f"  {i+1}. {s['skill']} — mentioned in {s['demand']} of {market_data.get('adzuna_jobs_count', '?')} job listings"
        for i, s in enumerate(adzuna_skills[:15])
    ) or "  No Adzuna data available"

    salary_info = market_data.get("adzuna_salary", {})
    salary_line = f"Salary range from {market_data.get('adzuna_jobs_count', 0)} real job listings: {salary_info.get('formatted', 'N/A')}" if salary_info else "Salary data not available"

    prompt = f"""You are an expert career coach performing a data-driven skill gap analysis.

USER PROFILE:
- Profession: {profile.profession} ({profile.experience_level}, {profile.experience_years} yrs)
- Education: {profile.education}
- Current Skills: {', '.join(profile.skills) if profile.skills else 'None listed'}
- Goal: {profile.goal} | Target Role: {profile.target_role or profile.preferred_domain}
- Risk Tolerance: {profile.risk_tolerance} | Availability: {profile.availability}

REAL MARKET DATA (from {market_data.get('adzuna_jobs_count', 0)} live Adzuna job listings for "{market_data.get('role_searched', 'this role')}"):
{adzuna_table}
{salary_line}

Based on the REAL job listing data above, perform a precise skill gap analysis.
Return ONLY valid JSON:
{{
  "current_skills_assessment": [
    {{"skill": "Python", "current_level": "intermediate", "market_demand": "high", "gap": "needs advanced OOP and async"}}
  ],
  "gap_skills": [
    {{"skill": "System Design", "priority": "critical", "estimated_weeks": 4,
      "reason": "Appears in 14/20 job listings — required for senior roles"}}
  ],
  "market_insights": [
    "Python appears in 90% of listings — your strongest asset",
    "Docker/Kubernetes gap affects 70% of senior roles"
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
      "required_gap_skills": ["System Design", "Docker"],
      "reason": "Your Python + SQL skills match 80% of listings. Gap: system design.",
      "difficulty": "medium"
    }}
  ],
  "recommendations": [
    "System Design is in 70% of listings — prioritise this first"
  ],
  "risk_assessment": {{
    "low_risk_path": "Upskill in current role",
    "medium_risk_path": "Switch to adjacent role in 6 months",
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
    """Generate a complete 12-week roadmap with hyper-specific weekly tasks."""
    if not settings.GEMINI_API_KEY:
        return _fallback_roadmap(career_title, total_weeks)

    gap_skills     = skill_gap.get("gap_skills", [])[:8]
    market_data    = skill_gap.get("job_market_data", {})
    gap_skill_list = ", ".join(g["skill"] for g in gap_skills) or "general skills"

    prompt = f"""You are an expert career coach. Create a hyper-specific {total_weeks}-week learning roadmap.

TARGET ROLE: {career_title}
USER: {profile.experience_level} level | {profile.availability} available | {profile.learning_style or 'mixed'} learner
SKILLS TO BUILD (from real job market data): {gap_skill_list}
USER'S CURRENT SKILLS: {', '.join(profile.skills) if profile.skills else 'beginner'}

CRITICAL RULES FOR TASKS — every task MUST be specific:
- Learning tasks: name the EXACT topic, chapter, or concept. E.g. "Study Python decorators and context managers — Chapter 7 of Fluent Python" NOT "Study Python"
- Practice tasks: give the EXACT exercise. E.g. "Solve LeetCode #206 Reverse Linked List and #21 Merge Two Sorted Lists" NOT "Practice coding"
- Project tasks: give the EXACT project spec. E.g. "Build a REST API with FastAPI that has /users CRUD endpoints, JWT auth, and PostgreSQL via SQLAlchemy" NOT "Build a project"
- Reading tasks: name the EXACT article/resource. E.g. "Read 'Designing Data-Intensive Applications' Chapter 1: Reliable, Scalable, Maintainable Systems" NOT "Read about databases"
- Career tasks: give the EXACT action. E.g. "Update LinkedIn headline to 'Python Backend Engineer | FastAPI | PostgreSQL' and add 3 recent projects" NOT "Update LinkedIn"

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
      "goal": "Specific measurable goal",
      "focus_skills": ["exact skill 1", "exact skill 2"],
      "weekly_plans": [
        {{
          "week": 1,
          "theme": "Descriptive week theme",
          "goals": ["Specific goal 1", "Specific goal 2"],
          "tasks": [
            {{
              "title": "Short specific title",
              "description": "Exact detailed instructions: what to study/build/do, which resource to use, what the output should be",
              "tag": "Learning|Practice|Project|Reading|Career",
              "difficulty": "easy|medium|hard",
              "estimated_time": "45 min",
              "resource_url": "https://actual-url.com or empty string",
              "order": 1
            }}
          ]
        }}
      ],
      "milestone": "Concrete deliverable at phase end",
      "resources": ["Named resource 1", "Named resource 2"]
    }}
  ]
}}

Generate {total_weeks} weeks across 3 phases. Each week: 5 tasks. Make every description a precise instruction."""

    raw = _call(prompt, 0.4)
    result = _parse_json(raw)
    if isinstance(result, dict) and result.get("phases"):
        return result
    return _fallback_roadmap(career_title, total_weeks)


# ── Adaptive Next Week ────────────────────────────────────────────────────────

def generate_next_week(profile, roadmap: dict, current_week: int, completed_tasks: list, task_logs: list) -> dict:
    """Generate adaptive next week with hyper-specific tasks based on performance."""
    if not settings.GEMINI_API_KEY:
        return _fallback_next_week(current_week + 1)

    next_week        = current_week + 1
    completion_rate  = len([t for t in completed_tasks if t.get("status") == "done"]) / max(len(completed_tasks), 1)
    difficulty_trend = _avg_difficulty(task_logs)
    done_titles      = [t.get("title") for t in completed_tasks if t.get("status") == "done"][:5]
    skipped_titles   = [t.get("title") for t in completed_tasks if t.get("status") == "skipped"][:3]

    prompt = f"""Adaptive career coach. Generate week {next_week} tasks based on last week's performance.

ROADMAP: {roadmap.get('title', 'Career Development')}
USER: {profile.experience_level} | {profile.availability} available

WEEK {current_week} RESULTS:
- Completion: {completion_rate:.0%} ({len(done_titles)} done, {len(skipped_titles)} skipped)
- Difficulty feedback: {difficulty_trend}
- Completed: {json.dumps(done_titles)}
- Skipped: {json.dumps(skipped_titles)}

ADAPTATION:
- <60% done → 4 easier tasks, revisit skipped topics
- >90% done + "too_easy" → 5-6 harder tasks, add stretch challenge
- 60-90% done → 5 tasks, maintain difficulty

CRITICAL — every task description must be a precise instruction:
- Learning: exact topic + chapter/section + resource name
- Practice: exact problem numbers or exercise spec
- Project: exact feature to build with tech stack specified
- Reading: exact article title + publication
- Career: exact action with specific output

Return ONLY valid JSON:
{{
  "week": {next_week},
  "theme": "Specific week theme",
  "adaptation_note": "Why tasks are adjusted this way based on last week",
  "goals": ["Specific measurable goal 1", "Specific measurable goal 2"],
  "tasks": [
    {{
      "title": "Short specific title",
      "description": "Exact instruction: what to study/build/do, which resource, what the output is",
      "tag": "Learning|Practice|Project|Reading|Career",
      "difficulty": "easy|medium|hard",
      "estimated_time": "45 min",
      "resource_url": "https://url or empty",
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


# ── Personalized Weekly Task Generation ──────────────────────────────────────

def generate_weekly_tasks(profile, skill_gap: dict, week_number: int = 1) -> dict:
    """
    Generate a fully personalized week plan from profile + Adzuna skill gap.
    Returns {week, theme, goals, tasks[]} with hyper-specific instructions.
    """
    # Pull gap skills — sorted by priority
    gap_skills = skill_gap.get("gap_skills", [])
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    gap_skills_sorted = sorted(gap_skills, key=lambda x: priority_order.get(x.get("priority", "low"), 3))
    top_gaps = gap_skills_sorted[:5]

    # Availability → hours per week
    avail_map = {"lt5": "< 5", "5_10": "5–10", "10_20": "10–20", "gt20": "20+"}
    hours = avail_map.get(profile.availability, profile.availability or "10–20")

    # Goal label
    goal_map = {
        "switch_domain": "Switch to a new domain",
        "excel_current": "Excel in current domain",
        "get_job": "Get a job",
        "promotion": "Get a promotion",
        "side_income": "Build side income",
    }
    goal_label = goal_map.get(profile.goal, profile.goal or "career growth")

    gap_list = "\n".join(
        f"  - {g['skill']} (priority: {g['priority']}, ~{g['estimated_weeks']}w to learn) — {g['reason']}"
        for g in top_gaps
    ) or "  - General skill improvement"

    current_skills = ", ".join(profile.skills) if profile.skills else "None listed"
    domain = profile.target_role or profile.preferred_domain or profile.profession or "Software Engineering"

    if not settings.GEMINI_API_KEY:
        return _fallback_weekly_tasks(profile, top_gaps, week_number)

    prompt = f"""You are an expert AI career mentor generating a hyper-personalized Week {week_number} learning plan.

USER PROFILE:
- Name: {profile.name}
- Current Skills: {current_skills}
- Experience Level: {profile.experience_level}
- Goal: {goal_label}
- Target Domain/Role: {domain}
- Weekly Availability: {hours} hours/week
- Learning Style: {profile.learning_style or "mixed"}

SKILL GAPS TO ADDRESS (from real Adzuna job market data):
{gap_list}

STRICT TASK RULES — every task must be 100% specific and actionable:
1. LEARNING tasks: Name the EXACT topic + subtopics + resource.
   ✅ "Study Python list comprehensions, generators, and decorators — watch Corey Schafer's Python Tutorial playlist (episodes 18-21) on YouTube"
   ❌ "Study Python"

2. PRACTICE tasks: Give the EXACT problems or exercises.
   ✅ "Solve LeetCode problems #1 Two Sum, #217 Contains Duplicate, #242 Valid Anagram — focus on hash map approach, aim for O(n) time"
   ❌ "Practice coding"

3. PROJECT tasks: Give the EXACT project spec with tech stack.
   ✅ "Build a CLI expense tracker in Python: use SQLite for storage, implement add/list/delete commands, include a monthly summary report. Push to GitHub."
   ❌ "Build a project"

4. READING tasks: Name the EXACT article/chapter/resource.
   ✅ "Read 'The Pragmatic Programmer' Chapter 2: A Pragmatic Approach — focus on DRY principle and orthogonality. Take notes on 3 key takeaways."
   ❌ "Read about programming"

5. CAREER tasks: Give the EXACT action with measurable output.
   ✅ "Update your LinkedIn headline to '{domain} | {current_skills.split(',')[0].strip() if profile.skills else 'Developer'}' — add 2 recent projects with bullet-point impact metrics"
   ❌ "Update LinkedIn"

TIME CONSTRAINT: Total tasks must fit within {hours} hours/week. Distribute time realistically.

Return ONLY valid JSON:
{{
  "week": {week_number},
  "theme": "Specific descriptive theme for this week",
  "goals": [
    "Specific measurable goal 1",
    "Specific measurable goal 2"
  ],
  "tasks": [
    {{
      "title": "Short specific title (max 60 chars)",
      "description": "Full precise instruction — what exactly to do, which resource, what the output/deliverable is",
      "tag": "Learning",
      "target_skill": "The exact skill from the gap list this task addresses",
      "why_assigned": "One sentence: why this task matters for the user's goal",
      "difficulty": "easy",
      "estimated_time": "60 min",
      "resource_url": "https://actual-url.com or empty string",
      "order": 1
    }}
  ]
}}

Generate 5–6 tasks that together fit within {hours} hours/week. Include at least:
- 2 Learning tasks (different skills)
- 1 Practice task (with exact problems)
- 1 Project task (with full spec)
- 1 Reading or Career task"""

    raw = _call(prompt, 0.4)
    result = _parse_json(raw)
    if isinstance(result, dict) and result.get("tasks"):
        return result
    return _fallback_weekly_tasks(profile, top_gaps, week_number)


def _fallback_weekly_tasks(profile, top_gaps: list, week_number: int) -> dict:
    """Structured fallback when Gemini is unavailable — still personalized from profile."""
    domain = profile.target_role or profile.preferred_domain or profile.profession or "Software Engineering"
    skill1 = top_gaps[0]["skill"] if top_gaps else "Python"
    skill2 = top_gaps[1]["skill"] if len(top_gaps) > 1 else "System Design"
    current = profile.skills[0] if profile.skills else "programming"

    return {
        "week": week_number,
        "theme": f"Week {week_number}: Building {skill1} & {skill2} Foundations",
        "goals": [
            f"Understand core {skill1} concepts and complete 3 practice exercises",
            f"Start a mini project applying {current} skills",
        ],
        "tasks": [
            {
                "title": f"Learn {skill1} fundamentals",
                "description": f"Study the core concepts of {skill1}: watch the official documentation walkthrough or a beginner YouTube tutorial (search '{skill1} crash course 2024'). Take notes on key concepts and write 3 code examples.",
                "tag": "Learning",
                "target_skill": skill1,
                "why_assigned": f"{skill1} appears in the top missing skills for {domain} roles in the job market.",
                "difficulty": "easy",
                "estimated_time": "60 min",
                "resource_url": "",
                "order": 1,
            },
            {
                "title": f"Practice {skill1} with exercises",
                "description": f"Complete 5 beginner exercises on {skill1} from HackerRank or LeetCode. Focus on the most common patterns. Write solutions in your preferred language and review the optimal approach.",
                "tag": "Practice",
                "target_skill": skill1,
                "why_assigned": "Hands-on practice is the fastest way to retain new technical skills.",
                "difficulty": "medium",
                "estimated_time": "45 min",
                "resource_url": "https://www.hackerrank.com",
                "order": 2,
            },
            {
                "title": f"Study {skill2} basics",
                "description": f"Read the introduction to {skill2} — search for '{skill2} for beginners guide 2024' on Medium or Dev.to. Summarize the 3 most important concepts in your own words.",
                "tag": "Reading",
                "target_skill": skill2,
                "why_assigned": f"{skill2} is a high-priority gap skill required for your target role.",
                "difficulty": "easy",
                "estimated_time": "30 min",
                "resource_url": "https://dev.to",
                "order": 3,
            },
            {
                "title": f"Build a mini {domain} project",
                "description": f"Build a small project using {current}: create a command-line tool or simple web app that solves a real problem. Requirements: at least 3 features, clean code, pushed to GitHub with a README. Suggested idea: a personal task manager or data fetcher.",
                "tag": "Project",
                "target_skill": current,
                "why_assigned": "Portfolio projects are the #1 factor employers look for when hiring.",
                "difficulty": "medium",
                "estimated_time": "90 min",
                "resource_url": "https://github.com",
                "order": 4,
            },
            {
                "title": "Update professional profile",
                "description": f"Update your LinkedIn profile: (1) Set headline to '{domain} | {current}', (2) Add your mini project to the Featured section with a 2-sentence description, (3) Connect with 3 professionals in {domain} and send a personalised note.",
                "tag": "Career",
                "target_skill": "Personal Branding",
                "why_assigned": "A strong LinkedIn profile increases recruiter outreach by 40%.",
                "difficulty": "easy",
                "estimated_time": "30 min",
                "resource_url": "https://linkedin.com",
                "order": 5,
            },
        ],
    }
