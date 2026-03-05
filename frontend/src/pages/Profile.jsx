import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [skillForm, setSkillForm] = useState({ skill_name: '', skill_category: '', skill_level: 'beginner', confidence_score: 50 });
  const [linkForm, setLinkForm] = useState({ type: 'github', url: '' });
  const [interestInput, setInterestInput] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const requiresCompletion = location.state?.requiresCompletion;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      setProfile(response.data);
      setFormData(response.data);
      if (requiresCompletion) setEditing(true);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await userService.updateProfile(formData);
      setProfile(response.data);
      setEditing(false);
      if (requiresCompletion) {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    if (!skillForm.skill_name || !skillForm.skill_category) return;
    try {
      await userService.addSkill(skillForm);
      setSkillForm({ skill_name: '', skill_category: '', skill_level: 'beginner', confidence_score: 50 });
      fetchProfile();
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const deleteSkill = async (id) => {
    try {
      await userService.deleteSkill(id);
      fetchProfile();
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const addLink = async () => {
    if (!linkForm.url) return;
    try {
      await userService.addLink(linkForm);
      setLinkForm({ type: 'github', url: '' });
      fetchProfile();
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const deleteLink = async (id) => {
    try {
      await userService.deleteLink(id);
      fetchProfile();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const addInterest = async () => {
    if (!interestInput) return;
    try {
      await userService.addInterest({ domain: interestInput });
      setInterestInput('');
      fetchProfile();
    } catch (error) {
      console.error('Error adding interest:', error);
    }
  };

  const deleteInterest = async (id) => {
    try {
      await userService.deleteInterest(id);
      fetchProfile();
    } catch (error) {
      console.error('Error deleting interest:', error);
    }
  };

  if (!profile) return <MainLayout><div>Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {requiresCompletion && !profile.is_profile_complete && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r">
            <p className="text-yellow-800 font-medium">⚠️ Please complete your profile to continue</p>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="flex justify-between items-start -mt-16">
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600">
                  {profile.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-lg text-gray-600">{profile.current_job_role || 'No role set'}</p>
                  <p className="text-sm text-gray-500">{profile.location || 'Location not set'}</p>
                </div>
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Edit Profile
                </button>
              )}
            </div>
            <div className="mt-4 flex gap-6 text-sm text-gray-600">
              <span>📅 {profile.years_of_experience || 0} years experience</span>
              <span>⏰ {profile.weekly_available_time || 0} hrs/week available</span>
              <span>🎯 Target: {profile.target_role || profile.career_goal || 'Not set'}</span>
            </div>
            {profile.bio && <p className="mt-4 text-gray-700">{profile.bio}</p>}
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Edit Profile Information</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Role *</label>
                <input type="text" value={formData.current_job_role || ''} onChange={(e) => setFormData({ ...formData, current_job_role: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience *</label>
                <input type="number" step="0.5" value={formData.years_of_experience || 0} onChange={(e) => setFormData({ ...formData, years_of_experience: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weekly Available Time (hrs) *</label>
                <input type="number" step="0.5" value={formData.weekly_available_time || 0} onChange={(e) => setFormData({ ...formData, weekly_available_time: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Career Goal *</label>
                <input type="text" value={formData.career_goal || ''} onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Role</label>
                <input type="text" value={formData.target_role || ''} onChange={(e) => setFormData({ ...formData, target_role: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input type="text" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Education</label>
                <input type="text" value={formData.education || ''} onChange={(e) => setFormData({ ...formData, education: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Learning Style</label>
                <select value={formData.preferred_learning_style || ''} onChange={(e) => setFormData({ ...formData, preferred_learning_style: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select...</option>
                  <option value="Visual">Visual</option>
                  <option value="Auditory">Auditory</option>
                  <option value="Kinesthetic">Kinesthetic</option>
                  <option value="Reading/Writing">Reading/Writing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Risk Tolerance *</label>
                <select value={formData.risk_tolerance || ''} onChange={(e) => setFormData({ ...formData, risk_tolerance: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">Select...</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows="3" placeholder="Tell us about yourself..."></textarea>
              </div>
              <div className="col-span-2 flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {!requiresCompletion && (
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Skills</h2>
          <div className="space-y-3 mb-4">
            {profile.skills?.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.skill_name}</span>
                    <span className="text-sm text-gray-500">{skill.confidence_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${skill.confidence_score}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{skill.skill_category} • {skill.skill_level}</span>
                </div>
                <button onClick={() => deleteSkill(skill.id)} className="ml-4 text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Add Skill</h3>
            <div className="grid grid-cols-5 gap-2">
              <input type="text" placeholder="Skill name" value={skillForm.skill_name} onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })} className="px-3 py-2 border rounded-lg" />
              <input type="text" placeholder="Category" value={skillForm.skill_category} onChange={(e) => setSkillForm({ ...skillForm, skill_category: e.target.value })} className="px-3 py-2 border rounded-lg" />
              <select value={skillForm.skill_level} onChange={(e) => setSkillForm({ ...skillForm, skill_level: e.target.value })} className="px-3 py-2 border rounded-lg">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <input type="number" min="0" max="100" placeholder="Score" value={skillForm.confidence_score} onChange={(e) => setSkillForm({ ...skillForm, confidence_score: parseInt(e.target.value) })} className="px-3 py-2 border rounded-lg" />
              <button onClick={addSkill} className="bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Links</h2>
          <div className="space-y-2 mb-4">
            {profile.links?.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium capitalize">{link.type}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">{link.url}</a>
                </div>
                <button onClick={() => deleteLink(link.id)} className="text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Add Link</h3>
            <div className="flex gap-2">
              <select value={linkForm.type} onChange={(e) => setLinkForm({ ...linkForm, type: e.target.value })} className="px-3 py-2 border rounded-lg">
                <option value="github">GitHub</option>
                <option value="linkedin">LinkedIn</option>
                <option value="portfolio">Portfolio</option>
                <option value="blog">Blog</option>
                <option value="kaggle">Kaggle</option>
                <option value="other">Other</option>
              </select>
              <input type="url" placeholder="URL" value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg" />
              <button onClick={addLink} className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Interests</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.interests?.map((interest) => (
              <span key={interest.id} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2">
                {interest.domain}
                <button onClick={() => deleteInterest(interest.id)} className="text-blue-900 hover:text-red-600">✕</button>
              </span>
            ))}
          </div>
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Add Interest</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Domain (e.g., Machine Learning, Design)" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
              <button onClick={addInterest} className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {profile.analytics && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Activity Stats</h2>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{profile.analytics.skill_count}</div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{profile.analytics.activity_completion_rate}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{profile.analytics.consistency_score}</div>
                <div className="text-sm text-gray-600">Consistency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{profile.analytics.strongest_domain || 'N/A'}</div>
                <div className="text-sm text-gray-600">Strongest</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{profile.analytics.weakest_domain || 'N/A'}</div>
                <div className="text-sm text-gray-600">Needs Work</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
