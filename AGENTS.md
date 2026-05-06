# AI Career Mentor — System Architecture

## Overview

AI Career Mentor is a full-stack AI-powered career guidance platform that:
1. Interviews users via conversational AI (Groq)
2. Builds a behavioral + skill-based profile
3. Fetches real job market data (Adzuna)
4. Performs skill gap analysis (Gemini)
5. Generates personalized weekly learning plans (Gemini)
6. Tracks progress and adapts over time

---

## AI Agent Architecture

### Agent 1: Assessment Interviewer (Groq — `llama-3.3-70b-versatile`)
- **Endpoint**: `POST /api/ai/assessment/chat/`
- **Role**: Conducts structured onboarding interview
- **Collects**: name, profession, experience, goal, skills, thinking style, education, status, availability
- **Triggers**: After user registers (one-time only)
- **Output**: Structured profile data → saved to `UserProfile`

### Agent 2: Profile Completion Assistant (Groq — `llama-3.3-70b-versatile`)
- **Endpoint**: `POST /api/ai/profile/chat/`
- **Role**: Fills missing profile fields conversationally
- **Collects**: target_role, risk_tolerance, learning_style, side_income_type
- **Triggers**: When `profile_completion < 80%`

### Agent 3: Skill Gap Analyst (Adzuna + Gemini — `gemini-2.0-flash`)
- **Endpoint**: `POST /api/ai/skill-gap/`
- **Role**: Fetches real job listings → extracts market skills → Gemini reasons over data
- **Output**: gap_skills, market_insights, job_market_data, career_options
- **Triggers**: After assessment OR profile update

### Agent 4: Career Predictor (Gemini — `gemini-2.0-flash`)
- **Endpoint**: `POST /api/ai/career/`
- **Role**: Predicts top 3 career paths based on profile + skill gap
- **Output**: CareerPath records with match_score, salary_range, market_demand

### Agent 5: Roadmap Generator (Gemini — `gemini-2.0-flash`)
- **Endpoint**: `POST /api/ai/roadmap/`
- **Role**: Generates 12-week hyper-specific learning roadmap
- **Output**: Roadmap with phases, weekly plans, and tasks

### Agent 6: Weekly Task Generator (Gemini — `gemini-2.0-flash`)
- **Endpoint**: `POST /api/ai/tasks/generate/`
- **Role**: Generates personalized weekly tasks from skill gap data
- **Rules**: Every task must be specific (exact topics, exact problems, exact project specs)
- **Output**: 5-6 tasks per week with resource links and time estimates

### Agent 7: Performance Analyst (Gemini — `gemini-2.0-flash`)
- **Endpoint**: `POST /api/ai/analysis/`
- **Role**: Analyzes task logs → generates insights → recommends next week adjustments
- **Output**: overall_score, strengths, improvement_areas, difficulty_adjustment

---

## Core User Flow

```
Register → Assessment (Groq) → Profile Saved → Skill Gap (Adzuna+Gemini)
    → Career Prediction (Gemini) → Week 1 Tasks (Gemini) → Dashboard

Dashboard → Complete Tasks → Task Logs → Performance Analysis (Gemini)
    → Adaptive Next Week Tasks (Gemini) → Repeat
```

---

## Profile Completion Gate

- `profile_completion < 80%` → Tasks, Roadmap, Progress are locked
- Completion is calculated from 7 required fields:
  `name, profession, experience_level, education, current_status, availability, goal`
- Each field = ~14.3% completion

---

## Database Models

| Model | App | Purpose |
|-------|-----|---------|
| `User` | accounts | Custom user (email as USERNAME_FIELD) |
| `UserProfile` | accounts | Full profile with skills, goals, completion |
| `CareerPath` | accounts | AI-predicted career paths |
| `AssessmentAnswer` | assessment | Raw assessment Q&A storage |
| `SkillGapAnalysis` | dashboard | Adzuna + Gemini skill gap results |
| `Roadmap` | dashboard | 12-week career roadmap |
| `WeeklyPlan` | dashboard | Per-week plan with theme and goals |
| `Task` | dashboard | Individual learning/practice/project tasks |
| `TaskLog` | dashboard | Task completion logs with feedback |
| `ActivityLog` | dashboard | Daily activity for streak tracking |

---

## API Endpoints

### Auth
- `POST /api/auth/register/` — Register new user
- `POST /api/auth/login/` — Login, returns JWT tokens
- `POST /api/auth/logout/` — Blacklist refresh token
- `GET /api/auth/profile/` — Get full profile
- `PUT /api/auth/profile/update/` — Update profile
- `GET /api/auth/user/status/` — Check assessment + completion status
- `GET /api/user/status/` — Shortcut for user status

### AI Engine
- `POST /api/ai/assessment/chat/` — Groq assessment chatbot
- `POST /api/ai/profile/chat/` — Groq profile completion chatbot
- `POST /api/ai/skill-gap/` — Run Adzuna + Gemini skill gap
- `GET /api/ai/skill-gap/` — Get saved skill gap
- `GET /api/ai/market-skill-gap/` — Live Adzuna market data
- `POST /api/ai/career/` — Gemini career prediction
- `POST /api/ai/roadmap/` — Generate 12-week roadmap
- `GET /api/ai/roadmap/` — Get saved roadmap
- `POST /api/ai/tasks/generate/` — Generate weekly tasks
- `GET /api/ai/tasks/` — List tasks (filter by ?week=N)
- `PATCH /api/ai/tasks/<id>/` — Update task status
- `POST /api/ai/weekly-plan/` — Complete week, generate next
- `GET /api/ai/weekly-plan/` — Get weekly plans
- `POST /api/ai/analysis/` — Performance analysis

### Dashboard
- `GET /api/dashboard/` — Full dashboard data
- `GET /api/dashboard/stats/` — Lightweight stats
- `GET /api/dashboard/activity/` — Activity calendar data

### Assessment
- `POST /api/assessment/submit/` — Submit static assessment answers
