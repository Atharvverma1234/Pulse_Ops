// frontend/src/components/alerts/AlertFilters.jsx
export default function AlertFilters({ filters, onFilter }) {
  return (
    <div className="flex flex-wrap gap-3">

      <select
        value={filters.status}
        onChange={(e) => onFilter('status', e.target.value)}
        className="bg-[#0f1629] text-white border border-indigo-900/60 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="acknowledged">Acknowledged</option>
        <option value="resolved">Resolved</option>
      </select>

      <select
        value={filters.severity}
        onChange={(e) => onFilter('severity', e.target.value)}
        className="bg-[#0f1629] text-white border border-indigo-900/60 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
      >
        <option value="">All Severities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <input
        type="text"
        placeholder="Filter by host..."
        value={filters.host}
        onChange={(e) => onFilter('host', e.target.value)}
        className="bg-[#0f1629] text-white border border-indigo-900/60 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600 w-44"
      />

      {(filters.status || filters.severity || filters.host) && (
        <button
          onClick={() => {
            onFilter('status',   '');
            onFilter('severity', '');
            onFilter('host',     '');
          }}
          className="text-slate-500 hover:text-red-400 text-sm transition-colors px-2"
        >
          Clear
        </button>
      )}
    </div>
  );
}