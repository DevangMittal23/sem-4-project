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

  if (loading) return <MainLayout><div className="text-center py-12 text-slate-400 text-2xl">Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <span>🤖</span> AI-Powered Recommendations
          </h1>
          <p className="text-lg opacity-90">{recommendations?.recommendation_reason}</p>
          <p className="text-sm opacity-75 mt-2">⚡ Currently using rule-based logic (AI/ML coming soon)</p>
        </div>

        {/* Recommended Activities */}
        <div className="bg-white/[0.06] backdrop-blur-md p-8 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.25)] border border-white/[0.08]">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-100">
            <span>🎯</span> Recommended Activities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations?.recommended_activities?.map((activity) => (
              <div key={activity.id} className="bg-white/[0.06] backdrop-blur-md border border-white/[0.08] p-6 rounded-2xl hover:shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-1">
                <h3 className="font-bold text-xl text-gray-100 mb-3">{activity.title}</h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{activity.description}</p>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-semibold">
                    {activity.domain}
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-semibold">
                    {activity.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    ⏱️ {activity.estimated_time}h
                  </span>
                </div>
                <button
                  onClick={() => navigate('/activities')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🚀 Start Activity →
                </button>
              </div>
            ))}
          </div>
          {(!recommendations?.recommended_activities || recommendations.recommended_activities.length === 0) && (
            <div className="text-center py-12 bg-white/[0.06] rounded-2xl border border-white/[0.08]">
              <p className="text-6xl mb-3">🎯</p>
              <p className="text-slate-400 font-medium">Complete more activities to get personalized recommendations!</p>
            </div>
          )}
        </div>

        {/* Skill Focus */}
        <div className="bg-white/[0.06] backdrop-blur-md p-8 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.25)] border border-white/[0.08]">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-100">
            <span>🎯</span> Skill Focus Areas
          </h2>
          <div className="space-y-3">
            {recommendations?.skill_focus?.map((focus, idx) => (
              <div key={idx} className="flex items-start gap-3 p-5 bg-yellow-500/10 border-l-4 border-yellow-500/60 rounded-r-xl hover:bg-yellow-500/15 transition-all duration-200">
                <span className="text-3xl">💡</span>
                <p className="text-slate-300 flex-1 font-medium">{focus}</p>
              </div>
            ))}
          </div>
          {(!recommendations?.skill_focus || recommendations.skill_focus.length === 0) && (
            <div className="text-center py-8 bg-white/[0.06] rounded-2xl border border-white/[0.08]">
              <p className="text-6xl mb-3">💪</p>
              <p className="text-slate-400 font-medium">Build your skills to see focus areas</p>
            </div>
          )}
        </div>

        {/* Weekly Learning Plan */}
        <div className="bg-white/[0.06] backdrop-blur-md p-8 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.25)] border border-white/[0.08]">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-100">
            <span>📅</span> Weekly Learning Plan
          </h2>
          <div className="space-y-3">
            {recommendations?.weekly_learning_plan?.map((plan, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 bg-white/[0.06] rounded-2xl border border-white/[0.08] hover:bg-white/[0.1] transition-all duration-200">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-slate-300 flex-1 font-medium pt-1">{plan}</p>
              </div>
            ))}
          </div>
          {(!recommendations?.weekly_learning_plan || recommendations.weekly_learning_plan.length === 0) && (
            <div className="text-center py-8 bg-white/[0.06] rounded-2xl border border-white/[0.08]">
              <p className="text-6xl mb-3">📆</p>
              <p className="text-slate-400 font-medium">Your personalized plan will appear here</p>
            </div>
          )}
        </div>

        {/* AI Integration Notice */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
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
