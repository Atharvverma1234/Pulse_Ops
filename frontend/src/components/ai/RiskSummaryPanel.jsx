// frontend/src/components/ai/RiskSummaryPanel.jsx
import RiskScoreBadge from './RiskScoreBadge';

const RISK_COLORS = {
  critical: 'border-red-500/40    bg-red-500/5',
  high:     'border-orange-500/40 bg-orange-500/5',
  medium:   'border-yellow-500/40 bg-yellow-500/5',
  low:      'border-green-500/40  bg-green-500/5',
};

const RISK_TEXT = {
  critical: 'text-red-400',
  high:     'text-orange-400',
  medium:   'text-yellow-400',
  low:      'text-green-400',
};

export default function RiskSummaryPanel({ riskSummary, onSelectHost }) {
  if (!riskSummary || riskSummary.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-slate-600 text-sm">
          Waiting for AI scores...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {riskSummary.map((host) => (
        <button
          key={host._id}
          onClick={() => onSelectHost && onSelectHost(host._id)}
          className={`flex items-center gap-4 p-3 rounded-xl border text-left
            hover:brightness-110 transition-all
            ${RISK_COLORS[host.riskLevel] || RISK_COLORS.low}`}
        >
          {/* Risk score ring */}
          <RiskScoreBadge score={host.latestScore} size="sm" />

          {/* Host info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {host._id}
            </p>
            <p className={`text-xs font-semibold mt-0.5 uppercase ${RISK_TEXT[host.riskLevel]}`}>
              {host.riskLevel} risk
            </p>
            <p className="text-slate-600 text-xs mt-0.5">
              {host.anomalyCount} anomalies ·{' '}
              {(host.anomalyRate * 100).toFixed(0)}% rate
            </p>
          </div>

          {/* Max score */}
          <div className="text-right flex-shrink-0">
            <p className="text-slate-500 text-xs">max</p>
            <p className={`text-sm font-bold ${RISK_TEXT[host.riskLevel]}`}>
              {(host.maxAnomalyScore * 100).toFixed(0)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}