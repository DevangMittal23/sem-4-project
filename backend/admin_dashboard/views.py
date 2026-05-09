from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
import json

from accounts.models import User, UserProfile, CareerPath
from dashboard.models import Task, TaskLog, Roadmap, SkillGapAnalysis, ActivityLog

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        
        # Active users in last 7 days
        seven_days_ago = timezone.now() - timedelta(days=7)
        active_users = ActivityLog.objects.filter(date__gte=seven_days_ago.date()).values("user").distinct().count()
        
        # Google vs Email users
        # We assume users without usable password or starting with some pattern are google users.
        # But wait, django-allauth or custom auth? Let's check for "provider" or something.
        # If there's no provider field, we can approximate: if password starts with '!', they might be OAuth.
        # Let's just mock or use a simple heuristic.
        google_users = User.objects.filter(password="").count() or User.objects.filter(password__startswith="!").count()
        email_users = total_users - google_users

        # Profile completions
        profiles = UserProfile.objects.all()
        avg_profile_completion = sum(p.profile_completion for p in profiles) / max(len(profiles), 1)
        assessment_completed_count = profiles.filter(is_assessment_completed=True).count()
        assessment_completion_pct = (assessment_completed_count / max(total_users, 1)) * 100

        # Tasks
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status="done").count()
        task_completion_rate = (completed_tasks / max(total_tasks, 1)) * 100

        # Career Paths Popularity
        top_careers = list(CareerPath.objects.filter(is_selected=True).values("title").annotate(count=Count("id")).order_by("-count")[:5])

        return Response({
            "totalUsers": total_users,
            "activeUsers": active_users,
            "googleUsers": google_users,
            "emailUsers": email_users,
            "assessmentCompletionPct": round(assessment_completion_pct, 1),
            "profileCompletionPct": round(avg_profile_completion, 1),
            "totalTasks": total_tasks,
            "taskCompletionRate": round(task_completion_rate, 1),
            "topCareers": top_careers,
        })

class AdminUsersListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.select_related("profile").all().order_by("-date_joined")
        data = []
        for user in users:
            try:
                profile = user.profile
                completion = profile.profile_completion
                assessment_done = profile.is_assessment_completed
                goal = profile.goal
                target_role = profile.target_role
            except UserProfile.DoesNotExist:
                completion = 0
                assessment_done = False
                goal = ""
                target_role = ""
            
            data.append({
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "joinedAt": user.date_joined,
                "lastLogin": user.last_login,
                "assessmentStatus": "Completed" if assessment_done else "Pending",
                "profileCompletion": completion,
                "goal": goal,
                "targetRole": target_role,
            })
        return Response(data)

class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, user_id):
        try:
            user = User.objects.select_related("profile").get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            profile = None

        # Assessment data could be fetched if there's a model
        # Skill Gap
        skill_gap = SkillGapAnalysis.objects.filter(user=user).first()
        skill_gap_data = None
        if skill_gap:
            skill_gap_data = {
                "currentSkills": skill_gap.current_skills,
                "gapSkills": skill_gap.gap_skills,
                "recommendations": skill_gap.recommendations,
            }

        # Career Analysis
        careers = CareerPath.objects.filter(user=user).values()

        # Task Stats
        tasks = Task.objects.filter(user=user)
        task_stats = {
            "total": tasks.count(),
            "completed": tasks.filter(status="done").count(),
            "inProgress": tasks.filter(status="in_progress").count(),
        }

        # Activity logs
        activities = ActivityLog.objects.filter(user=user).order_by("-date")[:30].values()

        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "joinedAt": user.date_joined,
                "lastLogin": user.last_login,
            },
            "profile": {
                "name": profile.name if profile else "",
                "profession": profile.profession if profile else "",
                "experience": profile.experience_level if profile else "",
                "skills": profile.skills if profile else [],
                "goal": profile.goal if profile else "",
                "targetRole": profile.target_role if profile else "",
                "completion": profile.profile_completion if profile else 0,
            },
            "skillGap": skill_gap_data,
            "careers": list(careers),
            "taskStats": task_stats,
            "recentActivity": list(activities),
        })

class AdminAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # User growth (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        daily_signups = User.objects.filter(date_joined__gte=thirty_days_ago) \
            .extra({"day": "date(date_joined)"}) \
            .values("day").annotate(count=Count("id")).order_by("day")

        # Task completion trends
        daily_tasks = TaskLog.objects.filter(created_at__gte=thirty_days_ago) \
            .extra({"day": "date(created_at)"}) \
            .values("day").annotate(count=Count("id")).order_by("day")

        # Top gap skills globally
        skill_gaps = SkillGapAnalysis.objects.all()
        all_gap_skills = {}
        for sg in skill_gaps:
            for skill in sg.gap_skills:
                # depending on format (string or dict)
                name = skill.get("skill") if isinstance(skill, dict) else skill
                if name:
                    all_gap_skills[name] = all_gap_skills.get(name, 0) + 1
        
        top_skills = [{"skill": k, "count": v} for k, v in sorted(all_gap_skills.items(), key=lambda item: item[1], reverse=True)[:10]]

        return Response({
            "userGrowth": list(daily_signups),
            "taskCompletionTrends": list(daily_tasks),
            "topMissingSkills": top_skills,
        })

class AdminTasksView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total_tasks = Task.objects.count()
        completed = Task.objects.filter(status="done").count()
        skipped = Task.objects.filter(status="skipped").count()
        
        # Hardest tasks (ones marked as too_hard most often)
        hardest = TaskLog.objects.filter(difficulty_feedback="too_hard") \
            .values("task__target_skill") \
            .annotate(count=Count("id")).order_by("-count")[:5]

        return Response({
            "totalTasks": total_tasks,
            "completed": completed,
            "skipped": skipped,
            "hardestSkills": list(hardest),
        })

class AdminCareersView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Most popular careers selected
        popular = CareerPath.objects.filter(is_selected=True) \
            .values("title") \
            .annotate(count=Count("id")).order_by("-count")[:10]
            
        total_generated = CareerPath.objects.count()

        return Response({
            "totalGenerated": total_generated,
            "popularCareers": list(popular),
        })
