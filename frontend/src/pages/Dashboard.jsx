import { useState, useEffect } from 'react';
import { dashboardService, analyticsService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import { Bar } from 'react-chartjs-2';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashResponse, chartResponse] = await Promise.all([
          dashboardService.getData(),
          analyticsService.getCompletionChart()
        ]);
        setData(dashResponse.data);
        
        const dates = Object.keys(chartResponse.data).slice(-7);
        const values = dates.map(d => chartResponse.data[d]);
        
        setChartData({
          labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Activities Completed',
            data: values,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2
          }]
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <MainLayout><div className="text-center py-12">Loading...</div></MainLayout>;

  const getDominantDomain = () => {
    if (!data?.recommended_activities?.length) return 'General';
    return data.recommended_activities[0]?.domain || 'General';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {data?.profile?.name}! 👋</h1>
          <p className="text-blue-100 text-lg">Career Goal: {data?.profile?.career_goal || 'Not set'}</p>
          <p className="text-blue-200 mt-2">Keep building your skills and tracking your progress!</p>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon="✅"
            label="Activities Completed"
            value={data?.completed_activities || 0}
            color="green"
          />
          <StatCard
            icon="🔥"
            label="Weekly Consistency"
            value={`${data?.weekly_consistency || 0}%`}
            color="orange"
          />
          <StatCard
            icon="🎯"
            label="Active Domain"
            value={getDominantDomain()}
            color="purple"
          />
          <StatCard
            icon="📊"
            label="Progress Score"
            value={`${Math.round(data?.progress_indicator || 0)}%`}
            color="blue"
          />
        </div>

        {/* Next Recommended Action */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">🚀 Next Recommended Action</h2>
          {data?.recommended_activities?.length > 0 ? (
            <div className="space-y-4">
              {data.recommended_activities.slice(0, 1).map((activity) => (
                <div key={activity.id} className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
                  <p className="text-gray-600 mt-2">{activity.description}</p>
                  <div className="flex gap-4 mt-4 text-sm">
                    <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-medium">
                      {activity.domain}
                    </span>
                    <span className="bg-green-100 px-3 py-1 rounded-full text-green-700 font-medium">
                      {activity.difficulty}
                    </span>
                    <span className="text-gray-500">⏱️ {activity.estimated_time}h</span>
                  </div>
                  <button
                    onClick={() => navigate('/activities')}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Start Activity →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Complete more activities to get personalized recommendations!</p>
          )}
        </div>

        {/* Visual Analytics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">📈 Weekly Activity Completion</h2>
          {chartData.labels?.length > 0 ? (
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
          ) : (
            <p className="text-gray-500 text-center py-8">No activity data yet. Start completing activities!</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
