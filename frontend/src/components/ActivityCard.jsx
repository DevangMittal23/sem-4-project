const ActivityCard = ({ activity, status, onStart, onPause, onResume, onComplete, onViewDetails }) => {
  const getStatusBadge = () => {
    switch (status?.status) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">✓ Completed</span>;
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">⏳ In Progress</span>;
      case 'paused':
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">⏸ Paused</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Not Started</span>;
    }
  };

  const getActionButtons = () => {
    if (status?.status === 'completed') {
      return (
        <button
          onClick={() => onViewDetails(activity, status)}
          className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
        >
          View Submission
        </button>
      );
    }

    if (status?.status === 'in_progress') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onPause(activity.id)}
            className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
          >
            Pause
          </button>
          <button
            onClick={() => onComplete(activity)}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Complete
          </button>
        </div>
      );
    }

    if (status?.status === 'paused') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onResume(activity.id)}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Resume
          </button>
          <button
            onClick={() => onComplete(activity)}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Complete
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => onStart(activity.id)}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Start Activity
      </button>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold flex-1">{activity.title}</h3>
        {getStatusBadge()}
      </div>
      
      <p className="text-gray-600 mb-4">{activity.description}</p>
      
      <div className="flex gap-2 mb-4 text-sm">
        <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-medium">
          {activity.domain}
        </span>
        <span className="bg-green-100 px-3 py-1 rounded-full text-green-700 font-medium">
          {activity.difficulty}
        </span>
        <span className="text-gray-500">⏱️ {activity.estimated_time}h</span>
      </div>

      {status?.status === 'in_progress' && status.start_time && (
        <p className="text-sm text-gray-500 mb-3">
          Started: {new Date(status.start_time).toLocaleDateString()}
        </p>
      )}

      {getActionButtons()}
    </div>
  );
};

export default ActivityCard;
