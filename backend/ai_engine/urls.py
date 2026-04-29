from django.urls import path
from .views import (
    AssessmentChatView, ProfileChatView,
    SkillGapAnalysisView, CareerPredictionView,
    RoadmapView, WeeklyPlanView,
    TaskListView, TaskUpdateView,
    PerformanceAnalysisView,
)

urlpatterns = [
    path("assessment/chat/", AssessmentChatView.as_view(), name="ai-assessment-chat"),
    path("profile/chat/", ProfileChatView.as_view(), name="ai-profile-chat"),
    path("skill-gap/", SkillGapAnalysisView.as_view(), name="ai-skill-gap"),
    path("career/", CareerPredictionView.as_view(), name="ai-career"),
    path("roadmap/", RoadmapView.as_view(), name="ai-roadmap"),
    path("weekly-plan/", WeeklyPlanView.as_view(), name="ai-weekly-plan"),
    path("tasks/", TaskListView.as_view(), name="ai-tasks"),
    path("tasks/<int:pk>/", TaskUpdateView.as_view(), name="ai-task-update"),
    path("analysis/", PerformanceAnalysisView.as_view(), name="ai-analysis"),
]
