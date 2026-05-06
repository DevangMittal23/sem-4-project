from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import UserStatusView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth: /api/auth/register, /api/auth/login, /api/auth/logout
    #       /api/auth/profile/, /api/auth/profile/update/
    #       /api/auth/user/status/
    path("api/auth/", include("accounts.urls")),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Shortcut: /api/user/status/ (frontend may call either path)
    path("api/user/status/", UserStatusView.as_view(), name="user-status-root"),

    # Assessment submit: /api/assessment/submit/
    path("api/", include("assessment.urls")),

    # Dashboard + tasks: /api/dashboard/, /api/dashboard/stats/,
    #                    /api/dashboard/activity/, /api/tasks/, /api/tasks/<pk>/
    path("api/", include("dashboard.urls")),

    # AI engine: /api/ai/assessment/chat/, /api/ai/skill-gap/,
    #            /api/ai/career/, /api/ai/roadmap/, /api/ai/tasks/,
    #            /api/ai/tasks/generate/, /api/ai/analysis/, etc.
    path("api/ai/", include("ai_engine.urls")),
]
