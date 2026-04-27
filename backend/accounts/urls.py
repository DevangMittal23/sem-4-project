from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProfileView, UserStatusView, CareerPathView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/update/", ProfileView.as_view(), name="profile-update"),
    path("user/status/", UserStatusView.as_view(), name="user-status"),
    path("career-paths/", CareerPathView.as_view(), name="career-paths"),
]
