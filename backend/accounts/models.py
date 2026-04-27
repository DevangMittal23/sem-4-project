from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email


PROFILE_REQUIRED_FIELDS = [
    "name", "profession", "experience_level",
    "education", "current_status", "availability", "goal",
]


class UserProfile(models.Model):
    GOAL_CHOICES = [
        ("switch_domain", "Switch Domain"),
        ("excel_current", "Excel in Current Domain"),
        ("get_job", "Get a Job"),
        ("promotion", "Promotion"),
        ("side_income", "Side Income"),
    ]
    STATUS_CHOICES = [
        ("student", "Student"),
        ("employed", "Employed"),
        ("freelance", "Freelance"),
        ("unemployed", "Unemployed"),
        ("career_break", "Career Break"),
    ]
    EDUCATION_CHOICES = [
        ("high_school", "High School"),
        ("diploma", "Diploma"),
        ("bachelors", "Bachelor's"),
        ("masters", "Master's"),
        ("phd", "PhD"),
        ("self_taught", "Self-taught"),
    ]
    AVAILABILITY_CHOICES = [
        ("lt5", "< 5 hrs/week"),
        ("5_10", "5-10 hrs/week"),
        ("10_20", "10-20 hrs/week"),
        ("gt20", "20+ hrs/week"),
    ]
    LEVEL_CHOICES = [
        ("fresher", "Fresher"),
        ("junior", "Junior"),
        ("mid", "Mid"),
        ("senior", "Senior"),
        ("lead", "Lead"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    name = models.CharField(max_length=150, blank=True)
    profession = models.CharField(max_length=200, blank=True)
    thinking_style = models.CharField(max_length=100, blank=True)
    interests = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=list, blank=True)
    preferred_domain = models.CharField(max_length=200, blank=True)
    experience_level = models.CharField(max_length=50, choices=LEVEL_CHOICES, blank=True)
    experience_years = models.CharField(max_length=10, blank=True)
    education = models.CharField(max_length=50, choices=EDUCATION_CHOICES, blank=True)
    current_status = models.CharField(max_length=50, choices=STATUS_CHOICES, blank=True)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, blank=True)
    goal = models.CharField(max_length=50, choices=GOAL_CHOICES, blank=True)
    linkedin = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    profile_completion = models.IntegerField(default=0)
    is_assessment_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_completion(self) -> int:
        filled = sum(
            1 for f in PROFILE_REQUIRED_FIELDS
            if (lambda v: (bool(v) if not isinstance(v, list) else len(v) > 0))(getattr(self, f, ""))
        )
        return round((filled / len(PROFILE_REQUIRED_FIELDS)) * 100)

    def save(self, *args, **kwargs):
        self.profile_completion = self.calculate_completion()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Profile({self.user.email})"


class CareerPath(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="career_paths")
    title = models.CharField(max_length=200)
    description = models.TextField()
    required_skills = models.JSONField(default=list)
    match_score = models.IntegerField(default=0)
    is_selected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-match_score"]

    def __str__(self):
        return f"{self.user.email} → {self.title}"
