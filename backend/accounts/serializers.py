from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, CareerPath

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        UserProfile.objects.get_or_create(user=user, defaults={"name": validated_data["username"]})
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            "id", "email", "username",
            "name", "profession", "thinking_style", "interests", "skills",
            "skill_levels", "certifications",
            "preferred_domain", "experience_level", "experience_years",
            "education", "current_status", "availability", "goal",
            "target_role", "risk_tolerance", "learning_style",
            "side_income_type", "target_salary",
            "linkedin", "bio",
            "profile_completion", "is_assessment_completed",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "email", "username", "profile_completion", "is_assessment_completed", "created_at", "updated_at")

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class CareerPathSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerPath
        fields = ("id", "title", "description", "required_skills", "match_score", "is_selected", "created_at")
        read_only_fields = ("id", "created_at")


class UserStatusSerializer(serializers.Serializer):
    is_authenticated = serializers.BooleanField()
    is_assessment_completed = serializers.BooleanField()
    profile_completion = serializers.IntegerField()
    user_id = serializers.IntegerField()
    email = serializers.EmailField()
    username = serializers.CharField()
