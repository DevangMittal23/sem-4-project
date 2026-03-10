import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <nav className="p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Career Transition Platform</h1>
        <div className="space-x-4">
          <button onClick={() => navigate('/login')} className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-opacity-90">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="px-6 py-2 bg-purple-800 text-white rounded-lg font-semibold hover:bg-purple-900">
            Sign Up
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20 text-white">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-bold mb-6">Transform Your Career Journey</h2>
          <p className="text-2xl opacity-90 mb-8">AI-powered platform for career growth and job transitions</p>
          <button onClick={() => navigate('/register')} className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-opacity-90 transform hover:scale-105 transition">
            Get Started Free →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-3">Structured Activities</h3>
            <p className="opacity-90">Curated tasks to build skills and explore career paths with personalized recommendations</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-3">Progress Tracking</h3>
            <p className="opacity-90">Monitor completion patterns, consistency, and engagement with interactive analytics</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-3">AI-Ready Platform</h3>
            <p className="opacity-90">Get rule-based recommendations now, with AI/ML integration coming soon</p>
          </div>
        </div>

        <div className="mt-20 bg-white bg-opacity-10 backdrop-blur-lg p-12 rounded-2xl">
          <h3 className="text-3xl font-bold mb-6 text-center">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <h4 className="font-bold text-xl mb-2">Activity Management</h4>
                <p className="opacity-90">Browse, start, pause, and complete activities with full lifecycle tracking</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">🔥</span>
              <div>
                <h4 className="font-bold text-xl mb-2">Gamification</h4>
                <p className="opacity-90">Earn badges, maintain streaks, and achieve weekly goals</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">📈</span>
              <div>
                <h4 className="font-bold text-xl mb-2">Skill Tracking</h4>
                <p className="opacity-90">Watch your skills grow automatically as you complete activities</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">💡</span>
              <div>
                <h4 className="font-bold text-xl mb-2">Personalized Recommendations</h4>
                <p className="opacity-90">Get activity suggestions based on your goals and progress</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-20">
          <h3 className="text-3xl font-bold mb-4">Ready to start your journey?</h3>
          <button onClick={() => navigate('/register')} className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-opacity-90 transform hover:scale-105 transition">
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
