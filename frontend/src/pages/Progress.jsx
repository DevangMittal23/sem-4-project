import { useState, useEffect } from 'react';
import { analyticsService, activityService } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { Line, Doughnut } from 'react-chartjs-2';

const Progress = () => {
  const [completionData, setCompletionData] = useState({});
  const [domainData, setDomainData] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [scores, setScores] = useState({ consistency: 0, engagement: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [completion, domain, subs, consistency, engagement] = await Promise.all([
          analyticsService.getCompletionChart(),
          analyticsService.getDomainEngagement(),
          activityService.getMySubmissions(),
          analyticsService.getConsistencyScore(),
          analyticsService.getEngagementScore()
        ]);
        
        setCompletionData(completion.data);
        setDomainData(domain.data);
        setSubmissions(subs.data);
        setScores({
          consistency: consistency.data.consistency_score,
          engagement: engagement.data.engagement_score
        });
      } catch (error) {
        console.error('Error fetching progress data:', error);
      }
    };
    fetchData();
  }, []);

  const timelineChartData = {
    labels: Object.keys(completionData).map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Activities Completed',
      data: Object.values(completionData),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const domainChartData = {
    labels: Object.keys(domainData),
    datasets: [{
      data: Object.values(domainData),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ]
    }]
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">📈 Your Progress</h1>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Consistency Score</h3>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-blue-600">{scores.consistency}%</p>
              <p className="text-sm text-gray-500 mb-1">Weekly activity rate</p>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${scores.consistency}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Engagement Score</h3>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-green-600">{scores.engagement}%</p>
              <p className="text-sm text-gray-500 mb-1">Overall participation</p>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${scores.engagement}%` }}
              />
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Activity Timeline</h2>
          {Object.keys(completionData).length > 0 ? (
            <Line data={timelineChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          ) : (
            <p className="text-gray-500 text-center py-8">No activity data yet</p>
          )}
        </div>

        {/* Domain Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Domain Skill Distribution</h2>
            {Object.keys(domainData).length > 0 ? (
              <Doughnut data={domainChartData} />
            ) : (
              <p className="text-gray-500 text-center py-8">No domain data yet</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Recent Submissions</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {submissions.slice(0, 5).map((sub) => (
                <div key={sub.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                  <p className="font-semibold">Activity #{sub.activity_id}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(sub.submitted_at).toLocaleDateString()} • Rating: {sub.feedback_rating || 'N/A'}/5
                  </p>
                </div>
              ))}
              {submissions.length === 0 && (
                <p className="text-gray-500 text-center py-4">No submissions yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Progress;
