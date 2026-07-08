// backend/services/anomalyProcessor.js
const Metric   = require('../models/Metric');
const Incident = require('../models/Incident');
const { predictAnomalyBulk } = require('../utils/aiClient');

let _io = null;

const setIO = (io) => { _io = io; };

// Cooldown tracker — prevent duplicate AI incidents
// key: host → last incident created timestamp
const incidentCooldown = new Map();
const INCIDENT_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

const isOnIncidentCooldown = (host) => {
  const last = incidentCooldown.get(host);
  if (!last) return false;
  return Date.now() - last < INCIDENT_COOLDOWN_MS;
};

const markIncidentCreated = (host) => {
  incidentCooldown.set(host, Date.now());
};

// ── Main entry point ──────────────────────────
const processAnomalies = async (savedMetrics) => {
  if (!savedMetrics || savedMetrics.length === 0) return;

  // Call AI service bulk endpoint
  const aiResult = await predictAnomalyBulk(savedMetrics);

  if (!aiResult || !aiResult.results) {
    console.warn('[AnomalyProcessor] No AI results — skipping');
    return;
  }

  const updates     = [];
  const newIncidents = [];

  for (let i = 0; i < savedMetrics.length; i++) {
    const metric    = savedMetrics[i];
    const aiScore   = aiResult.results[i];

    if (!aiScore) continue;

    // Build update for this metric
    updates.push({
      updateOne: {
        filter: { _id: metric._id },
        update: {
          $set: {
            anomalyScore: aiScore.anomaly_score,
            isAnomaly:    aiScore.is_anomaly,
          },
        },
      },
    });

    // Auto-create incident for AI-detected critical/high anomalies
    if (
      aiScore.is_anomaly &&
      (aiScore.severity === 'critical' || aiScore.severity === 'high') &&
      !isOnIncidentCooldown(metric.host)
    ) {
      markIncidentCreated(metric.host);

      const incident = await Incident.create({
        title: `AI anomaly detected on ${metric.host}`,
        description:
          `Isolation Forest flagged abnormal behaviour. ` +
          `Anomaly score: ${aiScore.anomaly_score.toFixed(4)} ` +
          `(threshold: ${aiScore.confidence} confidence). ` +
          `Metrics at detection — CPU: ${metric.cpu}%, ` +
          `Memory: ${metric.memory}%, Disk: ${metric.disk}%.`,
        severity:        aiScore.severity,
        host:            metric.host,
        relatedMetrics:  [metric._id],
        timeline: [
          {
            note:
              `Auto-created by AI anomaly detector. ` +
              `Score: ${aiScore.anomaly_score.toFixed(4)}, ` +
              `Severity: ${aiScore.severity}, ` +
              `Confidence: ${aiScore.confidence}`,
          },
        ],
      });

      newIncidents.push(incident);

      console.log(
        `[AnomalyProcessor] Incident created for ${metric.host} ` +
        `— score: ${aiScore.anomaly_score.toFixed(4)} (${aiScore.severity})`
      );
    }
  }

  // Bulk update metric documents with AI scores
  if (updates.length > 0) {
    await Metric.bulkWrite(updates);
  }

  // Broadcast AI results to dashboard
  if (_io) {
    // Send updated anomaly scores for all processed metrics
    const enrichedMetrics = savedMetrics.map((m, i) => ({
      ...m.toObject(),
      anomalyScore: aiResult.results[i]?.anomaly_score ?? null,
      isAnomaly:    aiResult.results[i]?.is_anomaly    ?? false,
      aiSeverity:   aiResult.results[i]?.severity      ?? 'normal',
    }));

    _io.emit('ai:scores', enrichedMetrics);

    // Broadcast new AI incidents
    newIncidents.forEach((inc) => {
      _io.emit('incident:created', inc);
    });
  }
};

module.exports = { processAnomalies, setIO };