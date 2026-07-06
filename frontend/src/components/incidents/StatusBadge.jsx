// frontend/src/components/incidents/StatusBadge.jsx
import { STATUS_CONFIG } from '../../utils/incidentUtils';

const colorMap = {
  red:    'bg-red-500/10    text-red-400    border-red-500/30',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  green:  'bg-green-500/10  text-green-400  border-green-500/30',
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span
      className={`inline-block border text-xs px-2.5 py-0.5 rounded-full font-medium ${colorMap[config.color]}`}
    >
      {config.label}
    </span>
  );
}