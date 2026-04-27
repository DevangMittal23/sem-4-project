from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "is_staff", "is_active", "date_joined")
    list_filter = ("is_staff", "is_active")
    search_fields = ("email", "username")
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "username", "password1", "password2")}),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "experience_level", "goal", "profile_completion", "is_assessment_completed", "updated_at")
    list_filter = ("is_assessment_completed", "experience_level", "goal", "current_status")
    search_fields = ("user__email", "name", "profession")
    readonly_fields = ("profile_completion", "created_at", "updated_at")
    fieldsets = (
        ("User", {"fields": ("user",)}),
        ("Assessment Data", {"fields": ("name", "profession", "thinking_style", "interests", "skills", "preferred_domain", "experience_level", "experience_years")}),
        ("Manual Fields", {"fields": ("education", "current_status", "availability", "goal", "linkedin", "bio")}),
        ("Status", {"fields": ("profile_completion", "is_assessment_completed", "created_at", "updated_at")}),
    )
