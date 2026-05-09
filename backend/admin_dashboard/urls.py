from django.urls import path
from .views import (
    AdminStatsView,
    AdminUsersListView,
    AdminUserDetailView,
    AdminAnalyticsView,
    AdminTasksView,
    AdminCareersView,
)

urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("users/", AdminUsersListView.as_view(), name="admin-users"),
    path("user/<int:user_id>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("analytics/", AdminAnalyticsView.as_view(), name="admin-analytics"),
    path("tasks/", AdminTasksView.as_view(), name="admin-tasks"),
    path("careers/", AdminCareersView.as_view(), name="admin-careers"),
]
