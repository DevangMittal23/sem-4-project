import { useState, useEffect } from 'react';
import { dashboardService, analyticsService, gamificationService, activityLifecycleService, aiRecommendationService } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Bar, Doughnut } from 'react-chartjs-2';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState({});
  const [domainData, setDomainData] = useState({});
  const [engagementMetrics, setEngagementMetrics] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = async () => {
    try {
      const [dashResponse, chartResponse, domainResponse, engagementResponse, streakResponse, progressResponse, recsResponse] = await Promise.all([
        dashboardService.getData(),
        analyticsService.getCompletionChart(),
        analyticsService.getDomainEngagement(),
        analyticsService.getUserEngagement(),
        gamificationService.getStreak(),
        activityLifecycleService.getUserProgress(),
        aiRecommendationService.getPersonalized()
      ]);
      setData(dashResponse.data);
      setEngagementMetrics(engagementResponse.data);
      setStreakData(streakResponse.data);
      setUserProgress(progressResponse.data);
      setRecommendations(recsResponse.data);
      
      const dates = Object.keys(chartResponse.data).slice(-7);
      const values = dates.map(d => chartResponse.data[d]);
      
      setChartData({
        labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Activities Completed',
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          borderRadius: 8
        }]
      });

      setDomainData({
        labels: Object.keys(domainResponse.data),
        datasets: [{
          data: Object.values(domainResponse.data),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  if (loading) return <MainLayout><div className="flex items-center justify-center h-screen"><div className="text-xl text-gray-600">Loading your dashboard...</div></div></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {data?.profile?.name}! 👋</h1>
              <p className="text-lg opacity-90">🎯 {data?.profile?.career_goal || 'Set your career goal in profile'}</p>
              <p className="text-sm opacity-75 mt-2">💼 {data?.profile?.current_job_role || 'Update your role'} • 📍 {data?.profile?.location || 'Add location'}</p>
            </div>
            <button onClick={() => navigate('/profile')} className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Gamification Streak Cards */}
        {streakData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">🔥 Current Streak</p>
                  <p className="text-6xl font-bold mt-2">{streakData.current_streak}</p>
                  <p className="text-sm opacity-75 mt-1">consecutive days</p>
                </div>
                <div className="text-7xl opacity-20">🔥</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">🏆 Best Streak</p>
                  <p className="text-6xl font-bold mt-2">{streakData.longest_streak}</p>
                  <p className="text-sm opacity-75 mt-1">personal record</p>
                </div>
                <div className="text-7xl opacity-20">🏆</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">⚡ Weekly Goal</p>
                  <p className="text-6xl font-bold mt-2">{streakData.weekly_completed}<span className="text-3xl">/{streakData.weekly_goal}</span></p>
                  <p className="text-sm opacity-75 mt-1">{streakData.weekly_progress}% complete</p>
                </div>
                <div className="text-7xl opacity-20">⚡</div>
              </div>
              <div className="mt-4 bg-white bg-opacity-30 rounded-full h-3">
                <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${streakData.weekly_progress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        {engagementMetrics && userProgress && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-3xl font-bold text-green-600">{userProgress.total_completed}</div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-3xl font-bold text-blue-600">{engagementMetrics.engagement_score}</div>
              <div className="text-sm text-gray-600 mt-1">Engagement</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-purple-600">{userProgress.completion_rate.toFixed(0)}%</div>
              <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-3xl font-bold text-orange-600">{userProgress.average_time_minutes}</div>
              <div className="text-sm text-gray-600 mt-1">Avg Time (min)</div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📈</span> Weekly Progress
            </h2>
            {chartData.labels?.length > 0 ? (
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-5xl mb-3">📊</div>
                <p>Start completing activities!</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🎨</span> Domain Distribution
            </h2>
            {domainData.labels?.length > 0 ? (
              <Doughnut data={domainData} options={{ responsive: true, maintainAspectRatio: true }} />
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-5xl mb-3">🎯</div>
                <p>Explore different domains!</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendations?.recommended_activities?.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl shadow-lg border-2 border-purple-200">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🤖</span> AI Recommended For You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.recommended_activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="bg-white p-5 rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1">
                  <h3 className="font-bold text-lg mb-2">{activity.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{activity.domain}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">{activity.difficulty}</span>
                  </div>
                  <button onClick={() => navigate('/activities')} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                    Start Now →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => navigate('/activities')} className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <div className="text-4xl mb-2">📚</div>
            <div className="font-bold">Browse Activities</div>
          </button>
          <button onClick={() => navigate('/progress')} className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <div className="text-4xl mb-2">📊</div>
            <div className="font-bold">View Progress</div>
          </button>
          <button onClick={() => navigate('/recommendations')} className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <div className="text-4xl mb-2">🎯</div>
            <div className="font-bold">Get Recommendations</div>
          </button>
          <button onClick={() => navigate('/profile')} className="bg-orange-600 text-white p-6 rounded-xl hover:bg-orange-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <div className="text-4xl mb-2">👤</div>
            <div className="font-bold">My Profile</div>
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
