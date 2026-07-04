// frontend/src/components/dashboard/HostList.jsx
const getDot = (cpu, memory) => {
  if (cpu >= 90 || memory >= 90) return 'bg-red-500';
  if (cpu >= 75 || memory >= 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

export default function HostList({ hosts, getLatest, selectedHost, onSelect }) {
  if (hosts.length === 0) {
    return (
      <div className="text-slate-600 text-sm text-center py-8">
        No hosts connected yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {hosts.map((host) => {
        const latest = getLatest(host);
        if (!latest) return null;

        const dot = getDot(latest.cpu, latest.memory);
        const isSelected = selectedHost === host;

        return (
          <button
            key={host}
            onClick={() => onSelect(host)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors
              ${isSelected
                ? 'bg-indigo-600/20 border border-indigo-600/50'
                : 'hover:bg-[#0f1629] border border-transparent'
              }`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{host}</p>
              <p className="text-slate-500 text-xs">
                CPU {latest.cpu?.toFixed(0)}% · MEM {latest.memory?.toFixed(0)}%
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}