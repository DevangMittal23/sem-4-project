import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getData();
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Completed Activities</h3>
            <p className="text-3xl font-bold text-blue-600">{data?.completed_activities || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Weekly Consistency</h3>
            <p className="text-3xl font-bold text-green-600">{data?.weekly_consistency || 0}%</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Progress Indicator</h3>
            <p className="text-3xl font-bold text-purple-600">{data?.progress_indicator || 0}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Profile Summary</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Name:</span> {data?.profile?.name}</p>
            <p><span className="font-semibold">Role:</span> {data?.profile?.current_job_role || 'Not set'}</p>
            <p><span className="font-semibold">Experience:</span> {data?.profile?.years_of_experience || 0} years</p>
            <p><span className="font-semibold">Career Goal:</span> {data?.profile?.career_goal || 'Not set'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recommended Activities</h2>
          <div className="space-y-3">
            {data?.recommended_activities?.map((activity) => (
              <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold">{activity.title}</h3>
                <p className="text-sm text-gray-600">{activity.domain} • {activity.difficulty}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
