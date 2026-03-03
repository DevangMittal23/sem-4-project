#!/usr/bin/env python3
"""
Test script to verify profile completion logic
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.models import UserProfile
from app.services.profile_service import ProfileService

def test_profile_completion():
    print("Testing Profile Completion Logic...")
    
    # Test incomplete profile (missing fields)
    incomplete_profile = UserProfile(
        id=1,
        user_id=1,
        name="Test User",
        current_job_role=None,  # Missing
        years_of_experience=None,  # Missing
        weekly_available_time=10,
        career_goal="Software Engineer",
        risk_tolerance="Medium"
    )
    
    result = ProfileService.check_profile_completion(incomplete_profile)
    print(f"Incomplete profile result: {result} (should be False)")
    assert result == False, "Incomplete profile should return False"
    
    # Test complete profile
    complete_profile = UserProfile(
        id=2,
        user_id=2,
        name="Complete User",
        current_job_role="Developer",
        years_of_experience=3.5,
        weekly_available_time=15,
        career_goal="Senior Developer",
        risk_tolerance="High"
    )
    
    result = ProfileService.check_profile_completion(complete_profile)
    print(f"Complete profile result: {result} (should be True)")
    assert result == True, "Complete profile should return True"
    
    # Test None profile
    result = ProfileService.check_profile_completion(None)
    print(f"None profile result: {result} (should be False)")
    assert result == False, "None profile should return False"
    
    print("All profile completion tests passed!")

if __name__ == "__main__":
    test_profile_completion()