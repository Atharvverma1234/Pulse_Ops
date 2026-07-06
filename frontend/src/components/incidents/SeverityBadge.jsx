// frontend/src/components/incidents/SeverityBadge.jsx
import { SEVERITY_CONFIG } from '../../utils/incidentUtils';

const colorMap = {
  red:    'bg-red-500/10    text-red-400    border-red-500/30',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  green:  'bg-green-500/10  text-green-400  border-green-500/30',
};

export default function SeverityBadge({ severity }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border text-xs px-2.5 py-0.5 rounded-full font-medium ${colorMap[config.color]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}