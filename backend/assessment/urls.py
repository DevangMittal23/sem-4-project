from django.urls import path
from .views import AssessmentSubmitView, AssessmentAnswersView, AssessmentResetView

urlpatterns = [
    path("assessment/submit/", AssessmentSubmitView.as_view(), name="assessment-submit"),
    path("assessment/answers/", AssessmentAnswersView.as_view(), name="assessment-answers"),
    path("assessment/reset/", AssessmentResetView.as_view(), name="assessment-reset"),
]
