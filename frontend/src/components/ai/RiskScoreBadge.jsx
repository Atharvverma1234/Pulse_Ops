// frontend/src/components/ai/RiskScoreBadge.jsx

const getRingColor = (score) => {
  if (score === null || score === undefined)
    return { ring: 'border-slate-700', text: 'text-slate-500', label: '—' };
  if (score >= 0.85)
    return { ring: 'border-red-500',    text: 'text-red-400',    label: 'CRITICAL' };
  if (score >= 0.65)
    return { ring: 'border-orange-500', text: 'text-orange-400', label: 'HIGH'     };
  if (score >= 0.45)
    return { ring: 'border-yellow-500', text: 'text-yellow-400', label: 'MEDIUM'   };
  return   { ring: 'border-green-500',  text: 'text-green-400',  label: 'LOW'      };
};

export default function RiskScoreBadge({ score, size = 'md' }) {
  const { ring, text, label } = getRingColor(score);

  const sizes = {
    sm: { outer: 'w-12 h-12', score: 'text-xs', label: 'hidden'  },
    md: { outer: 'w-16 h-16', score: 'text-sm', label: 'text-xs' },
    lg: { outer: 'w-20 h-20', score: 'text-lg', label: 'text-xs' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div
      className={`${s.outer} rounded-full border-2 ${ring} flex flex-col items-center justify-center`}
    >
      <span className={`font-bold ${text} ${s.score}`}>
        {score !== null && score !== undefined
          ? (score * 100).toFixed(0)
          : '—'}
      </span>
      <span className={`${text} ${s.label} font-medium leading-none mt-0.5`}>
        {score !== null ? label : ''}
      </span>
    </div>
  );
}