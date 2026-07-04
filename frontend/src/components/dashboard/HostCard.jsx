// frontend/src/components/dashboard/HostCard.jsx
import MetricChart from './MetricChart';
import StatsBar from './StatsBar';
import Badge from '../ui/Badge';

const getStatusColor = (cpu, memory) => {
  if (cpu >= 90 || memory >= 90) return { label: 'Critical', color: 'red' };
  if (cpu >= 75 || memory >= 75) return { label: 'Warning',  color: 'yellow' };
  return                                 { label: 'Healthy',  color: 'green' };
};

const formatTime = (ts) => {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleTimeString();
};

export default function HostCard({ host, latest, history }) {
  if (!latest) return null;

  const status = getStatusColor(latest.cpu, latest.memory);

  return (
    <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5 flex flex-col gap-4 hover:border-indigo-700/60 transition-colors">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">{host}</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {latest.service || 'system'} · Last seen {formatTime(latest.timestamp)}
          </p>
        </div>
        <Badge label={status.label} color={status.color} />
      </div>

      {/* Stats bars */}
      <div className="flex flex-col gap-3">
        <StatsBar label="CPU"    value={latest.cpu}    />
        <StatsBar label="Memory" value={latest.memory} />
        <StatsBar label="Disk"   value={latest.disk}   />
      </div>

      {/* Network */}
      <div className="flex gap-4 text-xs text-slate-500 border-t border-indigo-900/30 pt-3">
        <span>↓ {((latest.network?.in || 0) / 1024).toFixed(1)} KB/s</span>
        <span>↑ {((latest.network?.out || 0) / 1024).toFixed(1)} KB/s</span>
      </div>

      {/* Charts */}
      {history.length > 1 && (
        <div className="grid grid-cols-1 gap-3">
          <MetricChart data={history} metricKey="cpu"    label="CPU History"    />
          <MetricChart data={history} metricKey="memory" label="Memory History" />
          <MetricChart data={history} metricKey="disk"   label="Disk History"   />
        </div>
      )}

      {history.length <= 1 && (
        <p className="text-slate-600 text-xs text-center py-2">
          Collecting chart data...
        </p>
      )}
    </div>
  );
}