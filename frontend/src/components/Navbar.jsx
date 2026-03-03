import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Career Transition Platform</Link>
        {user && (
          <div className="flex gap-4 items-center">
            <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/activities" className="hover:text-blue-200">Activities</Link>
            <Link to="/profile" className="hover:text-blue-200">Profile</Link>
            <Link to="/analytics" className="hover:text-blue-200">Analytics</Link>
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
