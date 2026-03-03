import { useState, useEffect } from 'react';
import { recommendationService } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await recommendationService.generate();
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
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">🎯 Your Career Recommendations</h1>
          <p className="text-purple-100">Based on your activity patterns and engagement</p>
        </div>

        {/* Career Paths */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Suggested Career Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations?.career_paths?.map((path, idx) => (
              <div key={idx} className="border-2 border-purple-200 p-6 rounded-lg hover:border-purple-500 transition">
                <div className="text-4xl mb-3">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
                <h3 className="font-bold text-lg text-gray-800">{path}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {idx === 0 ? 'Best match based on your activities' : 
                   idx === 1 ? 'Strong alternative path' : 
                   'Emerging opportunity'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Roadmap */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">📅 Weekly Roadmap</h2>
          <div className="space-y-4">
            {Object.entries(recommendations?.weekly_roadmap || {}).map(([week, task]) => (
              <div key={week} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {week.replace('_', ' ').toUpperCase()}
                </div>
                <p className="text-gray-700 flex-1">{task}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">📊 Progress Summary</h2>
          <p className="text-lg text-gray-700">{recommendations?.progress_summary}</p>
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r">
            <p className="text-green-800 font-medium">
              💡 Keep completing activities to refine your recommendations!
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Recommendations;
