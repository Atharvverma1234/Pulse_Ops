// frontend/src/pages/incidents/IncidentList.jsx
import { useState } from 'react';
import useIncidents        from '../../hooks/useIncidents';
import IncidentRow         from '../../components/incidents/IncidentRow';
import IncidentFilters     from '../../components/incidents/IncidentFilters';
import CreateIncidentModal from '../../components/incidents/CreateIncidentModal';
import Spinner             from '../../components/ui/Spinner';

export default function IncidentList() {
  const {
    incidents, stats, loading, error,
    filters, pagination,
    updateFilter, createIncident,
  } = useIncidents();

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-6">

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total"          value={stats.total}                    color="text-indigo-400" />
          <StatCard label="Open"           value={stats.byStatus?.open || 0}      color="text-red-400"    />
          <StatCard label="Investigating"  value={stats.byStatus?.investigating || 0} color="text-yellow-400" />
          <StatCard label="Resolved"       value={stats.byStatus?.resolved || 0}  color="text-green-400"  />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Incidents</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pagination.total} total incidents
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          + Create Incident
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <IncidentFilters filters={filters} onFilter={updateFilter} />
      </div>

      {/* Table */}
      <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-16 text-sm">{error}</div>
        ) : incidents.length === 0 ? (
          <div className="text-slate-500 text-center py-16 text-sm">
            No incidents found
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-indigo-900/40 text-left">
                <th className="px-4 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Incident</th>
                <th className="px-4 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Severity</th>
                <th className="px-4 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Assigned</th>
                <th className="px-4 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Age</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <IncidentRow key={inc._id} incident={inc} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            disabled={filters.page <= 1}
            onClick={() => updateFilter('page', filters.page - 1)}
            className="px-3 py-1.5 text-sm text-slate-400 border border-indigo-900/60 rounded-lg hover:border-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-slate-500 text-sm">
            Page {filters.page} of {pagination.pages}
          </span>
          <button
            disabled={filters.page >= pagination.pages}
            onClick={() => updateFilter('page', filters.page + 1)}
            className="px-3 py-1.5 text-sm text-slate-400 border border-indigo-900/60 rounded-lg hover:border-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <CreateIncidentModal
          onClose={() => setShowModal(false)}
          onCreate={createIncident}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-xl px-4 py-3">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}