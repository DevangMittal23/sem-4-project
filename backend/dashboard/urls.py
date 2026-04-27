from django.urls import path
from .views import DashboardView, TaskListView, TaskDetailView

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("tasks/", TaskListView.as_view(), name="task-list"),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
]
