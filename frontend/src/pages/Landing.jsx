import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center backdrop-blur-sm bg-white/10">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🚀</div>
          <h1 className="text-3xl font-bold text-white">CareerBoost</h1>
        </div>
        <div className="space-x-4">
          <button onClick={() => navigate('/login')} className="px-6 py-2 text-white font-semibold hover:text-blue-200 transition">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition transform">
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-white">
        <div className="text-center mb-20">
          <div className="inline-block mb-6 px-6 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30">
            <span className="text-blue-300 font-semibold">✨ AI-Powered Career Platform</span>
          </div>
          <h2 className="text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Transform Your Career Journey
          </h2>
          <p className="text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Master new skills, track your progress, and achieve your career goals with personalized guidance and gamified learning
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition transform">
              Start Learning Now →
            </button>
            <button onClick={() => navigate('/login')} className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-lg border-2 border-white/20 hover:bg-white/20 transition">
              Sign In
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="group bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg p-8 rounded-3xl border border-blue-400/30 hover:border-blue-400/60 hover:shadow-2xl hover:scale-105 transition transform">
            <div className="text-6xl mb-6 group-hover:scale-110 transition transform">🎯</div>
            <h3 className="text-3xl font-bold mb-4">Structured Learning</h3>
            <p className="text-gray-300 text-lg leading-relaxed">Curated activities designed to build real-world skills with step-by-step guidance and personalized recommendations</p>
          </div>

          <div className="group bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg p-8 rounded-3xl border border-purple-400/30 hover:border-purple-400/60 hover:shadow-2xl hover:scale-105 transition transform">
            <div className="text-6xl mb-6 group-hover:scale-110 transition transform">📊</div>
            <h3 className="text-3xl font-bold mb-4">Smart Analytics</h3>
            <p className="text-gray-300 text-lg leading-relaxed">Track your progress with interactive charts, consistency scores, and detailed insights into your learning journey</p>
          </div>

          <div className="group bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-lg p-8 rounded-3xl border border-pink-400/30 hover:border-pink-400/60 hover:shadow-2xl hover:scale-105 transition transform">
            <div className="text-6xl mb-6 group-hover:scale-110 transition transform">🤖</div>
            <h3 className="text-3xl font-bold mb-4">AI-Powered</h3>
            <p className="text-gray-300 text-lg leading-relaxed">Get intelligent recommendations based on your goals, with ML and RAG integration coming soon</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-16 rounded-3xl border border-white/20">
          <h3 className="text-5xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Everything You Need to Succeed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-6 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition">
              <div className="text-5xl">✅</div>
              <div>
                <h4 className="font-bold text-2xl mb-3">Activity Lifecycle</h4>
                <p className="text-gray-300 text-lg">Start, pause, resume, and complete activities with full progress tracking and time management</p>
              </div>
            </div>
            <div className="flex items-start gap-6 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition">
              <div className="text-5xl">🔥</div>
              <div>
                <h4 className="font-bold text-2xl mb-3">Gamification</h4>
                <p className="text-gray-300 text-lg">Earn badges, maintain learning streaks, and achieve weekly goals to stay motivated</p>
              </div>
            </div>
            <div className="flex items-start gap-6 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition">
              <div className="text-5xl">📈</div>
              <div>
                <h4 className="font-bold text-2xl mb-3">Skill Tracking</h4>
                <p className="text-gray-300 text-lg">Watch your skills grow automatically with confidence scores and progression analytics</p>
              </div>
            </div>
            <div className="flex items-start gap-6 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition">
              <div className="text-5xl">💡</div>
              <div>
                <h4 className="font-bold text-2xl mb-3">Smart Recommendations</h4>
                <p className="text-gray-300 text-lg">Get personalized activity suggestions based on your goals, skills, and progress patterns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8">
            <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">100+</div>
            <p className="text-xl text-gray-300">Curated Activities</p>
          </div>
          <div className="p-8">
            <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">50+</div>
            <p className="text-xl text-gray-300">Skills to Master</p>
          </div>
          <div className="p-8">
            <div className="text-6xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">24/7</div>
            <p className="text-xl text-gray-300">Learning Access</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center bg-gradient-to-r from-blue-600 to-purple-600 p-16 rounded-3xl shadow-2xl">
          <h3 className="text-5xl font-bold mb-6">Ready to Transform Your Career?</h3>
          <p className="text-2xl mb-10 text-blue-100">Join thousands of professionals advancing their careers</p>
          <button onClick={() => navigate('/register')} className="px-12 py-6 bg-white text-purple-600 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition transform">
            Create Free Account →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-8 text-center text-gray-400">
        <p>© 2024 CareerBoost. Built for career growth and transitions.</p>
      </footer>
    </div>
  );
};

export default Landing;
