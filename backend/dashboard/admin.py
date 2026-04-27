from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "status", "difficulty", "tag", "week_number", "created_at")
    list_filter = ("status", "difficulty", "week_number")
    search_fields = ("user__email", "title")
    ordering = ("user", "week_number", "created_at")
