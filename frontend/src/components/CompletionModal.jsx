import { useState } from 'react';

const CompletionModal = ({ activity, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    time_spent_minutes: '',
    difficulty_feedback: 'medium',
    completion_notes: '',
    project_link: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      activity_id: activity.id,
      time_spent_minutes: parseInt(formData.time_spent_minutes),
      difficulty_feedback: formData.difficulty_feedback,
      completion_notes: formData.completion_notes || null,
      project_link: formData.project_link || null
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-[#1a2650] to-[#0f1a36] rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/10">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Complete Activity</h2>
        <p className="text-slate-400 mb-6 font-medium">{activity.title}</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 mb-2 font-semibold flex items-center gap-2">
              <span>⏱️</span> Time Spent (minutes) *
            </label>
            <input
              type="number"
              value={formData.time_spent_minutes}
              onChange={(e) => setFormData({ ...formData, time_spent_minutes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-white/10 bg-white/[0.06] text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-slate-500"
              required
              min="1"
              placeholder="e.g., 45"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold flex items-center gap-2">
              <span>📊</span> Difficulty Rating *
            </label>
            <select
              value={formData.difficulty_feedback}
              onChange={(e) => setFormData({ ...formData, difficulty_feedback: e.target.value })}
              className="w-full px-4 py-3 border-2 border-white/10 bg-white/[0.06] text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              required
            >
              <option value="easy">😊 Easy</option>
              <option value="medium">😐 Medium</option>
              <option value="hard">😰 Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold flex items-center gap-2">
              <span>🔗</span> Project/Article Link
            </label>
            <input
              type="url"
              value={formData.project_link}
              onChange={(e) => setFormData({ ...formData, project_link: e.target.value })}
              className="w-full px-4 py-3 border-2 border-white/10 bg-white/[0.06] text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-slate-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-semibold flex items-center gap-2">
              <span>📝</span> Notes
            </label>
            <textarea
              value={formData.completion_notes}
              onChange={(e) => setFormData({ ...formData, completion_notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-white/10 bg-white/[0.06] text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-slate-500"
              rows="3"
              placeholder="What did you learn? Any challenges?"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              ✅ Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 font-semibold shadow-lg transition"
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompletionModal;
