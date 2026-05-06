from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, CareerPath


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "is_staff", "is_active", "date_joined")
    list_filter = ("is_staff", "is_active")
    search_fields = ("email", "username")
    ordering = ("-date_joined",)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "profession", "experience_level", "goal",
                    "profile_completion", "is_assessment_completed", "updated_at")
    list_filter = ("is_assessment_completed", "experience_level", "goal", "current_status")
    search_fields = ("user__email", "name", "profession", "preferred_domain")
    readonly_fields = ("profile_completion", "created_at", "updated_at")
    ordering = ("-updated_at",)


@admin.register(CareerPath)
class CareerPathAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "match_score", "market_demand", "created_at")
    list_filter = ("market_demand",)
    search_fields = ("user__email", "title")
    ordering = ("-created_at",)
