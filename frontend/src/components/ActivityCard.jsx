const ActivityCard = ({ activity, status, onStart, onPause, onResume, onComplete, onViewDetails }) => {
  const getStatusBadge = () => {
    switch (status?.status) {
      case 'completed':
        return <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full text-sm font-medium">✓ Completed</span>;
      case 'in_progress':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-sm font-medium">⏳ In Progress</span>;
      case 'paused':
        return <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-full text-sm font-medium">⏸ Paused</span>;
      default:
        return <span className="bg-white/10 text-gray-300 border border-white/10 px-3 py-1 rounded-full text-sm font-medium">Not Started</span>;
    }
  };

  const getActionButtons = () => {
    if (status?.status === 'completed') {
      return (
        <button
          onClick={() => onViewDetails(activity, status)}
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 font-semibold shadow-lg transition transform hover:scale-105"
        >
          👁️ View Submission
        </button>
      );
    }

    if (status?.status === 'in_progress') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onPause(activity.id)}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 font-semibold shadow-lg transition"
          >
            ⏸️ Pause
          </button>
          <button
            onClick={() => onComplete(activity)}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg transition"
          >
            ✅ Complete
          </button>
        </div>
      );
    }

    if (status?.status === 'paused') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onResume(activity.id)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transition"
          >
            ▶️ Resume
          </button>
          <button
            onClick={() => onComplete(activity)}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg transition"
          >
            ✅ Complete
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => onStart(activity.id)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105"
      >
        🚀 Start Activity
      </button>
    );
  };

  return (
    <div className="bg-white/[0.08] backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] transition-all duration-300 border border-white/[0.08] hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold flex-1 text-gray-100">{activity.title}</h3>
        {getStatusBadge()}
      </div>
      
      <p className="text-slate-400 mb-4 line-clamp-2">{activity.description}</p>
      
      <div className="flex gap-2 mb-4 text-sm flex-wrap">
        <span className="bg-blue-500/25 border border-blue-400/30 px-3 py-1 rounded-full text-blue-300 font-semibold">
          {activity.domain}
        </span>
        <span className="bg-emerald-500/25 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-300 font-semibold">
          {activity.difficulty}
        </span>
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <span>⏱️</span> {activity.estimated_time}h
        </span>
      </div>

      {status?.status === 'in_progress' && status.start_time && (
        <p className="text-sm text-blue-300 mb-3 bg-blue-500/15 border border-blue-500/20 px-3 py-2 rounded-lg">
          🚀 Started: {new Date(status.start_time).toLocaleDateString()}
        </p>
      )}

      {getActionButtons()}
    </div>
  );
};

export default ActivityCard;
