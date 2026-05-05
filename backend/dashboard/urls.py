from django.urls import path
from .views import DashboardView, DashboardStatsView, ActivityLogView, TaskListView, TaskDetailView

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("dashboard/activity/", ActivityLogView.as_view(), name="dashboard-activity"),
    path("tasks/", TaskListView.as_view(), name="task-list"),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
]
