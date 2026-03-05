import { useState, useEffect } from 'react';
import { analyticsService, activityService, activityLifecycleService } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { Line, Doughnut, Radar, Bar } from 'react-chartjs-2';

const Progress = () => {
  const [completionData, setCompletionData] = useState({});
  const [domainData, setDomainData] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [scores, setScores] = useState({ consistency: 0, engagement: 0 });
  const [userProgress, setUserProgress] = useState(null);
  const [skillGrowth, setSkillGrowth] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [completion, domain, subs, consistency, engagement, progress, skills] = await Promise.all([
          analyticsService.getCompletionChart(),
          analyticsService.getDomainEngagement(),
          activityService.getMySubmissions(),
          analyticsService.getConsistencyScore(),
          analyticsService.getEngagementScore(),
          activityLifecycleService.getUserProgress(),
          analyticsService.getSkillGrowth()
        ]);
        
        setCompletionData(completion.data);
        setDomainData(domain.data);
        setSubmissions(subs.data);
        setScores({
          consistency: consistency.data.consistency_score,
          engagement: engagement.data.engagement_score
        });
        setUserProgress(progress.data);
        setSkillGrowth(skills.data);
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

  const radarChartData = skillGrowth?.radar_chart ? {
    labels: skillGrowth.radar_chart.labels,
    datasets: [{
      label: 'Skill Confidence',
      data: skillGrowth.radar_chart.scores,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(59, 130, 246)'
    }]
  } : null;

  const skillTimelineData = skillGrowth?.skill_timeline ? {
    labels: skillGrowth.skill_timeline.map(t => t.date),
    datasets: [{
      label: 'Skill Growth',
      data: skillGrowth.skill_timeline.map(t => t.new),
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderColor: 'rgb(34, 197, 94)',
    }]
  } : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">📈 Your Progress</h1>

        {/* Progress Stats */}
        {userProgress && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Completed</h3>
              <p className="text-4xl font-bold text-green-600">{userProgress.total_completed}</p>
              <p className="text-sm text-gray-500 mt-2">Activities finished</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Time</h3>
              <p className="text-4xl font-bold text-blue-600">{userProgress.average_time_minutes}</p>
              <p className="text-sm text-gray-500 mt-2">Minutes per activity</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Completion Rate</h3>
              <p className="text-4xl font-bold text-purple-600">{userProgress.completion_rate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 mt-2">Of all activities</p>
            </div>
          </div>
        )}

        {/* Skill Growth Section */}
        {skillGrowth && (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">🎯 Skill Growth Analytics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm opacity-90">Total Skills</p>
                  <p className="text-3xl font-bold">{skillGrowth.total_skills}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Avg Score</p>
                  <p className="text-3xl font-bold">{skillGrowth.average_skill_score}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Strongest</p>
                  <p className="text-lg font-bold">{skillGrowth.strongest_domain.name}</p>
                  <p className="text-sm">{skillGrowth.strongest_domain.score}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Needs Work</p>
                  <p className="text-lg font-bold">{skillGrowth.weakest_domain.name}</p>
                  <p className="text-sm">{skillGrowth.weakest_domain.score}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skill Radar Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Skill Radar</h2>
                {radarChartData ? (
                  <Radar data={radarChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                ) : (
                  <p className="text-gray-500 text-center py-8">No skill data yet</p>
                )}
              </div>

              {/* Top Improving Skills */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">🚀 Top Improving Skills (30 days)</h2>
                <div className="space-y-3">
                  {skillGrowth.top_improving_skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-semibold">{skill.skill}</span>
                      <span className="text-green-600 font-bold">+{skill.growth}</span>
                    </div>
                  ))}
                  {skillGrowth.top_improving_skills.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Complete activities to see growth</p>
                  )}
                </div>
              </div>
            </div>

            {/* Skill Timeline */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Skill Growth Timeline</h2>
              {skillTimelineData ? (
                <Bar data={skillTimelineData} options={{ responsive: true, maintainAspectRatio: true }} />
              ) : (
                <p className="text-gray-500 text-center py-8">No timeline data yet</p>
              )}
            </div>

            {/* Weakest Skills */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">⚠️ Skills Needing Attention</h2>
              <div className="space-y-3">
                {skillGrowth.weakest_skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{skill.skill}</p>
                      <p className="text-sm text-gray-500">{skill.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${skill.score}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{skill.score}%</span>
                    </div>
                  </div>
                ))}
                {skillGrowth.weakest_skills.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No skills tracked yet</p>
                )}
              </div>
            </div>
          </>
        )}

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
