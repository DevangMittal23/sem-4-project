import { useState, useEffect } from 'react';
import { analyticsService, activityService, activityLifecycleService } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

const Progress = () => {
  const [data, setData] = useState({
    completionData: {},
    domainData: {},
    scores: { consistency: 0, engagement: 0 },
    userProgress: null,
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [completion, domain, consistency, engagement, progress, allActivities] = await Promise.all([
        analyticsService.getCompletionChart().catch(() => ({ data: {} })),
        analyticsService.getDomainEngagement().catch(() => ({ data: {} })),
        analyticsService.getConsistencyScore().catch(() => ({ data: { consistency_score: 0 } })),
        analyticsService.getEngagementScore().catch(() => ({ data: { engagement_score: 0 } })),
        activityLifecycleService.getUserProgress().catch(() => ({ data: { total_completed: 0, average_time_minutes: 0, completion_rate: 0, activities: [] } })),
        activityService.getAll().catch(() => ({ data: [] }))
      ]);

      setData({
        completionData: completion.data || {},
        domainData: domain.data || {},
        scores: {
          consistency: consistency.data?.consistency_score || 0,
          engagement: engagement.data?.engagement_score || 0
        },
        userProgress: progress.data,
        activities: allActivities.data || []
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityById = (id) => data.activities.find(a => a.id === id);

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = { completed: '✅', in_progress: '⏳', paused: '⏸️' };
    return icons[status] || '▫️';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-2xl text-gray-600">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  const timelineData = {
    labels: Object.keys(data.completionData).slice(-7).map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Completed',
      data: Object.values(data.completionData).slice(-7),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const domainChartData = {
    labels: Object.keys(data.domainData),
    datasets: [{
      data: Object.values(data.domainData),
      backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)']
    }]
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">📈 Your Progress</h1>

        {/* Stats */}
        {data.userProgress && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Completed</h3>
              <p className="text-4xl font-bold text-green-600">{data.userProgress.total_completed}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Time</h3>
              <p className="text-4xl font-bold text-blue-600">{data.userProgress.average_time_minutes} min</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Completion Rate</h3>
              <p className="text-4xl font-bold text-purple-600">{data.userProgress.completion_rate.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {/* Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Consistency Score</h3>
            <p className="text-4xl font-bold text-blue-600">{data.scores.consistency}%</p>
            <div className="mt-4 bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${data.scores.consistency}%` }}></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Engagement Score</h3>
            <p className="text-4xl font-bold text-green-600">{data.scores.engagement}%</p>
            <div className="mt-4 bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: `${data.scores.engagement}%` }}></div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Activity Timeline</h2>
            {Object.keys(data.completionData).length > 0 ? (
              <Line data={timelineData} options={{ responsive: true, maintainAspectRatio: true }} />
            ) : (
              <p className="text-gray-500 text-center py-8">No data yet</p>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Domain Distribution</h2>
            {Object.keys(data.domainData).length > 0 ? (
              <Doughnut data={domainChartData} />
            ) : (
              <p className="text-gray-500 text-center py-8">No data yet</p>
            )}
          </div>
        </div>

        {/* Activity Status */}
        {data.userProgress?.activities && data.userProgress.activities.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">📋 Activity Status</h2>
            <div className="space-y-3">
              {data.userProgress.activities.map((log) => {
                const activity = getActivityById(log.activity_id);
                if (!activity) return null;
                return (
                  <div key={log.id} className={`border-2 rounded-lg p-4 ${getStatusColor(log.status)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getStatusIcon(log.status)}</span>
                          <h3 className="font-bold text-lg">{activity.title}</h3>
                        </div>
                        <div className="flex gap-3 text-sm">
                          <span className="px-2 py-1 bg-white rounded">{activity.domain}</span>
                          <span className="px-2 py-1 bg-white rounded">{activity.difficulty}</span>
                          {log.time_spent_minutes && <span className="px-2 py-1 bg-white rounded">⏱️ {log.time_spent_minutes} min</span>}
                        </div>
                      </div>
                      {log.status !== 'completed' && (
                        <button onClick={() => navigate('/activities')} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                          Continue
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(!data.userProgress?.activities || data.userProgress.activities.length === 0) && (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">No Activities Yet</h2>
            <p className="text-gray-600 mb-6">Start completing activities to see your progress!</p>
            <button onClick={() => navigate('/activities')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Browse Activities
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Progress;
