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
    analyze_performance, analyze_skill_gap
)
from .search_service import get_market_data

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
        history = request.data.get("history", [])
        result = assessment_chat(history, user_message)

        if result["is_complete"]:
            extracted = extract_profile_from_history(result["history"])
            if extracted:
                for field, value in extracted.items():
                    if hasattr(profile, field) and value:
                        setattr(profile, field, value)
            profile.is_assessment_completed = True
            profile.save()
            logger.info("Assessment completed for %s", request.user.email)

        return Response({
            "reply": result["reply"],
            "is_complete": result["is_complete"],
            "history": result["history"],
            "profile_completion": profile.profile_completion,
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
    """Full skill gap analysis with market data."""
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
        domain = profile.preferred_domain or profile.profession or "Technology"

        # Fetch live market data
        market_data = get_market_data(role, domain, profile.goal)

        # Run Gemini analysis
        analysis = analyze_skill_gap(profile, market_data)

        # Save to DB
        gap, _ = SkillGapAnalysis.objects.update_or_create(
            user=request.user,
            defaults={
                "current_skills": profile.skills,
                "required_skills": [g["skill"] for g in analysis.get("gap_skills", [])],
                "gap_skills": analysis.get("gap_skills", []),
                "market_insights": analysis.get("market_insights", []),
                "job_market_data": analysis.get("job_market_data", {}),
                "recommendations": analysis.get("recommendations", []),
                "career_options": analysis.get("career_options", []),
            }
        )

        logger.info("Skill gap analysis done for %s", request.user.email)
        return Response(SkillGapSerializer(gap).data)


class CareerPredictionView(APIView):
    permission_classes = [IsAuthenticated]

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

        # Get skill gap for context
        try:
            gap = SkillGapAnalysis.objects.get(user=request.user)
            skill_gap = {"gap_skills": gap.gap_skills, "market_insights": gap.market_insights}
        except SkillGapAnalysis.DoesNotExist:
            skill_gap = {}

        roadmap_data = generate_full_roadmap(profile, career_title, skill_gap)

        # Save roadmap
        roadmap, _ = Roadmap.objects.update_or_create(
            user=request.user,
            defaults={
                "career_title": career_title,
                "total_weeks": roadmap_data.get("total_weeks", 12),
                "current_week": 1,
                "phases": roadmap_data.get("phases", []),
                "is_active": True,
            }
        )

        # Create WeeklyPlans and Tasks for week 1
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

        new_status = request.data.get("status")
        if new_status:
            task.status = new_status
            task.save()

            # Create task log if completing
            if new_status == "done":
                TaskLog.objects.update_or_create(
                    task=task, user=request.user,
                    defaults={
                        "time_taken": request.data.get("time_taken"),
                        "difficulty_feedback": request.data.get("difficulty_feedback", "just_right"),
                        "notes": request.data.get("notes", ""),
                    }
                )
                # Update weekly plan completion %
                if task.weekly_plan:
                    plan = task.weekly_plan
                    all_tasks = Task.objects.filter(weekly_plan=plan)
                    done = all_tasks.filter(status="done").count()
                    plan.completion_pct = int(done / max(all_tasks.count(), 1) * 100)
                    plan.save()

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
