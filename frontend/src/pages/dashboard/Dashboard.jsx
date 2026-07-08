// frontend/src/pages/dashboard/Dashboard.jsx
import { useState }     from 'react';
import { useNavigate }  from 'react-router-dom';
import useMetrics       from '../../hooks/useMetrics';
import useRiskScores    from '../../hooks/useRiskScores';
import HostCard         from '../../components/dashboard/HostCard';
import HostList         from '../../components/dashboard/HostList';
import Spinner          from '../../components/ui/Spinner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { hosts, getLatest, getHistory, connected, lastUpdated } = useMetrics();
  const { getRisk } = useRiskScores();
  const [selectedHost, setSelectedHost] = useState(null);

  const displayedHosts = selectedHost ? [selectedHost] : hosts;

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-[#0a0e1a] border-r border-indigo-900/40 p-4 flex flex-col gap-4 overflow-y-auto">

        <div className="flex items-center gap-2 px-1">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-slate-500">
            {connected ? 'Live' : 'Disconnected'}
          </span>
          {lastUpdated && (
            <span className="text-xs text-slate-700 ml-auto">
              {lastUpdated.toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
              })}
            </span>
          )}
        </div>

        <div className="flex-1">
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

        <div className="border-t border-indigo-900/30 pt-4 flex flex-col gap-1">
          <button
            onClick={() => navigate('/incidents')}
            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-white hover:bg-indigo-900/20 text-sm transition-colors"
          >
            <span>⚠</span> View Incidents
          </button>
          <button
            onClick={() => navigate('/ai')}
            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-white hover:bg-indigo-900/20 text-sm transition-colors"
          >
            <span>🧠</span> AI Intelligence
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto p-6">

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
              onClick={() => navigate('/incidents')}
            />
            <SummaryCard
              label="Warning"
              value={
                hosts.filter((h) => {
                  const l = getLatest(h);
                  return (
                    l &&
                    (l.cpu >= 75 || l.memory >= 75) &&
                    l.cpu < 90 && l.memory < 90
                  );
                }).length
              }
              color="text-yellow-400"
            />
            <SummaryCard
              label="AI Anomalies"
              value={
                hosts.filter((h) => getRisk(h)?.isAnomaly).length
              }
              color="text-orange-400"
              onClick={() => navigate('/ai')}
            />
          </div>
        )}

        {hosts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Spinner size="lg" />
            <p className="text-slate-500 text-sm">Waiting for metrics...</p>
            <p className="text-slate-600 text-xs">
              Run the simulator: node simulator/simulate.js
            </p>
          </div>
        )}

        {displayedHosts.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
            {displayedHosts.map((host) => (
              <HostCard
                key={host}
                host={host}
                latest={getLatest(host)}
                history={getHistory(host)}
                risk={getRisk(host)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0a0e1a] border border-indigo-900/40 rounded-xl px-4 py-3 ${
        onClick ? 'cursor-pointer hover:border-indigo-700/60 transition-colors' : ''
      }`}
    >
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}