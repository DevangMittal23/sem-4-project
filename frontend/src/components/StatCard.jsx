const StatCard = ({ icon, label, value, color = 'blue', trend }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
    </div>
  );
};

export default StatCard;
