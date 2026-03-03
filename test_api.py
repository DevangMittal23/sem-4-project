import requests
import json

# Test profile update
def test_profile_update():
    base_url = "http://localhost:8000"
    
    # First login to get token
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    try:
        # Login
        response = requests.post(f"{base_url}/api/auth/login", json=login_data)
        if response.status_code != 200:
            print(f"Login failed: {response.status_code} - {response.text}")
            return
            
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get current profile
        response = requests.get(f"{base_url}/api/user/profile", headers=headers)
        print(f"Get profile: {response.status_code} - {response.json()}")
        
        # Update profile
        profile_data = {
            "name": "Test Admin",
            "current_job_role": "Administrator",
            "years_of_experience": 5.0,
            "weekly_available_time": 20.0,
            "career_goal": "Senior Admin",
            "risk_tolerance": "Medium"
        }
        
        response = requests.put(f"{base_url}/api/user/profile", json=profile_data, headers=headers)
        result = response.json()
        print(f"Update profile: {response.status_code}")
        print(f"Response: {result}")
        print(f"Profile complete: {result.get('is_profile_complete', 'MISSING')}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_profile_update()