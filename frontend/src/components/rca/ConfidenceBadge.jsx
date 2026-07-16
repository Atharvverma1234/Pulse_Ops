// frontend/src/components/rca/ConfidenceBadge.jsx
const CONFIG = {
  high:   { color: 'bg-green-500/10  text-green-400  border-green-500/30',  label: 'High Confidence'   },
  medium: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', label: 'Medium Confidence' },
  low:    { color: 'bg-slate-500/10  text-slate-400  border-slate-500/30',  label: 'Low Confidence'    },
};

export default function ConfidenceBadge({ confidence }) {
  const cfg = CONFIG[confidence] || CONFIG.low;
  return (
    <span className={`inline-block border text-xs px-2.5 py-0.5 rounded-full font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}