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
      completed: 'bg-green-500/15 text-green-300 border-green-500/30',
      in_progress: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      paused: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
    };
    return colors[status] || 'bg-white/[0.06] text-gray-300 border-white/10';
  };

  const getStatusIcon = (status) => {
    const icons = { completed: '✅', in_progress: '⏳', paused: '⏸️' };
    return icons[status] || '▫️';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-2xl text-slate-400">Loading...</div>
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
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <span>📈</span> Your Progress
          </h1>
          <p className="text-lg opacity-90 mt-2">Track your learning journey and achievements</p>
        </div>

        {/* Stats */}
        {data.userProgress && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
              <h3 className="text-lg font-semibold mb-2 opacity-90">Total Completed</h3>
              <p className="text-5xl font-bold">{data.userProgress.total_completed}</p>
              <div className="text-6xl opacity-20 absolute right-4 bottom-4">✅</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 relative">
              <h3 className="text-lg font-semibold mb-2 opacity-90">Average Time</h3>
              <p className="text-5xl font-bold">{data.userProgress.average_time_minutes} <span className="text-2xl">min</span></p>
              <div className="text-6xl opacity-20 absolute right-4 bottom-4">⏱️</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 relative">
              <h3 className="text-lg font-semibold mb-2 opacity-90">Completion Rate</h3>
              <p className="text-5xl font-bold">{data.userProgress.completion_rate.toFixed(1)}<span className="text-2xl">%</span></p>
              <div className="text-6xl opacity-20 absolute right-4 bottom-4">🎯</div>
            </div>
          </div>
        )}

        {/* Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/[0.06] backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/[0.08] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-[3px]">
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Consistency Score</h3>
            <p className="text-4xl font-bold text-blue-400">{data.scores.consistency}%</p>
            <div className="mt-4 bg-white/[0.15] rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500" style={{ width: `${data.scores.consistency}%` }}></div>
            </div>
          </div>
          <div className="bg-white/[0.06] backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/[0.08] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-[3px]">
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Engagement Score</h3>
            <p className="text-4xl font-bold text-green-400">{data.scores.engagement}%</p>
            <div className="mt-4 bg-white/[0.15] rounded-full h-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${data.scores.engagement}%` }}></div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/[0.06] backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/[0.08] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-[3px]">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-100">
              <span>📈</span> Activity Timeline
            </h2>
            {Object.keys(data.completionData).length > 0 ? (
              <Line data={timelineData} options={{ responsive: true, maintainAspectRatio: true, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } } }, plugins: { legend: { labels: { color: '#cbd5e1' } } } }} />
            ) : (
              <div className="text-center py-12">
                <p className="text-6xl mb-3">📉</p>
                <p className="text-slate-400 font-medium">No data yet</p>
              </div>
            )}
          </div>
          <div className="bg-white/[0.06] backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/[0.08] hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-[3px]">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-100">
              <span>🎯</span> Domain Distribution
            </h2>
            {Object.keys(data.domainData).length > 0 ? (
              <Doughnut data={domainChartData} options={{ plugins: { legend: { labels: { color: '#cbd5e1' } } } }} />
            ) : (
              <div className="text-center py-12">
                <p className="text-6xl mb-3">🎨</p>
                <p className="text-slate-400 font-medium">No data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Status */}
        {data.userProgress?.activities && data.userProgress.activities.length > 0 && (
          <div className="bg-white/[0.06] backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/[0.08]">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-100">
              <span>📋</span> Activity Status
            </h2>
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
                          <span className="px-2 py-1 bg-white/10 rounded text-slate-300">{activity.domain}</span>
                          <span className="px-2 py-1 bg-white/10 rounded text-slate-300">{activity.difficulty}</span>
                          {log.time_spent_minutes && <span className="px-2 py-1 bg-white/10 rounded text-slate-300">⏱️ {log.time_spent_minutes} min</span>}
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
          <div className="bg-white/[0.06] backdrop-blur-md p-12 rounded-2xl shadow-lg border border-white/[0.08] text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-100">No Activities Yet</h2>
            <p className="text-slate-400 mb-6">Start completing activities to see your progress!</p>
            <button onClick={() => navigate('/activities')} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg transition">
              Browse Activities
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Progress;
