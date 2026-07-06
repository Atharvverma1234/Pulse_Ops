// frontend/src/utils/incidentUtils.js
export const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: 'red',    dot: 'bg-red-500'    },
  high:     { label: 'High',     color: 'orange',  dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   color: 'yellow',  dot: 'bg-yellow-500' },
  low:      { label: 'Low',      color: 'green',   dot: 'bg-green-500'  },
};

export const STATUS_CONFIG = {
  open:          { label: 'Open',          color: 'red'    },
  investigating: { label: 'Investigating', color: 'yellow' },
  resolved:      { label: 'Resolved',      color: 'green'  },
};

export const formatDate = (ts) => {
  if (!ts) return '—';
  return new Date(ts).toLocaleString([], {
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (ts) => {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};