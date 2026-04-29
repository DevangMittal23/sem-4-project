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
        ("student", "Student"), ("employed", "Employed"),
        ("freelance", "Freelance"), ("unemployed", "Unemployed"), ("career_break", "Career Break"),
    ]
    EDUCATION_CHOICES = [
        ("high_school", "High School"), ("diploma", "Diploma"), ("bachelors", "Bachelor's"),
        ("masters", "Master's"), ("phd", "PhD"), ("self_taught", "Self-taught"),
    ]
    AVAILABILITY_CHOICES = [
        ("lt5", "< 5 hrs/week"), ("5_10", "5-10 hrs/week"),
        ("10_20", "10-20 hrs/week"), ("gt20", "20+ hrs/week"),
    ]
    LEVEL_CHOICES = [
        ("fresher", "Fresher"), ("junior", "Junior"), ("mid", "Mid"),
        ("senior", "Senior"), ("lead", "Lead"),
    ]
    RISK_CHOICES = [
        ("low", "Low — I prefer stability"),
        ("medium", "Medium — Balanced approach"),
        ("high", "High — I embrace challenges"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    # Core identity
    name = models.CharField(max_length=150, blank=True)
    profession = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    linkedin = models.URLField(blank=True)

    # Experience & education
    experience_level = models.CharField(max_length=50, choices=LEVEL_CHOICES, blank=True)
    experience_years = models.CharField(max_length=10, blank=True)
    education = models.CharField(max_length=50, choices=EDUCATION_CHOICES, blank=True)
    current_status = models.CharField(max_length=50, choices=STATUS_CHOICES, blank=True)

    # Skills & domain
    skills = models.JSONField(default=list, blank=True)           # current skills
    skill_levels = models.JSONField(default=dict, blank=True)     # {"Python": "intermediate", ...}
    thinking_style = models.CharField(max_length=100, blank=True)
    interests = models.JSONField(default=list, blank=True)
    preferred_domain = models.CharField(max_length=200, blank=True)
    certifications = models.JSONField(default=list, blank=True)

    # Goals & preferences
    goal = models.CharField(max_length=50, choices=GOAL_CHOICES, blank=True)
    target_role = models.CharField(max_length=200, blank=True)
    target_salary = models.CharField(max_length=50, blank=True)   # e.g. "80000-100000"
    side_income_type = models.CharField(max_length=200, blank=True)  # freelance, content, etc.
    risk_tolerance = models.CharField(max_length=20, choices=RISK_CHOICES, blank=True)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, blank=True)
    learning_style = models.CharField(max_length=100, blank=True)  # visual, hands-on, reading

    # Computed
    profile_completion = models.IntegerField(default=0)
    is_assessment_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_completion(self) -> int:
        filled = sum(
            1 for f in PROFILE_REQUIRED_FIELDS
            if (lambda v: bool(v) if not isinstance(v, list) else len(v) > 0)(getattr(self, f, ""))
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
    salary_range = models.CharField(max_length=100, blank=True)
    market_demand = models.CharField(max_length=50, blank=True)  # high/medium/low
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-match_score"]

    def __str__(self):
        return f"{self.user.email} → {self.title}"
