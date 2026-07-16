// frontend/src/pages/incidents/IncidentDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api              from '../../utils/api';
import SeverityBadge    from '../../components/incidents/SeverityBadge';
import StatusBadge      from '../../components/incidents/StatusBadge';
import Spinner          from '../../components/ui/Spinner';
import { formatDate, timeAgo } from '../../utils/incidentUtils';
import RCAPanel from '../../components/rca/RCAPanel';

export default function IncidentDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [incident,   setIncident]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [note,       setNote]       = useState('');
  const [noteLoading,setNoteLoading]= useState(false);
  const [updating,   setUpdating]   = useState(false);
  const [rca, setRCA] = useState(null);

  const fetchIncident = async () => {
    try {
      const res = await api.get(`/incidents/${id}`);
      setIncident(res.data.data);
      setRCA(res.data.data.rca || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // perform load inside effect to avoid calling setState synchronously from an
    // effect body (define async loader and handle unmount)
    let isMounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/incidents/${id}`);
        if (!isMounted) return;
        setIncident(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      await api.patch(`/incidents/${id}`, { status });
      fetchIncident();
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setNoteLoading(true);
    try {
      await api.post(`/incidents/${id}/timeline`, { note });
      setNote('');
      fetchIncident();
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Incident not found
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">

      {/* Back button */}
      <button
        onClick={() => navigate('/incidents')}
        className="text-slate-500 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors"
      >
        ← Back to Incidents
      </button>

      {/* Header */}
      <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-6 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold mb-2">
              {incident.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge   status={incident.status}     />
              {incident.host && (
                <span className="text-slate-500 text-sm">
                  Host: <span className="text-slate-300">{incident.host}</span>
                </span>
              )}
            </div>
          </div>

          {/* Status actions */}
          <div className="flex flex-wrap gap-2">
            {incident.status !== 'investigating' && (
              <button
                disabled={updating}
                onClick={() => handleStatusChange('investigating')}
                className="border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                Start Investigating
              </button>
            )}
            {incident.status !== 'resolved' && (
              <button
                disabled={updating}
                onClick={() => handleStatusChange('resolved')}
                className="border border-green-500/40 text-green-400 hover:bg-green-500/10 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                Mark Resolved
              </button>
            )}
            {incident.status === 'resolved' && (
              <button
                disabled={updating}
                onClick={() => handleStatusChange('open')}
                className="border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                Reopen
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {incident.description && (
          <p className="text-slate-400 text-sm leading-relaxed">
            {incident.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Timeline</h2>

            {/* Add note */}
            <form onSubmit={handleAddNote} className="mb-6">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an investigation note..."
                rows={3}
                className="w-full bg-[#0f1629] text-white border border-indigo-900/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600 resize-none mb-2"
              />
              <button
                type="submit"
                disabled={noteLoading || !note.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40"
              >
                {noteLoading ? 'Adding...' : 'Add Note'}
              </button>
            </form>

            {/* Timeline entries */}
            <div className="flex flex-col gap-4">
              {[...incident.timeline].reverse().map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    {i < incident.timeline.length - 1 && (
                      <div className="w-px flex-1 bg-indigo-900/40 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-slate-300 text-sm">{entry.note}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {entry.addedBy?.name && (
                        <span className="text-slate-600 text-xs">
                          {entry.addedBy.name}
                        </span>
                      )}
                      <span className="text-slate-700 text-xs">·</span>
                      <span className="text-slate-600 text-xs">
                        {timeAgo(entry.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* RCA Panel */}
          <RCAPanel
             incidentId={id}
             existingRCA={rca}
             onRCAGenerated={(newRCA) => setRCA(newRCA)}
            />
        </div>

        {/* Sidebar metadata */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Details</h2>
            <dl className="flex flex-col gap-3">
              <DetailRow label="Status"   value={<StatusBadge   status={incident.status}     />} />
              <DetailRow label="Severity" value={<SeverityBadge severity={incident.severity} />} />
              <DetailRow label="Host"     value={incident.host || '—'} />
              <DetailRow
                label="Assigned to"
                value={incident.assignedTo?.name || 'Unassigned'}
              />
              <DetailRow
                label="Created"
                value={formatDate(incident.createdAt)}
              />
              <DetailRow
                label="Updated"
                value={formatDate(incident.updatedAt)}
              />
              {incident.resolvedAt && (
                <DetailRow
                  label="Resolved at"
                  value={formatDate(incident.resolvedAt)}
                />
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-slate-500 text-xs uppercase tracking-wider">{label}</dt>
      <dd className="text-slate-300 text-sm">{value}</dd>
    </div>
  );
}