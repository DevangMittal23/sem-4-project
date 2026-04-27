from django.urls import path
from .views import (
    AssessmentChatView, ProfileChatView,
    CareerPredictionView, RoadmapGenerationView,
    TaskGenerationView, PerformanceAnalysisView,
)

urlpatterns = [
    path("assessment/chat/", AssessmentChatView.as_view(), name="ai-assessment-chat"),
    path("profile/chat/", ProfileChatView.as_view(), name="ai-profile-chat"),
    path("career/", CareerPredictionView.as_view(), name="ai-career"),
    path("roadmap/", RoadmapGenerationView.as_view(), name="ai-roadmap"),
    path("tasks/", TaskGenerationView.as_view(), name="ai-tasks"),
    path("analysis/", PerformanceAnalysisView.as_view(), name="ai-analysis"),
]
