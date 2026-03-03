import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      setProfile(formData);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!profile) return <MainLayout><div>Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Profile</h1>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
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
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Current Job Role</label>
                <input
                  type="text"
                  value={formData.current_job_role || ''}
                  onChange={(e) => setFormData({ ...formData, current_job_role: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={formData.years_of_experience || 0}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Weekly Available Time (hours)</label>
                <input
                  type="number"
                  value={formData.weekly_available_time || 0}
                  onChange={(e) => setFormData({ ...formData, weekly_available_time: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Career Goal</label>
                <input
                  type="text"
                  value={formData.career_goal || ''}
                  onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Risk Tolerance</label>
                <select
                  value={formData.risk_tolerance || ''}
                  onChange={(e) => setFormData({ ...formData, risk_tolerance: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Save Changes
              </button>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
