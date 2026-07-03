// frontend/src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">PulseOps Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-[#0f1629] border border-indigo-900 rounded-2xl p-6">
          <h2 className="text-lg text-slate-400 mb-2">Welcome back,</h2>
          <p className="text-2xl font-semibold">{user?.name}</p>
          <p className="text-slate-400 mt-1">{user?.email}</p>
          <span className="inline-block mt-3 bg-indigo-600/20 text-indigo-400 border border-indigo-600 text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            {user?.role}
          </span>
        </div>

        <p className="text-slate-500 text-center mt-12">
          Monitoring dashboard coming in Week 4 🚀
        </p>
      </div>
    </div>
  );
}