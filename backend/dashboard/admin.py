from django.contrib import admin
from .models import SkillGapAnalysis, Roadmap, WeeklyPlan, Task, TaskLog, ActivityLog


@admin.register(SkillGapAnalysis)
class SkillGapAdmin(admin.ModelAdmin):
    list_display = ("user", "adzuna_role_searched", "adzuna_jobs_count", "updated_at")
    search_fields = ("user__email", "adzuna_role_searched")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ("user", "career_title", "current_week", "total_weeks", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("user__email", "career_title")
    readonly_fields = ("created_at", "updated_at")


@admin.register(WeeklyPlan)
class WeeklyPlanAdmin(admin.ModelAdmin):
    list_display = ("user", "week_number", "theme", "is_current", "is_completed", "completion_pct")
    list_filter = ("is_current", "is_completed")
    search_fields = ("user__email", "theme")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "tag", "difficulty", "status", "week_number", "order")
    list_filter = ("status", "difficulty", "tag", "week_number")
    search_fields = ("user__email", "title", "target_skill")
    readonly_fields = ("created_at", "updated_at")


@admin.register(TaskLog)
class TaskLogAdmin(admin.ModelAdmin):
    list_display = ("user", "task", "difficulty_feedback", "time_taken", "created_at")
    list_filter = ("difficulty_feedback",)
    search_fields = ("user__email",)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("user", "date", "tasks_completed", "xp_earned")
    list_filter = ("date",)
    search_fields = ("user__email",)
    ordering = ("-date",)
