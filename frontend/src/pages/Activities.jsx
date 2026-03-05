import { useState, useEffect } from 'react';
import { activityService, activityLifecycleService } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import ActivityCard from '../components/ActivityCard';
import CompletionModal from '../components/CompletionModal';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [activityStatuses, setActivityStatuses] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [viewingDetails, setViewingDetails] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await activityService.getAll();
      setActivities(response.data);
      
      // Fetch status for each activity
      const statuses = {};
      for (const activity of response.data) {
        const statusRes = await activityLifecycleService.getActivityStatus(activity.id);
        statuses[activity.id] = statusRes.data;
      }
      setActivityStatuses(statuses);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleStart = async (activityId) => {
    try {
      await activityLifecycleService.startActivity(activityId);
      fetchActivities();
    } catch (error) {
      console.error('Error starting activity:', error);
    }
  };

  const handlePause = async (activityId) => {
    try {
      await activityLifecycleService.pauseActivity(activityId);
      fetchActivities();
    } catch (error) {
      console.error('Error pausing activity:', error);
    }
  };

  const handleResume = async (activityId) => {
    try {
      await activityLifecycleService.resumeActivity(activityId);
      fetchActivities();
    } catch (error) {
      console.error('Error resuming activity:', error);
    }
  };

  const handleComplete = (activity) => {
    setSelectedActivity(activity);
    setShowCompletionModal(true);
  };

  const handleSubmitCompletion = async (data) => {
    try {
      await activityLifecycleService.completeActivity(data);
      setShowCompletionModal(false);
      setSelectedActivity(null);
      fetchActivities();
      alert('Activity completed successfully!');
    } catch (error) {
      console.error('Error completing activity:', error);
      alert('Error completing activity');
    }
  };

  const handleViewDetails = (activity, status) => {
    setViewingDetails({ activity, status });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Activities</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              status={activityStatuses[activity.id]}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onComplete={handleComplete}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {showCompletionModal && selectedActivity && (
          <CompletionModal
            activity={selectedActivity}
            onClose={() => {
              setShowCompletionModal(false);
              setSelectedActivity(null);
            }}
            onSubmit={handleSubmitCompletion}
          />
        )}

        {viewingDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Submission Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm">Activity</p>
                  <p className="font-semibold">{viewingDetails.activity.title}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Time Spent</p>
                  <p className="font-semibold">{viewingDetails.status.time_spent_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Difficulty</p>
                  <p className="font-semibold capitalize">{viewingDetails.status.difficulty_feedback}</p>
                </div>
                {viewingDetails.status.project_link && (
                  <div>
                    <p className="text-gray-500 text-sm">Project Link</p>
                    <a href={viewingDetails.status.project_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {viewingDetails.status.project_link}
                    </a>
                  </div>
                )}
                {viewingDetails.status.completion_notes && (
                  <div>
                    <p className="text-gray-500 text-sm">Notes</p>
                    <p className="text-gray-700">{viewingDetails.status.completion_notes}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setViewingDetails(null)}
                className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Activities;
