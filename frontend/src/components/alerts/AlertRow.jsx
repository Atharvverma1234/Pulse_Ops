// frontend/src/components/alerts/AlertRow.jsx
import { useNavigate }  from 'react-router-dom';
import SeverityBadge    from '../incidents/SeverityBadge';
import { timeAgo }      from '../../utils/incidentUtils';

const STATUS_STYLES = {
  active:       'bg-red-500/10    text-red-400    border-red-500/30',
  acknowledged: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  resolved:     'bg-green-500/10  text-green-400  border-green-500/30',
};

const METRIC_ICON = {
  cpu:     '🖥',
  memory:  '💾',
  disk:    '💿',
  network: '🌐',
};

export default function AlertRow({ alert, onAcknowledge, onResolve }) {
  const navigate = useNavigate();

  return (
    <tr className="border-b border-indigo-900/20 hover:bg-indigo-900/5 transition-colors">

      {/* Metric + Host */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{METRIC_ICON[alert.metricType] || '⚠'}</span>
          <div>
            <p className="text-white text-sm font-medium">
              {alert.metricType.toUpperCase()} on {alert.host}
            </p>
            <p className="text-slate-500 text-xs">
              {alert.triggeredValue?.toFixed(1)}% &gt; {alert.threshold}% threshold
            </p>
          </div>
        </div>
      </td>

      {/* Severity */}
      <td className="px-4 py-3">
        <SeverityBadge severity={alert.severity} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-block border text-xs px-2.5 py-0.5 rounded-full font-medium ${
            STATUS_STYLES[alert.status] || STATUS_STYLES.active
          }`}
        >
          {alert.status}
        </span>
      </td>

      {/* Linked incident */}
      <td className="px-4 py-3">
        {alert.incident ? (
          <button
            onClick={() => navigate(`/incidents/${alert.incident._id}`)}
            className="text-indigo-400 hover:text-indigo-300 text-xs underline underline-offset-2 transition-colors"
          >
            View incident
          </button>
        ) : (
          <span className="text-slate-600 text-xs">—</span>
        )}
      </td>

      {/* Age */}
      <td className="px-4 py-3 text-slate-500 text-xs">
        {timeAgo(alert.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {alert.status === 'active' && (
            <button
              onClick={() => onAcknowledge(alert._id)}
              className="text-xs border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 px-2 py-1 rounded-lg transition-colors"
            >
              Ack
            </button>
          )}
          {alert.status !== 'resolved' && (
            <button
              onClick={() => onResolve(alert._id)}
              className="text-xs border border-green-500/30 text-green-400 hover:bg-green-500/10 px-2 py-1 rounded-lg transition-colors"
            >
              Resolve
            </button>
          )}
          {alert.status === 'resolved' && (
            <span className="text-slate-600 text-xs">Resolved</span>
          )}
        </div>
      </td>
    </tr>
  );
}