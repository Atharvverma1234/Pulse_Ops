// backend/config/alertRules.js

const ALERT_RULES = [
  {
    id:          'cpu-critical',
    metricType:  'cpu',
    field:       'cpu',
    threshold:   90,
    severity:    'critical',
    message:     (host, val) => `CPU critical on ${host}: ${val.toFixed(1)}%`,
    cooldown:    5 * 60 * 1000, // 5 minutes between repeated alerts
  },
  {
    id:          'cpu-high',
    metricType:  'cpu',
    field:       'cpu',
    threshold:   75,
    severity:    'high',
    message:     (host, val) => `CPU high on ${host}: ${val.toFixed(1)}%`,
    cooldown:    10 * 60 * 1000,
  },
  {
    id:          'memory-critical',
    metricType:  'memory',
    field:       'memory',
    threshold:   90,
    severity:    'critical',
    message:     (host, val) => `Memory critical on ${host}: ${val.toFixed(1)}%`,
    cooldown:    5 * 60 * 1000,
  },
  {
    id:          'memory-high',
    metricType:  'memory',
    field:       'memory',
    threshold:   75,
    severity:    'high',
    message:     (host, val) => `Memory high on ${host}: ${val.toFixed(1)}%`,
    cooldown:    10 * 60 * 1000,
  },
  {
    id:          'disk-critical',
    metricType:  'disk',
    field:       'disk',
    threshold:   85,
    severity:    'critical',
    message:     (host, val) => `Disk critical on ${host}: ${val.toFixed(1)}%`,
    cooldown:    15 * 60 * 1000,
  },
  {
    id:          'disk-high',
    metricType:  'disk',
    field:       'disk',
    threshold:   70,
    severity:    'high',
    message:     (host, val) => `Disk high on ${host}: ${val.toFixed(1)}%`,
    cooldown:    15 * 60 * 1000,
  },
];

module.exports = ALERT_RULES;