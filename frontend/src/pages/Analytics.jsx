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
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <span>📊</span> Analytics
          </h1>
          <p className="text-lg opacity-90 mt-2">Track your progress and insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-xl border-2 border-blue-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>📊</span> Activity Completion Timeline
            </h2>
            {Object.keys(completionData).length > 0 ? (
              <Bar data={completionChartData} />
            ) : (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">📈</p>
                <p className="text-gray-500 font-medium">No data available</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl shadow-xl border-2 border-purple-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>🎯</span> Domain Engagement
            </h2>
            {Object.keys(domainData).length > 0 ? (
              <Doughnut data={domainChartData} />
            ) : (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">🎨</p>
                <p className="text-gray-500 font-medium">No data available</p>
              </div>
            )}
          </div>
        </div>

        {recommendations && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-xl border-2 border-purple-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>🤖</span> Career Path Recommendations
            </h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-3 text-purple-700">Suggested Career Paths:</h3>
                <ul className="space-y-2">
                  {recommendations.career_paths.map((path, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{path}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-3 text-blue-700">Weekly Roadmap:</h3>
                <div className="space-y-3">
                  {Object.entries(recommendations.weekly_roadmap).map(([week, task]) => (
                    <div key={week} className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 rounded-r-lg">
                      <span className="font-bold text-blue-700">{week.replace('_', ' ').toUpperCase()}:</span>
                      <span className="text-gray-700 ml-2">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-3 text-green-700">Progress Summary:</h3>
                <p className="text-gray-700 leading-relaxed">{recommendations.progress_summary}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Analytics;
