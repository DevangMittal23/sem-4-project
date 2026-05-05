import re
import time
import logging
import requests
from django.conf import settings

logger = logging.getLogger("ai_engine")

# ── Adzuna credentials ────────────────────────────────────────────────────────
ADZUNA_APP_ID  = getattr(settings, "ADZUNA_APP_ID",  "e8f35901")
ADZUNA_APP_KEY = getattr(settings, "ADZUNA_APP_KEY", "c0f126251d3d80b02f3a1a8b2035b1c8")
ADZUNA_BASE    = "https://api.adzuna.com/v1/api/jobs"
COUNTRY        = "gb"          # gb = global index with widest coverage; swap to "us" if preferred

# ── Skill keyword bank ────────────────────────────────────────────────────────
SKILL_KEYWORDS: list[str] = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r",
    # Web
    "react", "next.js", "vue", "angular", "node", "node.js", "express",
    "django", "flask", "fastapi", "spring", "laravel",
    # Data / AI
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "data analysis", "data science", "statistics",
    # Databases
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "dynamodb", "firebase",
    # Cloud / DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd",
    "linux", "bash", "git",
    # Other
    "rest api", "graphql", "microservices", "system design",
    "agile", "scrum", "communication", "leadership",
]

# ── Simple in-memory cache {cache_key: (timestamp, data)} ────────────────────
_CACHE: dict[str, tuple[float, object]] = {}
CACHE_TTL = 3600  # 1 hour


def _cache_get(key: str):
    entry = _CACHE.get(key)
    if entry and (time.time() - entry[0]) < CACHE_TTL:
        return entry[1]
    return None


def _cache_set(key: str, data):
    _CACHE[key] = (time.time(), data)


# ── 1. Fetch jobs ─────────────────────────────────────────────────────────────

def fetch_jobs(role: str, results: int = 20) -> list[dict]:
    """
    Fetch job listings from Adzuna for a given role.
    Returns a list of job dicts with title, description, company, location.
    """
    cache_key = f"adzuna:{role.lower().strip()}:{results}"
    cached = _cache_get(cache_key)
    if cached is not None:
        logger.info("Adzuna cache hit for '%s'", role)
        return cached

    url = f"{ADZUNA_BASE}/{COUNTRY}/search/1"
    params = {
        "app_id":       ADZUNA_APP_ID,
        "app_key":      ADZUNA_APP_KEY,
        "results_per_page": min(results, 50),
        "what":         role,
        "content-type": "application/json",
    }

    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        jobs = resp.json().get("results", [])
        simplified = [
            {
                "title":       j.get("title", ""),
                "company":     j.get("company", {}).get("display_name", ""),
                "location":    j.get("location", {}).get("display_name", ""),
                "description": j.get("description", ""),
                "salary_min":  j.get("salary_min"),
                "salary_max":  j.get("salary_max"),
                "redirect_url": j.get("redirect_url", ""),
            }
            for j in jobs
        ]
        _cache_set(cache_key, simplified)
        logger.info("Adzuna fetched %d jobs for '%s'", len(simplified), role)
        return simplified

    except requests.exceptions.Timeout:
        logger.warning("Adzuna timeout for '%s'", role)
        return []
    except requests.exceptions.HTTPError as e:
        logger.error("Adzuna HTTP error for '%s': %s", role, e)
        return []
    except Exception as e:
        logger.error("Adzuna unexpected error: %s", e)
        return []


# ── 2. Extract skills ─────────────────────────────────────────────────────────

def extract_skills(jobs: list[dict]) -> list[dict]:
    """
    Scan all job descriptions for skill keywords.
    Returns [{"skill": "python", "demand": 12}, ...] sorted by demand desc.
    """
    counts: dict[str, int] = {}

    for job in jobs:
        text = (job.get("title", "") + " " + job.get("description", "")).lower()
        for skill in SKILL_KEYWORDS:
            # Use word-boundary matching so "r" doesn't match inside "react"
            pattern = r"\b" + re.escape(skill) + r"\b"
            if re.search(pattern, text):
                counts[skill] = counts.get(skill, 0) + 1

    sorted_skills = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return [{"skill": skill, "demand": count} for skill, count in sorted_skills if count > 0]


# ── 3. Skill gap ──────────────────────────────────────────────────────────────

def calculate_skill_gap(user_skills: list[str], market_skills: list[dict]) -> dict:
    """
    Compare user skills against market demand.
    Returns missing_skills and strengths.
    """
    user_lower = {s.lower().strip() for s in user_skills}
    market_lower = {item["skill"].lower() for item in market_skills}

    strengths     = [s for s in user_skills if s.lower().strip() in market_lower]
    missing_skills = [
        item["skill"]
        for item in market_skills
        if item["skill"] not in user_lower
    ]

    return {
        "strengths":      strengths,
        "missing_skills": missing_skills,
    }


# ── 4. Salary summary ─────────────────────────────────────────────────────────

def extract_salary_summary(jobs: list[dict]) -> dict:
    """Compute average salary range from job listings that include salary data."""
    salaries = [
        (j["salary_min"], j["salary_max"])
        for j in jobs
        if j.get("salary_min") and j.get("salary_max")
    ]
    if not salaries:
        return {}
    avg_min = round(sum(s[0] for s in salaries) / len(salaries))
    avg_max = round(sum(s[1] for s in salaries) / len(salaries))
    return {
        "avg_min": avg_min,
        "avg_max": avg_max,
        "sample_size": len(salaries),
        "formatted": f"${avg_min:,} – ${avg_max:,}",
    }
