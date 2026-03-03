import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { analyticsService, recommendationService } from '../services/api';
import MainLayout from '../layouts/MainLayout';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [completionData, setCompletionData] = useState({});
  const [domainData, setDomainData] = useState({});
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [completion, domain, recs] = await Promise.all([
        analyticsService.getCompletionChart(),
        analyticsService.getDomainEngagement(),
        recommendationService.generate()
      ]);
      setCompletionData(completion.data);
      setDomainData(domain.data);
      setRecommendations(recs.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const completionChartData = {
    labels: Object.keys(completionData),
    datasets: [{
      label: 'Activities Completed',
      data: Object.values(completionData),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  const domainChartData = {
    labels: Object.keys(domainData),
    datasets: [{
      label: 'Domain Engagement',
      data: Object.values(domainData),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
      ]
    }]
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Activity Completion Timeline</h2>
            {Object.keys(completionData).length > 0 ? (
              <Bar data={completionChartData} />
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Domain Engagement</h2>
            {Object.keys(domainData).length > 0 ? (
              <Doughnut data={domainChartData} />
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>

        {recommendations && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Career Path Recommendations</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Suggested Career Paths:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {recommendations.career_paths.map((path, idx) => (
                    <li key={idx} className="text-gray-700">{path}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Weekly Roadmap:</h3>
                <div className="space-y-2">
                  {Object.entries(recommendations.weekly_roadmap).map(([week, task]) => (
                    <div key={week} className="border-l-4 border-blue-500 pl-4 py-2">
                      <span className="font-semibold">{week.replace('_', ' ').toUpperCase()}:</span> {task}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Progress Summary:</h3>
                <p className="text-gray-700">{recommendations.progress_summary}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Analytics;
