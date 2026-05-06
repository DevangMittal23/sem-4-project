import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from accounts.models import UserProfile, CareerPath
from accounts.serializers import CareerPathSerializer
from dashboard.models import Task, TaskLog, Roadmap, WeeklyPlan, SkillGapAnalysis
from dashboard.serializers import TaskSerializer, RoadmapSerializer, WeeklyPlanSerializer, SkillGapSerializer
from .groq_service import assessment_chat, profile_completion_chat, extract_profile_from_history
from .gemini_service import (
    predict_career, generate_full_roadmap, generate_next_week,
    analyze_performance, analyze_skill_gap, generate_weekly_tasks
)
from .search_service import get_market_data
from .adzuna_service import fetch_jobs, extract_skills, calculate_skill_gap, extract_salary_summary
from .workflow_service import run_post_assessment_pipeline

logger = logging.getLogger("ai_engine")

PROFILE_REQUIRED = ["name", "profession", "experience_level",
                    "education", "current_status", "availability", "goal"]

# Extended fields collected after required fields are done
PROFILE_EXTENDED = ["target_role", "risk_tolerance", "learning_style"]


class AssessmentChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        if profile.is_assessment_completed:
            return Response({"error": "Assessment already completed.", "is_assessment_completed": True},
                            status=status.HTTP_400_BAD_REQUEST)

        user_message = request.data.get("message", "")
        history      = request.data.get("history", [])
        result       = assessment_chat(history, user_message)

        pipeline_result = {}
        if result["is_complete"]:
            # Extract profile from conversation
            extracted = extract_profile_from_history(result["history"])
            logger.info("Assessment extraction for %s: %s",
                        request.user.email, {k: v for k, v in extracted.items() if v})

            # Run full pipeline: profile save → skill gap → career → tasks
            try:
                pipeline_result = run_post_assessment_pipeline(request.user, extracted)
                logger.info("Pipeline complete for %s: %s", request.user.email, pipeline_result)
            except Exception as e:
                logger.error("Pipeline error for %s: %s", request.user.email, e)
                # Fallback: at minimum mark assessment complete
                profile.is_assessment_completed = True
                profile.save()

            # Refresh profile_completion after pipeline
            profile.refresh_from_db()

        # Estimate mid-assessment progress based on conversation turns (profile not saved yet)
        # Assessment asks ~10 questions; each user turn ≈ 10% progress
        if not result["is_complete"]:
            user_turns = sum(1 for m in result["history"] if m.get("role") == "user")
            estimated_pct = min(95, user_turns * 10)
        else:
            estimated_pct = profile.profile_completion

        return Response({
            "reply":                   result["reply"],
            "is_complete":             result["is_complete"],
            "history":                 result["history"],
            "profile_completion":      estimated_pct,
            "is_assessment_completed": profile.is_assessment_completed,
            "pipeline":                pipeline_result,
        })


class ProfileChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        missing_required = [f for f in PROFILE_REQUIRED if not getattr(profile, f, "")]

        # After required fields done, collect extended goal-detail fields
        # For side_income goal, swap target_role with side_income_type
        extended_fields = list(PROFILE_EXTENDED)
        if profile.goal == "side_income":
            extended_fields = ["side_income_type", "risk_tolerance", "learning_style"]
        missing_extended = [f for f in extended_fields if not getattr(profile, f, "")]

        # All fields complete
        if not missing_required and not missing_extended:
            return Response({"message": "Profile complete.", "is_complete": True,
                             "profile_completion": profile.profile_completion})

        # Determine which fields to ask about next
        missing = missing_required if missing_required else missing_extended

        user_message = request.data.get("message", "")
        history = request.data.get("history", [])
        result = profile_completion_chat(missing, history, user_message)

        if result.get("collected"):
            changed = False
            for field, value in result["collected"].items():
                if hasattr(profile, field) and value:
                    setattr(profile, field, value)
                    changed = True
            if changed:
                profile.save()
                logger.info("Profile fields saved for %s: %s (%d%%)",
                            request.user.email, list(result["collected"].keys()), profile.profile_completion)

        # is_complete only when both required AND extended are done
        all_required_done = not [f for f in PROFILE_REQUIRED if not getattr(profile, f, "")]
        all_extended_done = not [f for f in extended_fields if not getattr(profile, f, "")]
        is_complete = all_required_done and all_extended_done

        return Response({
            "reply": result["reply"],
            "is_complete": is_complete,
            "history": result["history"],
            "missing_fields": missing,
            "profile_completion": profile.profile_completion,
        })


class SkillGapAnalysisView(APIView):
    """Full skill gap analysis: Adzuna real jobs → Gemini reasoning."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            gap = SkillGapAnalysis.objects.get(user=request.user)
            return Response(SkillGapSerializer(gap).data)
        except SkillGapAnalysis.DoesNotExist:
            return Response({"detail": "No analysis yet."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        role = profile.target_role or profile.preferred_domain or profile.profession or "Software Engineer"

        # 1. Fetch real jobs from Adzuna
        jobs = fetch_jobs(role, results=20)

        # 2. Extract market skill demand + salary from real job descriptions
        adzuna_market_skills = extract_skills(jobs) if jobs else []
        adzuna_salary        = extract_salary_summary(jobs) if jobs else {}
        user_gap             = calculate_skill_gap(profile.skills or [], adzuna_market_skills)

        # 3. Build market_data dict for Gemini
        market_data = {
            "adzuna_market_skills": adzuna_market_skills[:20],
            "adzuna_salary":        adzuna_salary,
            "adzuna_jobs_count":    len(jobs),
            "role_searched":        role,
        }

        # 4. Gemini reasons over Adzuna data + profile
        analysis = analyze_skill_gap(profile, market_data)

        # 5. Merge Adzuna salary if Gemini didn't populate it
        if adzuna_salary and not analysis.get("job_market_data", {}).get("avg_salary_current"):
            jmd = analysis.setdefault("job_market_data", {})
            jmd["avg_salary_current"] = adzuna_salary.get("formatted", "")

        # 6. Save — including full raw Adzuna data
        gap, _ = SkillGapAnalysis.objects.update_or_create(
            user=request.user,
            defaults={
                "current_skills":      profile.skills,
                "required_skills":     [g["skill"] for g in analysis.get("gap_skills", [])],
                "gap_skills":          analysis.get("gap_skills", []),
                "market_insights":     analysis.get("market_insights", []),
                "job_market_data":     analysis.get("job_market_data", {}),
                "recommendations":     analysis.get("recommendations", []),
                "career_options":      analysis.get("career_options", []),
                # Raw Adzuna data
                "adzuna_jobs":         jobs[:10],           # store top 10 listings
                "adzuna_market_skills": adzuna_market_skills,
                "adzuna_salary":       adzuna_salary,
                "adzuna_role_searched": role,
                "adzuna_jobs_count":   len(jobs),
            }
        )

        logger.info("Skill gap (Adzuna+Gemini) for %s | role=%s | jobs=%d | market_skills=%d",
                    request.user.email, role, len(jobs), len(adzuna_market_skills))
        return Response(SkillGapSerializer(gap).data)


class CareerPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return existing career paths without regenerating."""
        paths = CareerPath.objects.filter(user=request.user)
        return Response(CareerPathSerializer(paths, many=True).data)

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        careers = predict_career(profile)
        CareerPath.objects.filter(user=request.user).delete()
        saved = [CareerPath.objects.create(
            user=request.user,
            title=c.get("title", ""),
            description=c.get("description", ""),
            required_skills=c.get("required_skills", []),
            match_score=c.get("match_score", 0),
            salary_range=c.get("salary_range", ""),
            market_demand=c.get("market_demand", ""),
        ) for c in careers]
        return Response(CareerPathSerializer(saved, many=True).data)


class RoadmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            roadmap = Roadmap.objects.get(user=request.user)
            return Response(RoadmapSerializer(roadmap).data)
        except Roadmap.DoesNotExist:
            return Response({"detail": "No roadmap yet."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        career_title = request.data.get("career_title",
                                        profile.target_role or profile.preferred_domain or "Software Engineer")

        # Get skill gap (already enriched with Adzuna data)
        try:
            gap = SkillGapAnalysis.objects.get(user=request.user)
            skill_gap = {
                "gap_skills":      gap.gap_skills,
                "market_insights": gap.market_insights,
                "job_market_data": gap.job_market_data,
            }
        except SkillGapAnalysis.DoesNotExist:
            # Run fresh Adzuna fetch if no gap analysis exists
            jobs = fetch_jobs(career_title, results=15)
            adzuna_skills = extract_skills(jobs) if jobs else []
            skill_gap = {"gap_skills": [{"skill": s["skill"], "priority": "high", "estimated_weeks": 2, "reason": "Market demand"} for s in adzuna_skills[:8]]}

        roadmap_data = generate_full_roadmap(profile, career_title, skill_gap)

        roadmap, _ = Roadmap.objects.update_or_create(
            user=request.user,
            defaults={
                "career_title": career_title,
                "total_weeks":  roadmap_data.get("total_weeks", 12),
                "current_week": 1,
                "phases":       roadmap_data.get("phases", []),
                "is_active":    True,
            }
        )

        self._create_week_tasks(request.user, roadmap, roadmap_data, week_number=1)

        logger.info("Roadmap generated for %s → %s", request.user.email, career_title)
        return Response(RoadmapSerializer(roadmap).data)

    def _create_week_tasks(self, user, roadmap, roadmap_data, week_number):
        """Extract and save tasks for a specific week from roadmap data."""
        for phase in roadmap_data.get("phases", []):
            for wp in phase.get("weekly_plans", []):
                if wp.get("week") == week_number:
                    plan, _ = WeeklyPlan.objects.update_or_create(
                        roadmap=roadmap, week_number=week_number,
                        defaults={
                            "user": user,
                            "theme": wp.get("theme", f"Week {week_number}"),
                            "goals": wp.get("goals", []),
                            "is_current": True,
                        }
                    )
                    Task.objects.filter(user=user, week_number=week_number).delete()
                    for t in wp.get("tasks", []):
                        Task.objects.create(
                            user=user, weekly_plan=plan,
                            title=t.get("title", ""),
                            description=t.get("description", ""),
                            tag=t.get("tag", ""),
                            difficulty=t.get("difficulty", "medium"),
                            estimated_time=t.get("estimated_time", ""),
                            resource_url=t.get("resource_url", ""),
                            week_number=week_number,
                            order=t.get("order", 0),
                        )
                    return


class WeeklyPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        week = request.query_params.get("week")
        qs = WeeklyPlan.objects.filter(user=request.user)
        if week:
            qs = qs.filter(week_number=week)
        return Response(WeeklyPlanSerializer(qs, many=True).data)

    def post(self, request):
        """Complete current week and generate next week adaptively."""
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        try:
            roadmap = Roadmap.objects.get(user=request.user)
        except Roadmap.DoesNotExist:
            return Response({"error": "No roadmap found."}, status=status.HTTP_404_NOT_FOUND)

        current_week = roadmap.current_week
        tasks = Task.objects.filter(user=request.user, week_number=current_week)
        task_data = [{"title": t.title, "status": t.status, "difficulty": t.difficulty} for t in tasks]

        logs = TaskLog.objects.filter(user=request.user, task__week_number=current_week)
        log_data = [{"difficulty_feedback": l.difficulty_feedback, "time_taken": l.time_taken} for l in logs]

        # Mark current week complete
        WeeklyPlan.objects.filter(user=request.user, week_number=current_week).update(
            is_completed=True, is_current=False,
            completion_pct=int(len([t for t in task_data if t["status"] == "done"]) / max(len(task_data), 1) * 100)
        )

        # Generate next week
        next_week_num = current_week + 1
        if next_week_num > roadmap.total_weeks:
            return Response({"message": "Roadmap complete! 🎉", "roadmap_complete": True})

        next_week_data = generate_next_week(
            profile, {"title": roadmap.career_title, "phases": roadmap.phases},
            current_week, task_data, log_data
        )

        # Save next week plan and tasks
        plan, _ = WeeklyPlan.objects.update_or_create(
            roadmap=roadmap, week_number=next_week_num,
            defaults={
                "user": request.user,
                "theme": next_week_data.get("theme", f"Week {next_week_num}"),
                "goals": next_week_data.get("goals", []),
                "is_current": True,
                "ai_feedback": next_week_data.get("adaptation_note", ""),
            }
        )
        Task.objects.filter(user=request.user, week_number=next_week_num).delete()
        for t in next_week_data.get("tasks", []):
            Task.objects.create(
                user=request.user, weekly_plan=plan,
                title=t.get("title", ""), description=t.get("description", ""),
                tag=t.get("tag", ""), difficulty=t.get("difficulty", "medium"),
                estimated_time=t.get("estimated_time", ""),
                resource_url=t.get("resource_url", ""),
                week_number=next_week_num, order=t.get("order", 0),
            )

        roadmap.current_week = next_week_num
        roadmap.save()

        logger.info("Week %d → %d for %s", current_week, next_week_num, request.user.email)
        return Response({
            "message": f"Week {next_week_num} plan generated!",
            "adaptation_note": next_week_data.get("adaptation_note", ""),
            "week": WeeklyPlanSerializer(plan).data,
        })


class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        week = request.query_params.get("week")
        qs = Task.objects.filter(user=request.user)
        if week:
            qs = qs.filter(week_number=week)
        return Response(TaskSerializer(qs, many=True).data)


class TaskUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            task = Task.objects.get(pk=pk, user=request.user)
        except Task.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        old_status = task.status
        new_status = request.data.get("status")
        if new_status:
            task.status = new_status
            task.save()

            if new_status == "done" and old_status != "done":
                TaskLog.objects.update_or_create(
                    task=task, user=request.user,
                    defaults={
                        "time_taken": request.data.get("time_taken"),
                        "difficulty_feedback": request.data.get("difficulty_feedback", "just_right"),
                        "notes": request.data.get("notes", ""),
                    }
                )
                if task.weekly_plan:
                    plan = task.weekly_plan
                    all_tasks = Task.objects.filter(weekly_plan=plan)
                    done = all_tasks.filter(status="done").count()
                    plan.completion_pct = int(done / max(all_tasks.count(), 1) * 100)
                    plan.save()
                # Record daily activity for streak tracking
                from dashboard.views import _record_activity, XP_MAP
                xp = XP_MAP.get(task.difficulty, 10)
                _record_activity(request.user, tasks_completed=1, xp=xp)

        return Response(TaskSerializer(task).data)


class PerformanceAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        logs = TaskLog.objects.filter(user=request.user).select_related("task").order_by("-created_at")[:20]
        logs_data = [{"task": l.task.title, "difficulty": l.task.difficulty,
                      "time_taken": l.time_taken, "difficulty_feedback": l.difficulty_feedback} for l in logs]
        analysis = analyze_performance(profile, logs_data)
        return Response(analysis)


class MarketSkillGapView(APIView):
    """
    GET /api/ai/market-skill-gap/?role=AI+Engineer

    Fetches live jobs from Adzuna, extracts skill demand,
    compares against the authenticated user's profile skills,
    and returns a full skill gap report.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        # Role: query param → profile target_role → preferred_domain → profession → fallback
        role = (
            request.query_params.get("role")
            or profile.target_role
            or profile.preferred_domain
            or profile.profession
            or "Software Engineer"
        ).strip()

        # 1. Fetch jobs
        jobs = fetch_jobs(role, results=20)
        if not jobs:
            return Response(
                {"error": "Could not fetch job data. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # 2. Extract market skill demand
        market_skills = extract_skills(jobs)

        # 3. Skill gap vs user profile
        user_skills = profile.skills or []
        gap = calculate_skill_gap(user_skills, market_skills)

        # 4. Salary summary
        salary = extract_salary_summary(jobs)

        logger.info(
            "Market skill gap for %s | role='%s' | jobs=%d | market_skills=%d | missing=%d",
            request.user.email, role, len(jobs),
            len(market_skills), len(gap["missing_skills"]),
        )

        return Response({
            "role":           role,
            "jobs_analysed":  len(jobs),
            "market_skills":  market_skills,
            "user_skills":    user_skills,
            "missing_skills": gap["missing_skills"],
            "strengths":      gap["strengths"],
            "salary_summary": salary,
        })


class TaskGenerateView(APIView):
    """
    POST /api/ai/tasks/generate/

    Full pipeline:
      1. Load profile + existing skill gap (or run Adzuna if missing)
      2. Call Gemini generate_weekly_tasks
      3. Save tasks to DB under a WeeklyPlan
      4. Return saved tasks

    Idempotent: calling again for the same week regenerates tasks.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        if profile.profile_completion < 80:
            return Response(
                {"error": "Complete your profile (80%+) before generating tasks."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        week_number = int(request.data.get("week_number", 1))

        # ── 1. Get or build skill gap ─────────────────────────────────────────
        try:
            gap_obj = SkillGapAnalysis.objects.get(user=request.user)
            skill_gap = {
                "gap_skills":      gap_obj.gap_skills,
                "market_insights": gap_obj.market_insights,
                "job_market_data": gap_obj.job_market_data,
            }
        except SkillGapAnalysis.DoesNotExist:
            # Auto-run Adzuna + Gemini skill gap if not done yet
            role   = profile.target_role or profile.preferred_domain or profile.profession or "Software Engineer"
            jobs   = fetch_jobs(role, results=20)
            adzuna = extract_skills(jobs) if jobs else []
            salary = extract_salary_summary(jobs) if jobs else {}
            market_data = {
                "adzuna_market_skills": adzuna,
                "adzuna_salary":        salary,
                "adzuna_jobs_count":    len(jobs),
                "role_searched":        role,
            }
            analysis = analyze_skill_gap(profile, market_data)
            gap_obj, _ = SkillGapAnalysis.objects.update_or_create(
                user=request.user,
                defaults={
                    "current_skills":  profile.skills,
                    "required_skills": [g["skill"] for g in analysis.get("gap_skills", [])],
                    "gap_skills":      analysis.get("gap_skills", []),
                    "market_insights": analysis.get("market_insights", []),
                    "job_market_data": analysis.get("job_market_data", {}),
                    "recommendations": analysis.get("recommendations", []),
                    "career_options":  analysis.get("career_options", []),
                }
            )
            skill_gap = {
                "gap_skills":      gap_obj.gap_skills,
                "market_insights": gap_obj.market_insights,
                "job_market_data": gap_obj.job_market_data,
            }

        # ── 2. Generate tasks via Gemini ──────────────────────────────────────
        week_data = generate_weekly_tasks(profile, skill_gap, week_number)

        # ── 3. Get or create roadmap stub ─────────────────────────────────────
        career_title = (
            profile.target_role
            or profile.preferred_domain
            or profile.profession
            or "Career Development"
        )
        roadmap, _ = Roadmap.objects.get_or_create(
            user=request.user,
            defaults={
                "career_title": career_title,
                "total_weeks":  12,
                "current_week": week_number,
                "phases":       [],
                "is_active":    True,
            },
        )

        # ── 4. Create / replace WeeklyPlan for this week ──────────────────────
        WeeklyPlan.objects.filter(user=request.user, week_number=week_number).update(
            is_current=False
        )
        plan, _ = WeeklyPlan.objects.update_or_create(
            roadmap=roadmap,
            week_number=week_number,
            defaults={
                "user":       request.user,
                "theme":      week_data.get("theme", f"Week {week_number}"),
                "goals":      week_data.get("goals", []),
                "is_current": True,
            },
        )

        # ── 5. Delete old tasks for this week and save new ones ───────────────
        Task.objects.filter(user=request.user, week_number=week_number).delete()
        saved = []
        for t in week_data.get("tasks", []):
            obj = Task.objects.create(
                user=request.user,
                weekly_plan=plan,
                title=t.get("title", ""),
                description=t.get("description", ""),
                tag=t.get("tag", "Learning"),
                difficulty=t.get("difficulty", "medium"),
                estimated_time=t.get("estimated_time", ""),
                resource_url=t.get("resource_url", ""),
                target_skill=t.get("target_skill", ""),
                why_assigned=t.get("why_assigned", ""),
                week_number=week_number,
                order=t.get("order", 0),
            )
            saved.append(obj)

        # Update roadmap current week if needed
        if roadmap.current_week < week_number:
            roadmap.current_week = week_number
            roadmap.save()

        logger.info(
            "Tasks generated for %s | week=%d | count=%d | gap_skills=%s",
            request.user.email, week_number, len(saved),
            [g.get("skill") for g in skill_gap.get("gap_skills", [])[:3]],
        )

        from dashboard.serializers import TaskSerializer as TS, WeeklyPlanSerializer as WPS
        return Response({
            "week":   week_number,
            "theme":  week_data.get("theme"),
            "goals":  week_data.get("goals", []),
            "tasks":  TS(saved, many=True).data,
            "plan":   WPS(plan).data,
        }, status=status.HTTP_201_CREATED)
