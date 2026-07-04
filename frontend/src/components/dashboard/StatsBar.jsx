// frontend/src/components/dashboard/StatsBar.jsx
const getColor = (value) => {
  if (value >= 90) return { bar: 'bg-red-500',    text: 'text-red-400'    };
  if (value >= 75) return { bar: 'bg-yellow-500', text: 'text-yellow-400' };
  return                  { bar: 'bg-green-500',  text: 'text-green-400'  };
};

export default function StatsBar({ label, value, unit = '%' }) {
  const color = getColor(value);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={`font-semibold ${color.text}`}>
          {value?.toFixed(1)}{unit}
        </span>
      </div>
      <div className="w-full bg-[#1a2040] rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${color.bar}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}