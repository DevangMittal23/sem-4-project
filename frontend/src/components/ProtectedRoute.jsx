import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfileCompletion } from '../hooks/useProfileCompletion';

const ProtectedRoute = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isProfileComplete, loading: profileLoading } = useProfileCompletion();
  const location = useLocation();

  console.log('ProtectedRoute check:', {
    user: !!user,
    isProfileComplete,
    authLoading,
    profileLoading,
    pathname: location.pathname
  });

  // Show loading while checking auth or profile
  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If profile is incomplete and not already on profile page, redirect to profile
  if (!isProfileComplete && location.pathname !== '/profile') {
    console.log('Redirecting to profile for completion');
    return <Navigate to="/profile" state={{ requiresCompletion: true }} />;
  }

  // Allow access to the requested route
  return children;
};

export default ProtectedRoute;
