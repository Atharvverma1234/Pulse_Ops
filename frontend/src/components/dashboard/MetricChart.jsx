// frontend/src/components/dashboard/MetricChart.jsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  cpu:    { stroke: '#6366f1', fill: '#6366f120' },
  memory: { stroke: '#22d3ee', fill: '#22d3ee20' },
  disk:   { stroke: '#f59e0b', fill: '#f59e0b20' },
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1629] border border-indigo-900 rounded-lg px-3 py-2 text-sm">
        <p className="text-slate-400 mb-1">{formatTime(label)}</p>
        <p className="text-white font-semibold">
          {payload[0].value?.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function MetricChart({ data, metricKey, label }) {
  const chartData = data.map((m) => ({
    timestamp: m.timestamp,
    value:
      metricKey === 'cpu'
        ? m.cpu
        : metricKey === 'memory'
        ? m.memory
        : m.disk,
  }));

  const color = COLORS[metricKey];
  const latest = chartData[chartData.length - 1]?.value ?? 0;

  const getValueColor = (v) => {
    if (v >= 90) return 'text-red-400';
    if (v >= 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-[#0f1629] border border-indigo-900/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <span className={`text-lg font-bold ${getValueColor(latest)}`}>
          {latest.toFixed(1)}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color.stroke} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color.stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            tick={{ fill: '#475569', fontSize: 9 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 9 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color.stroke}
            fill={`url(#grad-${metricKey})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}