import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from accounts.models import UserProfile
from .models import AssessmentAnswer
from .serializers import AssessmentSubmitSerializer, AssessmentAnswerSerializer, extract_profile_data

logger = logging.getLogger("assessment")


class AssessmentSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        if profile.is_assessment_completed:
            return Response(
                {"error": "Assessment already completed.", "is_assessment_completed": True},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AssessmentSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers = serializer.validated_data["answers"]

        # Bulk upsert answers
        saved = []
        for item in answers:
            obj, _ = AssessmentAnswer.objects.update_or_create(
                user=request.user,
                question_id=item["question_id"],
                defaults={
                    "question_text": item.get("question_text", ""),
                    "answer": item["answer"],
                    "answer_type": item.get("answer_type", "text"),
                    "section": item.get("section", ""),
                },
            )
            saved.append(obj)

        # Extract and update profile
        profile_data = extract_profile_data(answers)
        for field, value in profile_data.items():
            setattr(profile, field, value)
        profile.is_assessment_completed = True
        profile.save()

        logger.info(
            "Assessment completed for %s — %d answers saved, profile: %s",
            request.user.email, len(saved), profile_data,
        )

        return Response({
            "message": "Assessment submitted successfully.",
            "answers_saved": len(saved),
            "profile_extracted": profile_data,
            "profile_completion": profile.profile_completion,
            "is_assessment_completed": True,
        }, status=status.HTTP_201_CREATED)


class AssessmentAnswersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        answers = AssessmentAnswer.objects.filter(user=request.user)
        return Response({
            "is_assessment_completed": getattr(request.user, "profile", None) and request.user.profile.is_assessment_completed,
            "answers": AssessmentAnswerSerializer(answers, many=True).data,
        })


class AssessmentResetView(APIView):
    """Dev/admin only — resets assessment so it can be retaken."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        AssessmentAnswer.objects.filter(user=request.user).delete()
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.is_assessment_completed = False
        profile.save()
        logger.info("Assessment reset for %s", request.user.email)
        return Response({"message": "Assessment reset."})
