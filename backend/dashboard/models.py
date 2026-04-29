from django.db import models
from django.conf import settings


class SkillGapAnalysis(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="skill_gap")
    current_skills = models.JSONField(default=list)
    required_skills = models.JSONField(default=list)
    gap_skills = models.JSONField(default=list)          # skills to learn
    market_insights = models.JSONField(default=list)     # from Google search
    job_market_data = models.JSONField(default=dict)     # salary, demand, trends
    recommendations = models.JSONField(default=list)
    career_options = models.JSONField(default=list)      # [{title, fit_score, reason}]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"SkillGap({self.user.email})"


class Roadmap(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="roadmap")
    career_title = models.CharField(max_length=200)
    total_weeks = models.IntegerField(default=12)
    current_week = models.IntegerField(default=1)
    phases = models.JSONField(default=list)              # full phase structure
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Roadmap({self.user.email} → {self.career_title})"


class WeeklyPlan(models.Model):
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name="weekly_plans")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="weekly_plans")
    week_number = models.IntegerField()
    theme = models.CharField(max_length=200, blank=True)
    goals = models.JSONField(default=list)
    is_current = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    completion_pct = models.IntegerField(default=0)
    ai_feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["week_number"]
        unique_together = ("roadmap", "week_number")

    def __str__(self):
        return f"Week {self.week_number} — {self.user.email}"


class Task(models.Model):
    STATUS_CHOICES = [("pending", "Pending"), ("in_progress", "In Progress"), ("done", "Done"), ("skipped", "Skipped")]
    DIFFICULTY_CHOICES = [("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    weekly_plan = models.ForeignKey(WeeklyPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks")
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    resource_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="medium")
    tag = models.CharField(max_length=50, blank=True)
    estimated_time = models.CharField(max_length=30, blank=True)
    week_number = models.IntegerField(default=1)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["week_number", "order", "created_at"]

    def __str__(self):
        return f"{self.user.email} | W{self.week_number} | {self.title[:50]}"


class TaskLog(models.Model):
    DIFFICULTY_FEEDBACK_CHOICES = [("too_easy", "Too Easy"), ("just_right", "Just Right"), ("too_hard", "Too Hard")]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="logs")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="task_logs")
    time_taken = models.IntegerField(null=True, blank=True)
    difficulty_feedback = models.CharField(max_length=20, choices=DIFFICULTY_FEEDBACK_CHOICES, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log: {self.task.title[:40]}"
