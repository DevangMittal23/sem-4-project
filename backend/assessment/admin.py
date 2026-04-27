from django.contrib import admin
from .models import AssessmentAnswer


@admin.register(AssessmentAnswer)
class AssessmentAnswerAdmin(admin.ModelAdmin):
    list_display = ("user", "question_id", "section", "answer_type", "short_answer", "created_at")
    list_filter = ("answer_type", "section")
    search_fields = ("user__email", "question_id", "answer")
    ordering = ("user", "created_at")
    readonly_fields = ("created_at",)

    def short_answer(self, obj):
        return obj.answer[:60] + "..." if len(obj.answer) > 60 else obj.answer
    short_answer.short_description = "Answer"
