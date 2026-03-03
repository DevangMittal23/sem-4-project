import { useState, useEffect } from 'react';
import { activityService } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await activityService.getAll();
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await activityService.submit({
        activity_id: selectedActivity.id,
        submission_content: submissionContent,
        submission_url: submissionUrl,
        feedback_rating: rating,
        completion_time: 1.0
      });
      alert('Activity submitted successfully!');
      setSelectedActivity(null);
      setSubmissionContent('');
      setSubmissionUrl('');
    } catch (error) {
      console.error('Error submitting activity:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Activities</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
              <p className="text-gray-600 mb-4">{activity.description}</p>
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span className="bg-blue-100 px-2 py-1 rounded">{activity.domain}</span>
                <span className="bg-green-100 px-2 py-1 rounded">{activity.difficulty}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Est. Time: {activity.estimated_time}h</p>
              <button
                onClick={() => setSelectedActivity(activity)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Start Activity
              </button>
            </div>
          ))}
        </div>

        {selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">{selectedActivity.title}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Submission Content</label>
                  <textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Submission URL (optional)</label>
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Activities;
