import logging
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import UserProfile, CareerPath
from .serializers import RegisterSerializer, ProfileSerializer, UserStatusSerializer, CareerPathSerializer

logger = logging.getLogger("accounts")
User = get_user_model()


def _get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        tokens = _get_tokens(user)
        logger.info("New user registered: %s", user.email)
        return Response({
            "message": "Registration successful.",
            "tokens": tokens,
            "user": {"id": user.id, "email": user.email, "username": user.username},
            "is_assessment_completed": False,
            "profile_completion": 0,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        if not identifier or not password:
            return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = (
            User.objects.filter(username=identifier).first()
            or User.objects.filter(email=identifier.lower()).first()
        )

        if not user or not user.check_password(password):
            return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"error": "Account is disabled."}, status=status.HTTP_403_FORBIDDEN)

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if not profile.name:
            profile.name = user.username
            profile.save()

        tokens = _get_tokens(user)
        logger.info("User logged in: %s", user.username)

        return Response({
            "message": "Login successful.",
            "tokens": tokens,
            "user": {"id": user.id, "email": user.email, "username": user.username},
            "is_assessment_completed": profile.is_assessment_completed,
            "profile_completion": profile.profile_completion,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Logged out successfully."})
        except TokenError:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(ProfileSerializer(profile).data)

    def put(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        logger.info("Profile updated: %s → %d%%", request.user.email, profile.profile_completion)
        return Response(serializer.data)


class UserStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(UserStatusSerializer({
            "is_authenticated": True,
            "is_assessment_completed": profile.is_assessment_completed,
            "profile_completion": profile.profile_completion,
            "user_id": request.user.id,
            "email": request.user.email,
            "username": request.user.username,
        }).data)


class CareerPathView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        paths = CareerPath.objects.filter(user=request.user)
        return Response(CareerPathSerializer(paths, many=True).data)
