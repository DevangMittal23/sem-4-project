import logging
from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from accounts.models import UserProfile
from accounts.serializers import ProfileSerializer
from .models import Task, TaskLog, Roadmap, WeeklyPlan, ActivityLog
from .serializers import TaskSerializer, generate_insights

logger = logging.getLogger("dashboard")

# ── XP values per task difficulty ─────────────────────────────────────────────
XP_MAP = {"easy": 10, "medium": 20, "hard": 35}


def _record_activity(user, tasks_completed: int, xp: int):
    """Upsert today's ActivityLog entry."""
    today = timezone.now().date()
    log, created = ActivityLog.objects.get_or_create(user=user, date=today)
    if not created:
        log.tasks_completed += tasks_completed
        log.xp_earned += xp
    else:
        log.tasks_completed = tasks_completed
        log.xp_earned = xp
    log.save()
    return log


def _compute_streak(user) -> int:
    """Count consecutive days with at least 1 task completed, ending today or yesterday."""
    today = timezone.now().date()
    logs = set(
        ActivityLog.objects.filter(user=user, tasks_completed__gt=0)
        .values_list("date", flat=True)
    )
    if not logs:
        return 0

    # Start from today; if today has no activity, start from yesterday
    check = today if today in logs else today - timedelta(days=1)
    if check not in logs:
        return 0

    streak = 0
    while check in logs:
        streak += 1
        check -= timedelta(days=1)
    return streak


def _compute_ai_score(user, profile) -> int:
    """
    Score 0-100 based on:
    - Profile completion (30 pts max)
    - Task completion rate (40 pts max)
    - Streak (20 pts max)
    - Skill gap addressed (10 pts max)
    """
    score = 0

    # Profile (30 pts)
    score += int(profile.profile_completion * 0.30)

    # Task completion rate (40 pts)
    total = Task.objects.filter(user=user).count()
    done = Task.objects.filter(user=user, status="done").count()
    if total > 0:
        score += int((done / total) * 40)

    # Streak (20 pts — capped at 14 days = full 20)
    streak = _compute_streak(user)
    score += min(20, int(streak / 14 * 20))

    # Skills filled (10 pts)
    if profile.skills:
        score += min(10, len(profile.skills) * 2)

    return min(100, score)


def _get_activity_grid(user, weeks: int = 5) -> list[dict]:
    """
    Return a list of {date, tasks_completed, xp_earned} for the last `weeks` weeks.
    Used by the frontend to render the GitHub-style calendar.
    """
    today = timezone.now().date()
    # Align to Monday of the current week
    monday = today - timedelta(days=today.weekday())
    start = monday - timedelta(weeks=weeks - 1)

    logs = {
        log.date: {"tasks": log.tasks_completed, "xp": log.xp_earned}
        for log in ActivityLog.objects.filter(user=user, date__gte=start)
    }

    grid = []
    current = start
    while current <= today:
        entry = logs.get(current, {"tasks": 0, "xp": 0})
        grid.append({
            "date": current.isoformat(),
            "tasks_completed": entry["tasks"],
            "xp_earned": entry["xp"],
            "is_future": False,
        })
        current += timedelta(days=1)

    # Pad to end of current week (Sunday)
    while current.weekday() != 0:  # until next Monday
        grid.append({"date": current.isoformat(), "tasks_completed": 0, "xp_earned": 0, "is_future": True})
        current += timedelta(days=1)

    return grid


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        # Real tasks — current week
        try:
            roadmap = Roadmap.objects.get(user=request.user)
            current_week = roadmap.current_week
            career_title = roadmap.career_title
            roadmap_pct = _roadmap_progress(request.user, roadmap)
        except Roadmap.DoesNotExist:
            current_week = 1
            career_title = None
            roadmap_pct = 0

        tasks_qs = Task.objects.filter(user=request.user, week_number=current_week)
        tasks_data = TaskSerializer(tasks_qs, many=True).data

        total_tasks = Task.objects.filter(user=request.user).count()
        done_tasks = Task.objects.filter(user=request.user, status="done").count()

        streak = _compute_streak(request.user)
        ai_score = _compute_ai_score(request.user, profile)
        total_xp = ActivityLog.objects.filter(user=request.user).aggregate(
            total=Sum("xp_earned")
        )["total"] or 0

        insights = generate_insights(profile)

        logger.info("Dashboard loaded for %s | streak=%d | score=%d", request.user.email, streak, ai_score)

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
            "insights": insights,
            "tasks": list(tasks_data)[:4],
            "stats": {
                "streak_days": streak,
                "tasks_done": done_tasks,
                "tasks_total": total_tasks,
                "ai_score": ai_score,
                "total_xp": total_xp,
                "roadmap_pct": roadmap_pct,
                "career_title": career_title,
                "current_week": current_week,
            },
        })


def _roadmap_progress(user, roadmap) -> int:
    total = Task.objects.filter(user=user).count()
    done = Task.objects.filter(user=user, status="done").count()
    if total == 0:
        return 0
    return round((done / total) * 100)


class DashboardStatsView(APIView):
    """Lightweight stats-only endpoint — called on every dashboard load."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        try:
            roadmap = Roadmap.objects.get(user=request.user)
            current_week = roadmap.current_week
            total_weeks = roadmap.total_weeks
            career_title = roadmap.career_title
        except Roadmap.DoesNotExist:
            current_week = 1
            total_weeks = 12
            career_title = None

        total_tasks = Task.objects.filter(user=request.user).count()
        done_tasks = Task.objects.filter(user=request.user, status="done").count()
        week_tasks = Task.objects.filter(user=request.user, week_number=current_week).count()
        week_done = Task.objects.filter(user=request.user, week_number=current_week, status="done").count()

        streak = _compute_streak(request.user)
        ai_score = _compute_ai_score(request.user, profile)

        total_xp = ActivityLog.objects.filter(user=request.user).aggregate(
            total=Sum("xp_earned")
        )["total"] or 0

        completed_weeks = WeeklyPlan.objects.filter(user=request.user, is_completed=True).count()

        return Response({
            "streak_days": streak,
            "ai_score": ai_score,
            "total_xp": total_xp,
            "tasks_done": done_tasks,
            "tasks_total": total_tasks,
            "week_tasks_done": week_done,
            "week_tasks_total": week_tasks,
            "completed_weeks": completed_weeks,
            "current_week": current_week,
            "total_weeks": total_weeks,
            "career_title": career_title,
            "profile_completion": profile.profile_completion,
            "roadmap_pct": round((done_tasks / max(total_tasks, 1)) * 100) if total_tasks > 0 else 0,
        })


class ActivityLogView(APIView):
    """Returns activity grid for the GitHub-style calendar."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        weeks = int(request.query_params.get("weeks", 5))
        grid = _get_activity_grid(request.user, weeks=min(weeks, 26))
        streak = _compute_streak(request.user)
        total_active_days = ActivityLog.objects.filter(
            user=request.user, tasks_completed__gt=0
        ).count()
        return Response({
            "grid": grid,
            "streak_days": streak,
            "total_active_days": total_active_days,
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

        old_status = task.status
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()

        # Record activity when a task is marked done
        new_status = request.data.get("status")
        if new_status == "done" and old_status != "done":
            xp = XP_MAP.get(task.difficulty, 10)
            _record_activity(request.user, tasks_completed=1, xp=xp)

        return Response(serializer.data)

    def delete(self, request, pk):
        task = self._get_task(pk, request.user)
        if not task:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
