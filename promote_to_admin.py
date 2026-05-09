import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

if len(sys.argv) > 1:
    email = sys.argv[1]
    try:
        user = User.objects.get(email=email)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"User {email} successfully promoted to Admin.")
    except User.DoesNotExist:
        print(f"User {email} not found. Creating a new admin user...")
        # Create a new user with this email
        base_username = email.split("@")[0][:30]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
            
        user = User.objects.create_user(
            username=username,
            email=email,
            password=None,
        )
        user.set_unusable_password()
        user.is_staff = True
        user.is_superuser = True
        user.save()
        
        # Make sure they have a profile
        from accounts.models import UserProfile
        UserProfile.objects.create(user=user, name=username)
        
        print(f"User {email} was created and successfully promoted to Admin.")
else:
    print("Usage: python promote_to_admin.py <user_email>")
