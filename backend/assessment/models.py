from django.db import models
from django.conf import settings


class AssessmentAnswer(models.Model):
    TYPE_CHOICES = [
        ("text", "Text"),
        ("card_select", "Card Select"),
        ("slider", "Slider"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assessment_answers")
    question_id = models.CharField(max_length=50)
    question_text = models.TextField()
    answer = models.TextField()
    answer_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="text")
    section = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        unique_together = ("user", "question_id")

    def __str__(self):
        return f"{self.user.email} | {self.question_id}: {self.answer[:40]}"
