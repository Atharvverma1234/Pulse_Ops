// frontend/src/pages/dashboard/Dashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useMetrics from '../../hooks/useMetrics';
import HostCard from '../../components/dashboard/HostCard';
import HostList from '../../components/dashboard/HostList';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { hosts, getLatest, getHistory, connected, lastUpdated } = useMetrics();
  const [selectedHost, setSelectedHost] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show selected host only, or all hosts if none selected
  const displayedHosts = selectedHost ? [selectedHost] : hosts;

  return (
    <div className="min-h-screen bg-[#060912] text-white flex flex-col">

      {/* ── Top Navbar ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-indigo-900/40 bg-[#0a0e1a]">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">PulseOps</span>
          <span className="text-slate-600 text-sm hidden sm:block">
            / Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-slate-500 hidden sm:block">
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>

          {lastUpdated && (
            <span className="text-xs text-slate-600 hidden md:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          <Badge label={user?.role} color="indigo" />

          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-56 flex-shrink-0 bg-[#0a0e1a] border-r border-indigo-900/40 p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">
              Hosts ({hosts.length})
            </p>
            <HostList
              hosts={hosts}
              getLatest={getLatest}
              selectedHost={selectedHost}
              onSelect={(h) =>
                setSelectedHost((prev) => (prev === h ? null : h))
              }
            />
          </div>

          <div className="mt-auto pt-4 border-t border-indigo-900/30">
            <p className="text-slate-600 text-xs text-center">
              Week 5: Incidents coming soon
            </p>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* Summary strip */}
          {hosts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <SummaryCard
                label="Total Hosts"
                value={hosts.length}
                color="text-indigo-400"
              />
              <SummaryCard
                label="Critical"
                value={
                  hosts.filter((h) => {
                    const l = getLatest(h);
                    return l && (l.cpu >= 90 || l.memory >= 90);
                  }).length
                }
                color="text-red-400"
              />
              <SummaryCard
                label="Warning"
                value={
                  hosts.filter((h) => {
                    const l = getLatest(h);
                    return (
                      l &&
                      (l.cpu >= 75 || l.memory >= 75) &&
                      l.cpu < 90 &&
                      l.memory < 90
                    );
                  }).length
                }
                color="text-yellow-400"
              />
              <SummaryCard
                label="Healthy"
                value={
                  hosts.filter((h) => {
                    const l = getLatest(h);
                    return l && l.cpu < 75 && l.memory < 75;
                  }).length
                }
                color="text-green-400"
              />
            </div>
          )}

          {/* No data state */}
          {hosts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Spinner size="lg" />
              <p className="text-slate-500 text-sm">
                Waiting for metrics...
              </p>
              <p className="text-slate-600 text-xs">
                Run the simulator: node simulator/simulate.js
              </p>
            </div>
          )}

          {/* Host cards grid */}
          {displayedHosts.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
              {displayedHosts.map((host) => (
                <HostCard
                  key={host}
                  host={host}
                  latest={getLatest(host)}
                  history={getHistory(host)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Small inline summary card ─────────────────
function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-xl px-4 py-3">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}