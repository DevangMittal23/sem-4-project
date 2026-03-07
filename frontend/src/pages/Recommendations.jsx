import { useState, useEffect } from 'react';
import { aiRecommendationService } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await aiRecommendationService.getPersonalized();
        setRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return <MainLayout><div className="text-center py-12">Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">🤖 AI-Powered Recommendations</h1>
          <p className="text-purple-100">{recommendations?.recommendation_reason}</p>
          <p className="text-xs text-purple-200 mt-2">⚡ Currently using rule-based logic (AI/ML coming soon)</p>
        </div>

        {/* Recommended Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">🎯 Recommended Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations?.recommended_activities?.map((activity) => (
              <div key={activity.id} className="border-2 border-gray-200 p-5 rounded-lg hover:border-blue-500 hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                <div className="flex gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {activity.domain}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {activity.difficulty}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    ⏱️ {activity.estimated_time}h
                  </span>
                </div>
                <button
                  onClick={() => navigate('/activities')}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Start Activity →
                </button>
              </div>
            ))}
          </div>
          {(!recommendations?.recommended_activities || recommendations.recommended_activities.length === 0) && (
            <p className="text-center text-gray-500 py-8">Complete more activities to get personalized recommendations!</p>
          )}
        </div>

        {/* Skill Focus */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">🎯 Skill Focus Areas</h2>
          <div className="space-y-3">
            {recommendations?.skill_focus?.map((focus, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r">
                <span className="text-2xl">💡</span>
                <p className="text-gray-700 flex-1">{focus}</p>
              </div>
            ))}
          </div>
          {(!recommendations?.skill_focus || recommendations.skill_focus.length === 0) && (
            <p className="text-center text-gray-500 py-4">Build your skills to see focus areas</p>
          )}
        </div>

        {/* Weekly Learning Plan */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">📅 Weekly Learning Plan</h2>
          <div className="space-y-3">
            {recommendations?.weekly_learning_plan?.map((plan, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <p className="text-gray-700 flex-1">{plan}</p>
              </div>
            ))}
          </div>
          {(!recommendations?.weekly_learning_plan || recommendations.weekly_learning_plan.length === 0) && (
            <p className="text-center text-gray-500 py-4">Your personalized plan will appear here</p>
          )}
        </div>

        {/* AI Integration Notice */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-2">🚀 Future AI Enhancements</h3>
          <p className="text-sm opacity-90 mb-3">
            This platform is designed for AI/ML integration. Future versions will include:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>Machine Learning-based career path predictions</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>LLM-powered personalized learning roadmaps</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>RAG-based contextual career guidance</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>Skill gap analysis with AI recommendations</span>
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default Recommendations;
