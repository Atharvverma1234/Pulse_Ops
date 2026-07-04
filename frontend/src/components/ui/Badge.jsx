// frontend/src/components/ui/Badge.jsx
export default function Badge({ label, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-600/20 text-indigo-400 border-indigo-600',
    green:  'bg-green-600/20  text-green-400  border-green-600',
    yellow: 'bg-yellow-600/20 text-yellow-400 border-yellow-600',
    red:    'bg-red-600/20    text-red-400    border-red-600',
    slate:  'bg-slate-600/20  text-slate-400  border-slate-600',
  };

  return (
    <span
      className={`inline-block border text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${colors[color]}`}
    >
      {label}
    </span>
  );
}