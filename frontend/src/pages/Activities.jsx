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
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <span>📋</span> Activities
          </h1>
          <p className="text-lg opacity-90 mt-2">Explore and complete activities to boost your career</p>
        </div>
        
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-[#1a2650] to-[#0f1a36] rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/10">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Submission Details</h2>
              <div className="space-y-4">
                <div className="bg-blue-500/15 border border-blue-500/20 p-4 rounded-xl">
                  <p className="text-slate-400 text-sm font-medium mb-1">Activity</p>
                  <p className="font-bold text-lg text-gray-100">{viewingDetails.activity.title}</p>
                </div>
                <div className="bg-green-500/15 border border-green-500/20 p-4 rounded-xl">
                  <p className="text-slate-400 text-sm font-medium mb-1">Time Spent</p>
                  <p className="font-bold text-lg text-gray-100">{viewingDetails.status.time_spent_minutes} minutes</p>
                </div>
                <div className="bg-purple-500/15 border border-purple-500/20 p-4 rounded-xl">
                  <p className="text-slate-400 text-sm font-medium mb-1">Difficulty</p>
                  <p className="font-bold text-lg text-gray-100 capitalize">{viewingDetails.status.difficulty_feedback}</p>
                </div>
                {viewingDetails.status.project_link && (
                  <div className="bg-orange-500/15 border border-orange-500/20 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm font-medium mb-1">Project Link</p>
                    <a href={viewingDetails.status.project_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline break-all">
                      {viewingDetails.status.project_link}
                    </a>
                  </div>
                )}
                {viewingDetails.status.completion_notes && (
                  <div className="bg-pink-500/15 border border-pink-500/20 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm font-medium mb-1">Notes</p>
                    <p className="text-slate-300">{viewingDetails.status.completion_notes}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setViewingDetails(null)}
                className="mt-6 w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition font-semibold shadow-lg"
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
