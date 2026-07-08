// frontend/src/pages/ai/AIIntelligence.jsx
import { useState }        from 'react';
import useRiskScores       from '../../hooks/useRiskScores';
import RiskSummaryPanel    from '../../components/ai/RiskSummaryPanel';
import AnomalyScoreChart   from '../../components/ai/AnomalyScoreChart';
import AIStatusBanner      from '../../components/ai/AIStatusBanner';
import RiskScoreBadge      from '../../components/ai/RiskScoreBadge';
import Spinner             from '../../components/ui/Spinner';
import api                 from '../../utils/api';

export default function AIIntelligence() {
  const {
    riskSummary, aiStatus, loading,
    getScoreColor,
  } = useRiskScores();

  const [selectedHost,  setSelectedHost]  = useState(null);
  const [anomalies,     setAnomalies]     = useState([]);
  const [anomalyLoad,   setAnomalyLoad]   = useState(false);
  const [testInput,     setTestInput]     = useState({
    cpu: 45, memory: 55, disk: 40, network_in: 800, network_out: 400,
  });
  const [testResult,    setTestResult]    = useState(null);
  const [testing,       setTesting]       = useState(false);

  const handleSelectHost = async (host) => {
    setSelectedHost(host);
    setAnomalyLoad(true);
    try {
      const res = await api.get(`/ai/anomalies?host=${host}&limit=20`);
      setAnomalies(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnomalyLoad(false);
    }
  };

  const handleTestPredict = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('http://localhost:8000/predict', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(testInput),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (e) =>
    setTestInput((prev) => ({
      ...prev,
      [e.target.name]: parseFloat(e.target.value),
    }));

  return (
    <div className="flex-1 overflow-y-auto p-6">

      {/* AI Status Banner */}
      <AIStatusBanner aiStatus={aiStatus} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">AI Intelligence</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Isolation Forest anomaly detection · real-time risk scoring
          </p>
        </div>
        {aiStatus?.modelStatus?.model_loaded && (
          <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-600/30 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-indigo-400 text-xs">
              Model active · {aiStatus.modelStatus.n_estimators} estimators
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left column — risk summary */}
          <div className="xl:col-span-1 flex flex-col gap-4">

            {/* Model info card */}
            {aiStatus?.modelStatus?.model_loaded && (
              <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-4">Model Info</h2>
                <dl className="flex flex-col gap-2">
                  {[
                    ['Type',        'Isolation Forest'],
                    ['Estimators',  aiStatus.modelStatus.n_estimators],
                    ['Threshold',   aiStatus.modelStatus.threshold?.toFixed(4)],
                    ['Train size',  aiStatus.modelStatus.train_size?.toLocaleString()],
                    ['Contamination', `${(aiStatus.modelStatus.contamination * 100).toFixed(1)}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="text-slate-300 font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Risk summary panel */}
            <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">
                Host Risk Scores
                <span className="text-slate-500 text-xs font-normal ml-2">
                  last 30 min
                </span>
              </h2>
              <RiskSummaryPanel
                riskSummary={riskSummary}
                onSelectHost={handleSelectHost}
              />
            </div>
          </div>

          {/* Right column — charts + details */}
          <div className="xl:col-span-2 flex flex-col gap-4">

            {/* Score history chart */}
            <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">
                  Anomaly Score History
                </h2>
                {selectedHost && (
                  <span className="text-indigo-400 text-sm">{selectedHost}</span>
                )}
              </div>
              {selectedHost ? (
                <AnomalyScoreChart host={selectedHost} />
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-slate-600 text-sm">
                    Select a host from the risk panel
                  </p>
                </div>
              )}
            </div>

            {/* Recent anomalies for selected host */}
            {selectedHost && (
              <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-4">
                  Recent Anomalies — {selectedHost}
                </h2>
                {anomalyLoad ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : anomalies.length === 0 ? (
                  <p className="text-slate-600 text-sm text-center py-8">
                    No anomalies detected for this host
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-indigo-900/40">
                          <th className="px-3 py-2 text-left text-slate-400 text-xs font-medium">Time</th>
                          <th className="px-3 py-2 text-left text-slate-400 text-xs font-medium">Score</th>
                          <th className="px-3 py-2 text-left text-slate-400 text-xs font-medium">CPU</th>
                          <th className="px-3 py-2 text-left text-slate-400 text-xs font-medium">Memory</th>
                          <th className="px-3 py-2 text-left text-slate-400 text-xs font-medium">Disk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {anomalies.map((a) => (
                          <tr
                            key={a._id}
                            className="border-b border-indigo-900/20 hover:bg-indigo-900/10"
                          >
                            <td className="px-3 py-2 text-slate-500 text-xs">
                              {new Date(a.timestamp).toLocaleTimeString()}
                            </td>
                            <td className={`px-3 py-2 font-bold text-xs ${getScoreColor(a.anomalyScore)}`}>
                              {(a.anomalyScore * 100).toFixed(1)}
                            </td>
                            <td className="px-3 py-2 text-slate-300 text-xs">
                              {a.cpu?.toFixed(1)}%
                            </td>
                            <td className="px-3 py-2 text-slate-300 text-xs">
                              {a.memory?.toFixed(1)}%
                            </td>
                            <td className="px-3 py-2 text-slate-300 text-xs">
                              {a.disk?.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Live predict tester */}
            <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-2">
                Live Predict Tester
              </h2>
              <p className="text-slate-500 text-xs mb-4">
                Send a metric directly to the AI service and see the anomaly score
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {[
                  { name: 'cpu',         label: 'CPU %',       max: 100 },
                  { name: 'memory',      label: 'Memory %',    max: 100 },
                  { name: 'disk',        label: 'Disk %',      max: 100 },
                  { name: 'network_in',  label: 'Net In',      max: 10000 },
                  { name: 'network_out', label: 'Net Out',     max: 10000 },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="text-slate-500 text-xs block mb-1">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      value={testInput[field.name]}
                      onChange={handleInputChange}
                      min={0}
                      max={field.max}
                      className="w-full bg-[#0f1629] text-white border border-indigo-900/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleTestPredict}
                  disabled={testing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {testing ? 'Predicting...' : 'Run Prediction'}
                </button>

                {/* Quick presets */}
                <button
                  onClick={() => setTestInput({
                    cpu: 95, memory: 92, disk: 88,
                    network_in: 6000, network_out: 4000,
                  })}
                  className="text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-2 rounded-lg text-xs transition-colors"
                >
                  Spike preset
                </button>
                <button
                  onClick={() => setTestInput({
                    cpu: 35, memory: 45, disk: 30,
                    network_in: 500, network_out: 200,
                  })}
                  className="text-green-400 border border-green-500/30 hover:bg-green-500/10 px-3 py-2 rounded-lg text-xs transition-colors"
                >
                  Normal preset
                </button>
              </div>

              {/* Result */}
              {testResult && (
                <div className={`mt-4 p-4 rounded-xl border flex items-center gap-4
                  ${testResult.is_anomaly
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <RiskScoreBadge score={testResult.anomaly_score} size="lg" />
                  <div>
                    <p className={`text-lg font-bold ${testResult.is_anomaly ? 'text-red-400' : 'text-green-400'}`}>
                      {testResult.is_anomaly ? '⚠ Anomaly Detected' : '✓ Normal'}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Score: {(testResult.anomaly_score * 100).toFixed(2)} ·
                      Severity: {testResult.severity} ·
                      Confidence: {testResult.confidence}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}