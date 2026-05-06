"""
workflow_service.py

Orchestrates the full pipeline:
  Assessment complete
    → extract & save profile
    → run Adzuna skill gap
    → run Gemini career prediction
    → generate Week 1 tasks
    → return dashboard-ready data

All steps are idempotent — safe to re-run.
"""
import logging
from django.db import transaction

from accounts.models import UserProfile, CareerPath
from dashboard.models import SkillGapAnalysis, Roadmap, WeeklyPlan, Task

from .adzuna_service import fetch_jobs, extract_skills, extract_salary_summary, calculate_skill_gap
from .gemini_service import analyze_skill_gap, predict_career, generate_weekly_tasks

logger = logging.getLogger("ai_engine")


# ── Choice-code normalisation (same as groq_service) ─────────────────────────

_CHOICE_MAPS = {
    "experience_level": {
        "fresher": "fresher", "junior": "junior", "mid": "mid",
        "senior": "senior", "lead": "lead",
    },
    "education": {
        "high school": "high_school", "diploma": "diploma",
        "bachelor": "bachelors", "master": "masters",
        "phd": "phd", "self": "self_taught",
    },
    "current_status": {
        "student": "student", "employed": "employed",
        "freelance": "freelance", "unemployed": "unemployed",
        "career break": "career_break",
    },
    "availability": {
        "less than 5": "lt5", "< 5": "lt5",
        "5 to 10": "5_10", "5-10": "5_10",
        "10 to 20": "10_20", "10-20": "10_20",
        "more than 20": "gt20", "20+": "gt20",
    },
    "goal": {
        "switch": "switch_domain", "excel": "excel_current",
        "get a job": "get_job", "get job": "get_job",
        "promotion": "promotion", "side income": "side_income",
    },
}


def _normalise(field: str, value: str) -> str:
    mapping = _CHOICE_MAPS.get(field)
    if not mapping:
        return value.strip()
    lower = value.lower().strip()
    for key, code in mapping.items():
        if key in lower:
            return code
    return value.strip()


def _apply_extracted(profile: UserProfile, extracted: dict) -> list[str]:
    """Apply extracted dict to profile, normalising choice fields. Returns list of saved fields."""
    saved = []
    for field, value in extracted.items():
        if not value or not hasattr(profile, field):
            continue
        if isinstance(value, list):
            if value:
                setattr(profile, field, value)
                saved.append(field)
        else:
            normalised = _normalise(field, str(value))
            if normalised:
                setattr(profile, field, normalised)
                saved.append(field)
    return saved


# ── Step 2: Skill gap via Adzuna + Gemini ─────────────────────────────────────

def run_skill_gap(user, profile: UserProfile) -> SkillGapAnalysis:
    """Fetch Adzuna jobs → extract skills → Gemini analysis → save."""
    role = profile.target_role or profile.preferred_domain or profile.profession or "Software Engineer"

    jobs             = fetch_jobs(role, results=20)
    market_skills    = extract_skills(jobs) if jobs else []
    salary           = extract_salary_summary(jobs) if jobs else {}
    user_gap         = calculate_skill_gap(profile.skills or [], market_skills)

    market_data = {
        "adzuna_market_skills": market_skills[:20],
        "adzuna_salary":        salary,
        "adzuna_jobs_count":    len(jobs),
        "role_searched":        role,
    }

    analysis = analyze_skill_gap(profile, market_data)

    # Merge Adzuna salary if Gemini left it blank
    if salary and not analysis.get("job_market_data", {}).get("avg_salary_current"):
        analysis.setdefault("job_market_data", {})["avg_salary_current"] = salary.get("formatted", "")

    gap, _ = SkillGapAnalysis.objects.update_or_create(
        user=user,
        defaults={
            "current_skills":       profile.skills,
            "required_skills":      [g["skill"] for g in analysis.get("gap_skills", [])],
            "gap_skills":           analysis.get("gap_skills", []),
            "market_insights":      analysis.get("market_insights", []),
            "job_market_data":      analysis.get("job_market_data", {}),
            "recommendations":      analysis.get("recommendations", []),
            "career_options":       analysis.get("career_options", []),
            "adzuna_jobs":          jobs[:10],
            "adzuna_market_skills": market_skills,
            "adzuna_salary":        salary,
            "adzuna_role_searched": role,
            "adzuna_jobs_count":    len(jobs),
        },
    )
    logger.info("Skill gap saved for %s | role=%s | jobs=%d | gap_skills=%d",
                user.email, role, len(jobs), len(analysis.get("gap_skills", [])))
    return gap


# ── Step 3: Career prediction via Gemini ──────────────────────────────────────

def run_career_prediction(user, profile: UserProfile) -> list[CareerPath]:
    """Gemini career prediction → save CareerPath records."""
    careers = predict_career(profile)
    CareerPath.objects.filter(user=user).delete()
    saved = []
    for c in careers:
        obj = CareerPath.objects.create(
            user=user,
            title=c.get("title", ""),
            description=c.get("description", ""),
            required_skills=c.get("required_skills", []),
            match_score=c.get("match_score", 0),
            salary_range=c.get("salary_range", ""),
            market_demand=c.get("market_demand", ""),
        )
        saved.append(obj)
    logger.info("Career paths saved for %s: %s", user.email, [c.title for c in saved])
    return saved


# ── Step 4: Week 1 task generation via Gemini ─────────────────────────────────

def run_task_generation(user, profile: UserProfile, gap: SkillGapAnalysis) -> list[Task]:
    """Generate Week 1 tasks using Gemini → save under a Roadmap + WeeklyPlan."""
    skill_gap_data = {
        "gap_skills":      gap.gap_skills,
        "market_insights": gap.market_insights,
        "job_market_data": gap.job_market_data,
    }

    week_data = generate_weekly_tasks(profile, skill_gap_data, week_number=1)

    career_title = (
        profile.target_role or profile.preferred_domain
        or profile.profession or "Career Development"
    )

    roadmap, _ = Roadmap.objects.get_or_create(
        user=user,
        defaults={
            "career_title": career_title,
            "total_weeks":  12,
            "current_week": 1,
            "phases":       [],
            "is_active":    True,
        },
    )

    WeeklyPlan.objects.filter(user=user, week_number=1).update(is_current=False)
    plan, _ = WeeklyPlan.objects.update_or_create(
        roadmap=roadmap,
        week_number=1,
        defaults={
            "user":       user,
            "theme":      week_data.get("theme", "Week 1"),
            "goals":      week_data.get("goals", []),
            "is_current": True,
        },
    )

    Task.objects.filter(user=user, week_number=1).delete()
    saved = []
    for t in week_data.get("tasks", []):
        obj = Task.objects.create(
            user=user,
            weekly_plan=plan,
            title=t.get("title", ""),
            description=t.get("description", ""),
            tag=t.get("tag", "Learning"),
            difficulty=t.get("difficulty", "medium"),
            estimated_time=t.get("estimated_time", ""),
            resource_url=t.get("resource_url", ""),
            target_skill=t.get("target_skill", ""),
            why_assigned=t.get("why_assigned", ""),
            week_number=1,
            order=t.get("order", 0),
        )
        saved.append(obj)

    logger.info("Week 1 tasks generated for %s: %d tasks", user.email, len(saved))
    return saved


# ── MAIN PIPELINE ─────────────────────────────────────────────────────────────

def run_post_assessment_pipeline(user, extracted: dict) -> dict:
    """
    Called immediately after assessment completes.
    Runs all steps atomically and returns a summary.

    Steps:
      1. Apply extracted profile data
      2. Run Adzuna skill gap
      3. Run Gemini career prediction
      4. Generate Week 1 tasks
    """
    with transaction.atomic():
        profile, _ = UserProfile.objects.get_or_create(user=user)

        # Step 1 — apply extracted profile
        saved_fields = _apply_extracted(profile, extracted)
        profile.is_assessment_completed = True
        profile.save()
        logger.info("Profile saved for %s | fields=%s | completion=%d%%",
                    user.email, saved_fields, profile.profile_completion)

    # Steps 2-4 run outside the transaction so partial failures don't roll back profile save
    gap = None
    careers = []
    tasks = []

    try:
        gap = run_skill_gap(user, profile)
    except Exception as e:
        logger.error("Skill gap failed for %s: %s", user.email, e)

    try:
        careers = run_career_prediction(user, profile)
    except Exception as e:
        logger.error("Career prediction failed for %s: %s", user.email, e)

    try:
        if gap:
            tasks = run_task_generation(user, profile, gap)
    except Exception as e:
        logger.error("Task generation failed for %s: %s", user.email, e)

    # Refresh profile after all saves
    profile.refresh_from_db()

    return {
        "profile_completion":    profile.profile_completion,
        "is_assessment_completed": True,
        "saved_profile_fields":  saved_fields,
        "gap_skills_count":      len(gap.gap_skills) if gap else 0,
        "careers_count":         len(careers),
        "tasks_generated":       len(tasks),
    }
