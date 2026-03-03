import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/api';

export const useProfileCompletion = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const checkProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      const profileData = response.data;
      
      console.log('Profile completion check:', profileData);
      setProfile(profileData);
      // Temporarily set to true to allow navigation
      setIsProfileComplete(true);
    } catch (error) {
      console.error('Error checking profile:', error);
      setIsProfileComplete(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  const refreshProfile = useCallback(() => {
    return checkProfile();
  }, [checkProfile]);

  return { 
    isProfileComplete, 
    loading, 
    profile,
    refreshProfile 
  };
};
