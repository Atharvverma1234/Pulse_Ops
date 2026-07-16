// frontend/src/components/AppLayout.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Badge from './ui/Badge';
import AlertToast from './alerts/AlertToast';

const navItems = [
  { path: '/dashboard',  label: 'Dashboard',  icon: '◉' },
  { path: '/incidents',  label: 'Incidents',   icon: '⚠' },
  { path: '/alerts',    label: 'Alerts',     icon: '🔔' },
  { path: '/ai',        label: 'AI Intelligence', icon: '🧠' },
  { path: '/automation',  label: 'Automation',      icon: '⚡' },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#060912] text-white flex flex-col">

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-indigo-900/40 bg-[#0a0e1a] flex-shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold">PulseOps</span>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-slate-500 hover:text-white'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm hidden sm:block">
            {user?.name}
          </span>
          <Badge label={user?.role} color="indigo" />
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Page content */}
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
      <AlertToast />
    </div>
  );
}