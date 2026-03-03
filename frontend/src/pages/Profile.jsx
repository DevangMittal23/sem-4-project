import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const requiresCompletion = location.state?.requiresCompletion;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      console.log('Profile data:', response.data);
      setProfile(response.data);
      setFormData(response.data);
      
      if (requiresCompletion) {
        setEditing(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      console.log('Submitting profile data:', formData);
      const response = await userService.updateProfile(formData);
      console.log('Profile update response:', response.data);
      
      setProfile(response.data);
      setEditing(false);
      
      if (requiresCompletion) {
        console.log('Profile saved, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <MainLayout><div>Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {requiresCompletion && !profile.is_profile_complete && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r">
            <p className="text-yellow-800 font-medium">
              ⚠️ Please complete your profile to continue
            </p>
          </div>
        )}
        
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Profile</h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-sm">Name</label>
                <p className="text-lg">{profile.name}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Current Job Role</label>
                <p className="text-lg">{profile.current_job_role || 'Not set'}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Years of Experience</label>
                <p className="text-lg">{profile.years_of_experience || 0}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Weekly Available Time (hours)</label>
                <p className="text-lg">{profile.weekly_available_time || 0}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Career Goal</label>
                <p className="text-lg">{profile.career_goal || 'Not set'}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">Risk Tolerance</label>
                <p className="text-lg">{profile.risk_tolerance || 'Not set'}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Current Job Role *</label>
                <input
                  type="text"
                  value={formData.current_job_role || ''}
                  onChange={(e) => setFormData({ ...formData, current_job_role: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Years of Experience *</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.years_of_experience || 0}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Weekly Available Time (hours) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.weekly_available_time || 0}
                  onChange={(e) => setFormData({ ...formData, weekly_available_time: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Career Goal *</label>
                <input
                  type="text"
                  value={formData.career_goal || ''}
                  onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Risk Tolerance *</label>
                <select
                  value={formData.risk_tolerance || ''}
                  onChange={(e) => setFormData({ ...formData, risk_tolerance: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {!requiresCompletion && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
