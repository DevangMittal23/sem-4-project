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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Complete Activity</h2>
        <p className="text-gray-600 mb-4">{activity.title}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Time Spent (minutes) *</label>
            <input
              type="number"
              value={formData.time_spent_minutes}
              onChange={(e) => setFormData({ ...formData, time_spent_minutes: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Difficulty Rating *</label>
            <select
              value={formData.difficulty_feedback}
              onChange={(e) => setFormData({ ...formData, difficulty_feedback: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Project/Article Link</label>
            <input
              type="url"
              value={formData.project_link}
              onChange={(e) => setFormData({ ...formData, project_link: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.completion_notes}
              onChange={(e) => setFormData({ ...formData, completion_notes: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="What did you learn? Any challenges?"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompletionModal;
