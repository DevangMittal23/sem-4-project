import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from accounts.models import UserProfile, CareerPath
from accounts.serializers import CareerPathSerializer
from dashboard.models import Task, TaskLog
from dashboard.serializers import TaskSerializer
from .groq_service import assessment_chat, profile_completion_chat, extract_profile_from_history
from .gemini_service import predict_career, generate_roadmap, generate_tasks, analyze_performance

logger = logging.getLogger("ai_engine")

PROFILE_REQUIRED = ["name", "profession", "thinking_style", "preferred_domain",
                    "education", "current_status", "availability", "goal", "experience_level"]


class AssessmentChatView(APIView):
    """Groq-powered assessment chatbot — drives the initial onboarding interview."""
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
            # Extract profile from full conversation
            extracted = extract_profile_from_history(result["history"])
            if extracted:
                for field, value in extracted.items():
                    if hasattr(profile, field) and value:
                        setattr(profile, field, value)
                profile.is_assessment_completed = True
                profile.save()
                logger.info("Assessment completed via Groq for %s", request.user.email)

        return Response({
            "reply": result["reply"],
            "is_complete": result["is_complete"],
            "history": result["history"],
            "profile_completion": profile.profile_completion,
        })


class ProfileChatView(APIView):
    """Groq-powered chatbot for filling missing profile fields."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        missing = [f for f in PROFILE_REQUIRED if not getattr(profile, f, "")]
        if not missing:
            return Response({"message": "Profile is already complete.", "is_complete": True})

        user_message = request.data.get("message", "")
        history = request.data.get("history", [])

        result = profile_completion_chat(missing, history, user_message)

        if result["is_complete"] and result.get("collected"):
            for field, value in result["collected"].items():
                if hasattr(profile, field) and value:
                    setattr(profile, field, value)
            profile.save()
            logger.info("Profile completed via chat for %s", request.user.email)

        return Response({
            "reply": result["reply"],
            "is_complete": result["is_complete"],
            "history": result["history"],
            "missing_fields": missing,
            "profile_completion": profile.profile_completion,
        })


class CareerPredictionView(APIView):
    """Gemini-powered career path prediction."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        careers = predict_career(profile)

        # Save to DB
        CareerPath.objects.filter(user=request.user).delete()
        saved = []
        for c in careers:
            obj = CareerPath.objects.create(
                user=request.user,
                title=c.get("title", ""),
                description=c.get("description", ""),
                required_skills=c.get("required_skills", []),
                match_score=c.get("match_score", 0),
            )
            saved.append(obj)

        logger.info("Career paths generated for %s", request.user.email)
        return Response(CareerPathSerializer(saved, many=True).data)


class RoadmapGenerationView(APIView):
    """Gemini-powered roadmap generation."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        career_title = request.data.get("career_title", profile.preferred_domain or "Software Engineer")

        roadmap = generate_roadmap(profile, career_title)
        logger.info("Roadmap generated for %s → %s", request.user.email, career_title)
        return Response(roadmap)


class TaskGenerationView(APIView):
    """Gemini-powered task generation for a specific week."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        week_number = int(request.data.get("week_number", 1))
        roadmap = request.data.get("roadmap", {})

        tasks_data = generate_tasks(profile, roadmap, week_number)

        # Save tasks to DB
        Task.objects.filter(user=request.user, week_number=week_number).delete()
        saved = []
        for t in tasks_data:
            obj = Task.objects.create(
                user=request.user,
                title=t.get("title", ""),
                description=t.get("description", ""),
                difficulty=t.get("difficulty", "medium"),
                estimated_time=t.get("estimated_time", ""),
                tag=t.get("tag", ""),
                week_number=week_number,
            )
            saved.append(obj)

        logger.info("Tasks generated for %s week %d", request.user.email, week_number)
        return Response(TaskSerializer(saved, many=True).data)


class PerformanceAnalysisView(APIView):
    """Gemini-powered performance analysis."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        logs = TaskLog.objects.filter(user=request.user).select_related("task").order_by("-created_at")[:20]
        logs_data = [
            {
                "task": log.task.title,
                "difficulty": log.task.difficulty,
                "time_taken": log.time_taken,
                "estimated_time": log.task.estimated_time,
                "difficulty_feedback": log.difficulty_feedback,
                "notes": log.notes,
            }
            for log in logs
        ]

        analysis = analyze_performance(profile, logs_data)
        logger.info("Performance analysis for %s", request.user.email)
        return Response(analysis)
