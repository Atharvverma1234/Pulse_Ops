// frontend/src/components/ai/AnomalyScoreChart.jsx
import { useEffect, useState }  from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import api from '../../utils/api';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0f1629] border border-indigo-900 rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400">
        {new Date(d.timestamp).toLocaleTimeString()}
      </p>
      <p className={`font-bold mt-1 ${d.isAnomaly ? 'text-red-400' : 'text-green-400'}`}>
        Score: {(d.anomalyScore * 100).toFixed(1)}
        {d.isAnomaly ? ' ⚠ ANOMALY' : ' ✓ Normal'}
      </p>
      <p className="text-slate-500 mt-0.5">
        CPU {d.cpu?.toFixed(0)}% · MEM {d.memory?.toFixed(0)}%
      </p>
    </div>
  );
};

export default function AnomalyScoreChart({ host }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!host) return;
    let active = true;
    const loadingTimer = setTimeout(() => {
      if (active) setLoading(true);
    }, 0);

    api.get(`/ai/score-history/${host}?limit=40`)
      .then((res) => {
        if (active) setData(res.data.data);
      })
      .catch((err) => {
        if (active) console.error(err);
      })
      .finally(() => {
        clearTimeout(loadingTimer);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(loadingTimer);
    };
  }, [host]);

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p className="text-slate-600 text-xs">Loading score history...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p className="text-slate-600 text-xs">
          No AI scores yet — waiting for metrics
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(t) =>
            new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
          tick={{ fill: '#475569', fontSize: 9 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}`}
          tick={{ fill: '#475569', fontSize: 9 }}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* Threshold line at 0.68 (approx) */}
        <ReferenceLine
          y={0.68}
          stroke="#ef4444"
          strokeDasharray="4 2"
          label={{ value: 'Threshold', fill: '#ef4444', fontSize: 9 }}
        />

        <Area
          type="monotone"
          dataKey="anomalyScore"
          stroke="#f59e0b"
          fill="url(#scoreGrad)"
          strokeWidth={2}
          dot={(props) => {
            if (!props.payload.isAnomaly) return null;
            return (
              <circle
                key={props.key}
                cx={props.cx}
                cy={props.cy}
                r={4}
                fill="#ef4444"
                stroke="#ef4444"
              />
            );
          }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}