// frontend/src/components/rca/RCAPanel.jsx
import { useState }      from 'react';
import ConfidenceBadge   from './ConfidenceBadge';
import Spinner           from '../ui/Spinner';
import api               from '../../utils/api';

export default function RCAPanel({ incidentId, existingRCA, onRCAGenerated }) {
  const [rca,       setRCA]       = useState(existingRCA || null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [expanded,  setExpanded]  = useState(true);

  const handleGenerate = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/rca/${incidentId}/generate${force ? '?force=true' : ''}`;
      const res = await api.post(url);
      setRCA(res.data.data);
      if (onRCAGenerated) onRCAGenerated(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate RCA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl overflow-hidden">

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🧠</span>
          <div>
            <h2 className="text-white font-semibold">AI Root Cause Analysis</h2>
            {rca?.generatedAt && (
              <p className="text-slate-500 text-xs">
                Generated {new Date(rca.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rca && <ConfidenceBadge confidence={rca.confidence} />}
          <span className="text-slate-500 text-sm">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-indigo-900/30">

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Spinner size="md" />
              <p className="text-slate-500 text-sm">
                Analyzing incident data with Groq LLM...
              </p>
              <p className="text-slate-600 text-xs">
                Correlating metrics, alerts and timeline
              </p>
            </div>
          )}

          {/* No RCA yet */}
          {!loading && !rca && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="text-4xl">🔍</div>
              <p className="text-slate-400 text-sm text-center">
                No root cause analysis generated yet.
              </p>
              <p className="text-slate-600 text-xs text-center max-w-sm">
                AI will analyze metric anomalies, alert patterns, and 
                investigation timeline to identify the most likely cause.
              </p>
              <button
                onClick={() => handleGenerate(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Generate RCA
              </button>
            </div>
          )}

          {/* RCA content */}
          {!loading && rca && (
            <div className="mt-4 flex flex-col gap-4">

              {/* Summary */}
              <RCASection
                icon="📋"
                title="Summary"
                color="indigo"
              >
                <p className="text-slate-300 text-sm leading-relaxed">
                  {rca.summary}
                </p>
              </RCASection>

              {/* Root Cause */}
              <RCASection
                icon="🎯"
                title="Root Cause"
                color="red"
              >
                <p className="text-slate-300 text-sm leading-relaxed">
                  {rca.rootCause}
                </p>
              </RCASection>

              {/* Impact */}
              <RCASection
                icon="💥"
                title="Impact"
                color="orange"
              >
                <p className="text-slate-300 text-sm leading-relaxed">
                  {rca.impact}
                </p>
              </RCASection>

              {/* Recommendations */}
              <RCASection
                icon="✅"
                title="Recommendations"
                color="green"
              >
                <ul className="flex flex-col gap-2">
                  {rca.recommendations?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-slate-300 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </RCASection>

              {/* Confidence + Context */}
              <div className="bg-[#0f1629] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs uppercase tracking-wider">
                    Confidence
                  </span>
                  <ConfidenceBadge confidence={rca.confidence} />
                </div>
                <p className="text-slate-500 text-xs">{rca.confidenceReason}</p>

                {rca.context && (
                  <div className="flex gap-4 mt-3 pt-3 border-t border-indigo-900/30">
                    <ContextStat
                      label="Metrics analysed"
                      value={rca.context.metricCount}
                    />
                    <ContextStat
                      label="Alerts correlated"
                      value={rca.context.alertCount}
                    />
                    {rca.context.metricStats?.anomalyRate && (
                      <ContextStat
                        label="Anomaly rate"
                        value={`${rca.context.metricStats.anomalyRate}%`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Regenerate button */}
              <button
                onClick={() => handleGenerate(true)}
                disabled={loading}
                className="w-full border border-indigo-900/60 text-slate-400 hover:text-white hover:border-indigo-500 py-2 rounded-xl text-sm transition-colors disabled:opacity-40"
              >
                ↻ Regenerate RCA
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────
function RCASection({ icon, title, color, children }) {
  const borderColors = {
    indigo: 'border-indigo-500/30',
    red:    'border-red-500/30',
    orange: 'border-orange-500/30',
    green:  'border-green-500/30',
  };
  const iconBg = {
    indigo: 'bg-indigo-500/10',
    red:    'bg-red-500/10',
    orange: 'bg-orange-500/10',
    green:  'bg-green-500/10',
  };

  return (
    <div className={`border rounded-xl p-4 ${borderColors[color] || borderColors.indigo}`}>
      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium mb-3 ${iconBg[color]}`}>
        <span>{icon}</span>
        <span className="text-slate-300 uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ContextStat({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-slate-600 text-xs">{label}</span>
      <span className="text-slate-300 text-sm font-semibold">{value ?? '—'}</span>
    </div>
  );
}