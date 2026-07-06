// frontend/src/components/incidents/IncidentFilters.jsx
export default function IncidentFilters({ filters, onFilter }) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <input
        type="text"
        placeholder="Search incidents..."
        value={filters.search}
        onChange={(e) => onFilter('search', e.target.value)}
        className="bg-[#0f1629] text-white border border-indigo-900/60 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600 w-56"
      />

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => onFilter('status', e.target.value)}
        className="bg-[#0f1629] text-white border border-indigo-900/60 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
      >
        <option value="">All Statuses</option>
        <option value="open">Open</option>
        <option value="investigating">Investigating</option>
        <option value="resolved">Resolved</option>
      </select>

      {/* Severity filter */}
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

      {/* Clear filters */}
      {(filters.status || filters.severity || filters.search) && (
        <button
          onClick={() => {
            onFilter('status',   '');
            onFilter('severity', '');
            onFilter('search',   '');
          }}
          className="text-slate-500 hover:text-red-400 text-sm transition-colors px-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}