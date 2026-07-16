// backend/services/rca/contextBuilder.js
const Metric   = require('../../models/Metric');
const Alert    = require('../../models/Alert');
const Incident = require('../../models/Incident');

// ── Build full context for RCA ────────────────
const buildRCAContext = async (incidentId) => {
  const incident = await Incident.findById(incidentId)
    .populate('assignedTo',       'name email')
    .populate('timeline.addedBy', 'name');

  if (!incident) throw new Error('Incident not found');

  const contextWindow = {
    start: new Date(incident.createdAt.getTime() - 15 * 60 * 1000), // 15 min before
    end:   new Date(incident.createdAt.getTime() + 30 * 60 * 1000), // 30 min after
  };

  // ── Fetch metrics around incident time ────────
  const metricFilter = {
    timestamp: {
      $gte: contextWindow.start,
      $lte: contextWindow.end,
    },
  };
  if (incident.host) metricFilter.host = incident.host;

  const metrics = await Metric.find(metricFilter)
    .sort({ timestamp: 1 })
    .limit(50);

  // ── Fetch alerts around same time ─────────────
  const alerts = await Alert.find({
    createdAt: {
      $gte: contextWindow.start,
      $lte: contextWindow.end,
    },
    ...(incident.host ? { host: incident.host } : {}),
  }).sort({ createdAt: 1 });

  // ── Compute metric statistics ─────────────────
  let metricStats = null;
  if (metrics.length > 0) {
    const cpuValues    = metrics.map((m) => m.cpu);
    const memValues    = metrics.map((m) => m.memory);
    const diskValues   = metrics.map((m) => m.disk);
    const anomalies    = metrics.filter((m) => m.isAnomaly);

    metricStats = {
      cpu: {
        avg: average(cpuValues).toFixed(1),
        max: Math.max(...cpuValues).toFixed(1),
        min: Math.min(...cpuValues).toFixed(1),
      },
      memory: {
        avg: average(memValues).toFixed(1),
        max: Math.max(...memValues).toFixed(1),
        min: Math.min(...memValues).toFixed(1),
      },
      disk: {
        avg: average(diskValues).toFixed(1),
        max: Math.max(...diskValues).toFixed(1),
        min: Math.min(...diskValues).toFixed(1),
      },
      anomalyCount:    anomalies.length,
      totalReadings:   metrics.length,
      anomalyRate:     metrics.length > 0
        ? ((anomalies.length / metrics.length) * 100).toFixed(1)
        : 0,
      peakAnomalyScore: anomalies.length > 0
        ? Math.max(...anomalies.map((m) => m.anomalyScore || 0)).toFixed(4)
        : null,
    };
  }

  // ── Format timeline ───────────────────────────
  const timeline = incident.timeline.map((t) => ({
    note:    t.note,
    by:      t.addedBy?.name || 'System',
    at:      t.createdAt,
  }));

  return {
    incident: {
      id:          incident._id,
      title:       incident.title,
      description: incident.description,
      severity:    incident.severity,
      status:      incident.status,
      host:        incident.host,
      createdAt:   incident.createdAt,
      resolvedAt:  incident.resolvedAt,
    },
    metricStats,
    alerts: alerts.map((a) => ({
      metricType:     a.metricType,
      triggeredValue: a.triggeredValue,
      threshold:      a.threshold,
      severity:       a.severity,
      at:             a.createdAt,
    })),
    timeline,
    contextWindow,
    rawMetricCount: metrics.length,
    rawAlertCount:  alerts.length,
  };
};

const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

module.exports = { buildRCAContext };