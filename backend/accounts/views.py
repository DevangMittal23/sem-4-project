import logging
import uuid
from django.conf import settings
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


class GoogleAuthView(APIView):
    """
    POST /api/auth/google/
    Accepts a Google credential token (ID token from Google Sign-In),
    verifies it, and either logs in or registers the user.
    Returns JWT tokens matching the existing auth response format.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token", "").strip()
        if not token:
            return Response(
                {"error": "Google credential token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Verify Google Token (Access Token from implicit flow) ─────────
        try:
            import requests as req
            # The token received is an access_token, not an id_token.
            # We call the userinfo endpoint to verify it and get user details.
            response = req.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                logger.warning("Google userinfo failed: %s", response.text)
                return Response(
                    {"error": "Invalid Google token. Please try again."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
                
            idinfo = response.json()
            
        except Exception as e:
            logger.warning("Google token verification error: %s", e)
            return Response(
                {"error": "Failed to communicate with Google."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        email = idinfo.get("email", "").lower().strip()
        name = idinfo.get("name", "")

        if not email:
            return Response(
                {"error": "Google account does not have an email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Get or create user ────────────────────────────────────────────
        is_new_user = False
        user = User.objects.filter(email=email).first()

        if not user:
            is_new_user = True
            # Generate a unique username from the email prefix
            base_username = email.split("@")[0][:30]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                password=None,  # Google users don't have a password
            )
            user.set_unusable_password()
            user.save()
            logger.info("New Google user registered: %s", email)

        if not user.is_active:
            return Response(
                {"error": "This account has been disabled."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ── Ensure profile exists ─────────────────────────────────────────
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={"name": name or user.username},
        )
        if not profile.name and name:
            profile.name = name
            profile.save()

        # ── Generate JWT tokens ───────────────────────────────────────────
        tokens = _get_tokens(user)
        logger.info("Google auth successful: %s (new=%s)", email, is_new_user)

        return Response({
            "message": "Google authentication successful.",
            "tokens": tokens,
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
            },
            "is_new_user": is_new_user,
            "is_assessment_completed": profile.is_assessment_completed,
            "profile_completion": profile.profile_completion,
        })
