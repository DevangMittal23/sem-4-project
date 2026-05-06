from django.contrib import admin
from .models import AssessmentAnswer


@admin.register(AssessmentAnswer)
class AssessmentAnswerAdmin(admin.ModelAdmin):
    list_display = ("user", "question_id", "answer_type", "section", "created_at")
    list_filter = ("answer_type", "section")
    search_fields = ("user__email", "question_id", "question_text")
    readonly_fields = ("created_at",)
    ordering = ("user", "created_at")
