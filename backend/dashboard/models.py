from django.db import models
from django.conf import settings


class Task(models.Model):
    STATUS_CHOICES = [("pending", "Pending"), ("in_progress", "In Progress"), ("done", "Done"), ("skipped", "Skipped")]
    DIFFICULTY_CHOICES = [("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="medium")
    tag = models.CharField(max_length=50, blank=True)
    estimated_time = models.CharField(max_length=30, blank=True)
    week_number = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["week_number", "created_at"]

    def __str__(self):
        return f"{self.user.email} | W{self.week_number} | {self.title[:50]}"


class TaskLog(models.Model):
    DIFFICULTY_FEEDBACK_CHOICES = [("too_easy", "Too Easy"), ("just_right", "Just Right"), ("too_hard", "Too Hard")]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="logs")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="task_logs")
    time_taken = models.IntegerField(null=True, blank=True, help_text="Minutes")
    difficulty_feedback = models.CharField(max_length=20, choices=DIFFICULTY_FEEDBACK_CHOICES, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log: {self.task.title[:40]} by {self.user.email}"
