import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from accounts.models import UserProfile
from accounts.serializers import ProfileSerializer
from .models import Task
from .serializers import TaskSerializer, predict_career, generate_insights

logger = logging.getLogger("dashboard")

MOCK_TASKS = [
    {"title": "Complete Python basics module", "tag": "Learning", "status": "done", "estimated_time": "45 min", "difficulty": "easy"},
    {"title": "Solve 2 LeetCode easy problems", "tag": "Practice", "status": "done", "estimated_time": "30 min", "difficulty": "easy"},
    {"title": "Read about system design basics", "tag": "Reading", "status": "pending", "estimated_time": "20 min", "difficulty": "medium"},
    {"title": "Update LinkedIn profile summary", "tag": "Career", "status": "pending", "estimated_time": "15 min", "difficulty": "easy"},
]


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        # Tasks — use DB tasks if exist, else mock
        db_tasks = Task.objects.filter(user=request.user, week_number=1)
        if db_tasks.exists():
            tasks = TaskSerializer(db_tasks, many=True).data
        else:
            tasks = MOCK_TASKS

        done_count = sum(1 for t in tasks if t.get("status") == "done")
        career_prediction = predict_career(profile)
        insights = generate_insights(profile)

        logger.info("Dashboard loaded for %s", request.user.email)

        return Response({
            "user": {
                "id": request.user.id,
                "email": request.user.email,
                "username": request.user.username,
                "name": profile.name or request.user.username,
            },
            "profile": ProfileSerializer(profile).data,
            "profile_completion": profile.profile_completion,
            "is_assessment_completed": profile.is_assessment_completed,
            "career_prediction": career_prediction,
            "insights": insights,
            "tasks": tasks,
            "stats": {
                "tasks_done": done_count,
                "tasks_total": len(tasks),
                "streak_days": 3,          # placeholder — extend with activity tracking
                "ai_score": 74,            # placeholder — extend with scoring engine
            },
        })


class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        week = request.query_params.get("week")
        qs = Task.objects.filter(user=request.user)
        if week:
            qs = qs.filter(week_number=week)
        return Response(TaskSerializer(qs, many=True).data)

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_task(self, pk, user):
        try:
            return Task.objects.get(pk=pk, user=user)
        except Task.DoesNotExist:
            return None

    def get(self, request, pk):
        task = self._get_task(pk, request.user)
        if not task:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TaskSerializer(task).data)

    def patch(self, request, pk):
        task = self._get_task(pk, request.user)
        if not task:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        task = self._get_task(pk, request.user)
        if not task:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
