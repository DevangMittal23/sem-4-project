import { useState, useEffect } from 'react';
import { userService, gamificationService } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
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
    fetchBadges();
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

  const fetchBadges = async () => {
    try {
      const response = await gamificationService.getBadges();
      setBadges(response.data.badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
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
      } else {
        navigate('/dashboard', { state: { refresh: true } });
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
          <div className="bg-yellow-500/15 border-l-4 border-yellow-500/60 p-4 rounded-r-xl">
            <p className="text-yellow-300 font-medium">⚠️ Please complete your profile to continue</p>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl border border-white/20">
          {/* Gradient Banner */}
          <div className="h-44 sm:h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative rounded-t-2xl">
            <div className="absolute inset-0 bg-black/20 rounded-t-2xl"></div>
          </div>

          {/* Avatar + Info Section */}
          <div className="relative px-6 sm:px-8 pb-8">
            {/* Avatar Container — overlaps the banner */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-[60px] relative z-10">
                <div
                  className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-xl
                             bg-gradient-to-br from-blue-500 to-purple-600
                             flex items-center justify-center text-5xl font-bold text-white
                             shrink-0"
                >
                  {profile.name?.charAt(0)?.toUpperCase()}
                </div>

                <div className="text-center sm:text-left mb-0 sm:mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">{profile.name}</h1>
                  <p className="text-lg sm:text-xl text-white/90 font-semibold mt-1">{profile.current_job_role || 'No role set'}</p>
                  <p className="text-sm text-gray-300 flex items-center justify-center sm:justify-start gap-1 mt-1">
                    <span>📍</span> {profile.location || 'Location not set'}
                  </p>
                </div>
              </div>

              {!editing && (
                <button onClick={() => setEditing(true)} className="mt-4 sm:mt-0 self-center sm:self-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition transform hover:scale-105 font-semibold">
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            <div className="mt-6 flex gap-4 text-sm flex-wrap justify-center sm:justify-start">
              <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-blue-200 font-medium border border-white/20">📅 {profile.years_of_experience || 0} years experience</span>
              <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-green-200 font-medium border border-white/20">⏰ {profile.weekly_available_time || 0} hrs/week available</span>
              <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-purple-200 font-medium border border-white/20">🎯 Target: {profile.target_role || profile.career_goal || 'Not set'}</span>
            </div>
            {profile.bio && <p className="mt-6 text-gray-300 bg-white/10 backdrop-blur-sm p-4 rounded-xl italic border border-white/20">"{profile.bio}"</p>}
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="bg-white/[0.06] backdrop-blur-md rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.25)] p-8 border border-white/[0.08]">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-100">
              <span>✏️</span> Edit Profile Information
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Name *</label>
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Current Role *</label>
                <input type="text" value={formData.current_job_role || ''} onChange={(e) => setFormData({ ...formData, current_job_role: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Years of Experience *</label>
                <input type="number" step="0.5" value={formData.years_of_experience || 0} onChange={(e) => setFormData({ ...formData, years_of_experience: parseFloat(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Weekly Available Time (hrs) *</label>
                <input type="number" step="0.5" value={formData.weekly_available_time || 0} onChange={(e) => setFormData({ ...formData, weekly_available_time: parseFloat(e.target.value) })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Career Goal *</label>
                <input type="text" value={formData.career_goal || ''} onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Target Role</label>
                <input type="text" value={formData.target_role || ''} onChange={(e) => setFormData({ ...formData, target_role: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Location</label>
                <input type="text" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Education</label>
                <input type="text" value={formData.education || ''} onChange={(e) => setFormData({ ...formData, education: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Learning Style</label>
                <select value={formData.preferred_learning_style || ''} onChange={(e) => setFormData({ ...formData, preferred_learning_style: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition">
                  <option value="" className="bg-[#1a2550]">Select...</option>
                  <option value="Visual" className="bg-[#1a2550]">Visual</option>
                  <option value="Auditory" className="bg-[#1a2550]">Auditory</option>
                  <option value="Kinesthetic" className="bg-[#1a2550]">Kinesthetic</option>
                  <option value="Reading/Writing" className="bg-[#1a2550]">Reading/Writing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Risk Tolerance *</label>
                <select value={formData.risk_tolerance || ''} onChange={(e) => setFormData({ ...formData, risk_tolerance: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" required>
                  <option value="" className="bg-[#1a2550]">Select...</option>
                  <option value="Low" className="bg-[#1a2550]">Low</option>
                  <option value="Medium" className="bg-[#1a2550]">Medium</option>
                  <option value="High" className="bg-[#1a2550]">High</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-300">Bio</label>
                <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" rows="3" placeholder="Tell us about yourself..."></textarea>
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105">
                  {saving ? '🔄 Saving...' : '✔️ Save Changes'}
                </button>
                {!requiresCompletion && (
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 font-semibold shadow-lg transition">
                    ❌ Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Badges Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <span>🏆</span> Badges Earned
          </h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="text-center p-6 bg-white/[0.06] backdrop-blur-md rounded-2xl border border-yellow-500/30 shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-[3px]">
                  <div className="text-6xl mb-3">{badge.icon}</div>
                  <h3 className="font-bold text-gray-100 text-lg">{badge.name}</h3>
                  <p className="text-xs text-slate-400 mt-2">{badge.description}</p>
                  <p className="text-xs text-slate-500 mt-3 font-medium">{new Date(badge.earned_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/[0.06] rounded-2xl border border-white/[0.08]">
              <p className="text-6xl mb-3">🎯</p>
              <p className="text-slate-400 font-medium">Complete activities to earn badges!</p>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Skills</h2>
          <div className="space-y-3 mb-4">
            {profile.skills?.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between bg-white/[0.06] border border-white/[0.08] p-3 rounded-xl">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-100">{skill.skill_name}</span>
                    <span className="text-sm text-slate-400">{skill.confidence_score}%</span>
                  </div>
                  <div className="w-full bg-white/[0.15] rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${skill.confidence_score}%` }}></div>
                  </div>
                  <span className="text-xs text-slate-500">{skill.skill_category} • {skill.skill_level}</span>
                </div>
                <button onClick={() => deleteSkill(skill.id)} className="ml-4 text-red-400 hover:text-red-300 font-bold">✕</button>
              </div>
            ))}
          </div>
          <div className="border-t border-white/20 pt-4">
            <h3 className="font-medium mb-2 text-white">Add Skill</h3>
            <div className="grid grid-cols-5 gap-2">
              <input type="text" placeholder="Skill name" value={skillForm.skill_name} onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })} className="px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" />
              <input type="text" placeholder="Category" value={skillForm.skill_category} onChange={(e) => setSkillForm({ ...skillForm, skill_category: e.target.value })} className="px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" />
              <select value={skillForm.skill_level} onChange={(e) => setSkillForm({ ...skillForm, skill_level: e.target.value })} className="px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition">
                <option value="beginner" className="bg-[#1a2550]">Beginner</option>
                <option value="intermediate" className="bg-[#1a2550]">Intermediate</option>
                <option value="advanced" className="bg-[#1a2550]">Advanced</option>
              </select>
              <input type="number" min="0" max="100" placeholder="Score" value={skillForm.confidence_score} onChange={(e) => setSkillForm({ ...skillForm, confidence_score: parseInt(e.target.value) })} className="px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" />
              <button onClick={addSkill} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold">Add</button>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Links</h2>
          <div className="space-y-2 mb-4">
            {profile.links?.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-white/[0.06] border border-white/[0.08] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="font-medium capitalize text-gray-100">{link.type}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline text-sm">{link.url}</a>
                </div>
                <button onClick={() => deleteLink(link.id)} className="text-red-400 hover:text-red-300 font-bold">✕</button>
              </div>
            ))}
          </div>
          <div className="border-t border-white/20 pt-4">
            <h3 className="font-medium mb-2 text-white">Add Link</h3>
            <div className="flex gap-2">
              <select value={linkForm.type} onChange={(e) => setLinkForm({ ...linkForm, type: e.target.value })} className="px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition">
                <option value="github" className="bg-[#1a2550]">GitHub</option>
                <option value="linkedin" className="bg-[#1a2550]">LinkedIn</option>
                <option value="portfolio" className="bg-[#1a2550]">Portfolio</option>
                <option value="blog" className="bg-[#1a2550]">Blog</option>
                <option value="kaggle" className="bg-[#1a2550]">Kaggle</option>
                <option value="other" className="bg-[#1a2550]">Other</option>
              </select>
              <input type="url" placeholder="URL" value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" />
              <button onClick={addLink} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold">Add</button>
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Interests</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.interests?.map((interest) => (
              <span key={interest.id} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center gap-2 font-medium shadow-lg">
                {interest.domain}
                <button onClick={() => deleteInterest(interest.id)} className="text-white hover:text-red-300 font-bold">✕</button>
              </span>
            ))}
          </div>
          <div className="border-t border-white/20 pt-4">
            <h3 className="font-medium mb-2 text-white">Add Interest</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Domain (e.g., Machine Learning, Design)" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.12] rounded-lg text-gray-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition" />
              <button onClick={addInterest} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold">Add</button>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {profile.analytics && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Activity Stats</h2>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center bg-white/[0.06] backdrop-blur-md p-4 rounded-2xl border border-white/[0.08] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:-translate-y-[3px] transition-all duration-200">
                <div className="text-3xl font-bold text-blue-400">{profile.analytics.skill_count}</div>
                <div className="text-sm text-slate-400">Skills</div>
              </div>
              <div className="text-center bg-white/[0.06] backdrop-blur-md p-4 rounded-2xl border border-white/[0.08] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:-translate-y-[3px] transition-all duration-200">
                <div className="text-3xl font-bold text-green-400">{profile.analytics.activity_completion_rate}%</div>
                <div className="text-sm text-slate-400">Completion Rate</div>
              </div>
              <div className="text-center bg-white/[0.06] backdrop-blur-md p-4 rounded-2xl border border-white/[0.08] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:-translate-y-[3px] transition-all duration-200">
                <div className="text-3xl font-bold text-purple-400">{profile.analytics.consistency_score}</div>
                <div className="text-sm text-slate-400">Consistency</div>
              </div>
              <div className="text-center bg-white/[0.06] backdrop-blur-md p-4 rounded-2xl border border-white/[0.08] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:-translate-y-[3px] transition-all duration-200">
                <div className="text-2xl font-bold text-orange-400">{profile.analytics.strongest_domain || 'N/A'}</div>
                <div className="text-sm text-slate-400">Strongest</div>
              </div>
              <div className="text-center bg-white/[0.06] backdrop-blur-md p-4 rounded-2xl border border-white/[0.08] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:-translate-y-[3px] transition-all duration-200">
                <div className="text-2xl font-bold text-red-400">{profile.analytics.weakest_domain || 'N/A'}</div>
                <div className="text-sm text-slate-400">Needs Work</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
