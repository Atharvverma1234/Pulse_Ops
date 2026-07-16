// backend/services/webhookService.js
const axios = require('axios');

const N8N_BASE_URL       = process.env.N8N_BASE_URL || 'http://n8n:5678';
const WEBHOOK_SECRET     = process.env.N8N_WEBHOOK_SECRET || '';
const TIMEOUT_MS         = 8000;

// ── Webhook event types ───────────────────────
const WEBHOOK_EVENTS = {
  INCIDENT_CREATED:    'incident.created',
  INCIDENT_UPDATED:    'incident.updated',
  INCIDENT_RESOLVED:   'incident.resolved',
  ALERT_CRITICAL:      'alert.critical',
  ALERT_HIGH:          'alert.high',
  ANOMALY_DETECTED:    'anomaly.detected',
  DAILY_DIGEST:        'digest.daily',
};

// ── Internal webhook registry ─────────────────
// Maps event type → n8n webhook path
// These paths are set when you create webhooks in n8n
// backend/services/webhookService.js
// Update fireWebhook to support multiple destinations per event
const WEBHOOK_REGISTRY = {
  [WEBHOOK_EVENTS.INCIDENT_CREATED]:  [
    '/webhook/incident-created',
    '/webhook/incident-created-telegram',
  ],
  [WEBHOOK_EVENTS.ALERT_CRITICAL]:    [
    '/webhook/alert-critical',
    '/webhook/alert-critical-telegram',
  ],
  [WEBHOOK_EVENTS.ANOMALY_DETECTED]:  [
    '/webhook/anomaly-detected',
    '/webhook/anomaly-detected-telegram',
  ],
  [WEBHOOK_EVENTS.INCIDENT_RESOLVED]: ['/webhook/incident-resolved'],
  [WEBHOOK_EVENTS.ALERT_HIGH]:        ['/webhook/alert-high'],
  [WEBHOOK_EVENTS.DAILY_DIGEST]:      ['/webhook/daily-digest'],
};

// ── Delivery log (in-memory, replace with DB in production) ──
const deliveryLog = [];
const MAX_LOG     = 100;

const logDelivery = (event, url, success, statusCode, error = null) => {
  deliveryLog.unshift({
    id:         Date.now().toString(),
    event,
    url,
    success,
    statusCode,
    error,
    timestamp:  new Date().toISOString(),
  });
  if (deliveryLog.length > MAX_LOG) deliveryLog.pop();
};

// ── Core fire function ────────────────────────
const fireWebhook = async (eventType, payload, retries = 2) => {
  const paths = WEBHOOK_REGISTRY[eventType];
  if (!paths || paths.length === 0) {
    console.warn(`[Webhook] No path registered for: ${eventType}`);
    return;
  }

  // Fire all destinations for this event in parallel
  await Promise.allSettled(
    paths.map((path) => fireSingleWebhook(eventType, path, payload, retries))
  );
};

// Rename original fireWebhook logic to fireSingleWebhook
const fireSingleWebhook = async (eventType, path, payload, retries = 2) => {
  const url  = `${N8N_BASE_URL}${path}`;
  const body = {
    event:     eventType,
    timestamp: new Date().toISOString(),
    secret:    WEBHOOK_SECRET,
    data:      payload,
  };

  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await axios.post(url, body, {
        timeout: TIMEOUT_MS,
        headers: {
          'Content-Type':       'application/json',
          'X-PulseOps-Event':   eventType,
          'X-PulseOps-Secret':  WEBHOOK_SECRET,
        },
      });
      logDelivery(eventType, url, true, response.status);
      console.log(`[Webhook] ✓ ${eventType} → ${url} (${response.status})`);
      return response;
    } catch (err) {
      attempt++;
      if (attempt > retries) {
        const statusCode = err.response?.status || 0;
        logDelivery(eventType, url, false, statusCode, err.message);
        console.error(`[Webhook] ✗ ${eventType} → ${url} failed: ${err.message}`);
        return null;
      }
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.warn(`[Webhook] Retry ${attempt}/${retries} for ${url} in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

// ── Convenience wrappers ──────────────────────
const onIncidentCreated = (incident) =>
  fireWebhook(WEBHOOK_EVENTS.INCIDENT_CREATED, {
    id:          incident._id,
    title:       incident.title,
    description: incident.description,
    severity:    incident.severity,
    status:      incident.status,
    host:        incident.host,
    createdAt:   incident.createdAt,
    url:         `http://localhost:5173/incidents/${incident._id}`,
  });

const onIncidentUpdated = (incident) =>
  fireWebhook(WEBHOOK_EVENTS.INCIDENT_UPDATED, {
    id:        incident._id,
    title:     incident.title,
    severity:  incident.severity,
    status:    incident.status,
    host:      incident.host,
    updatedAt: incident.updatedAt,
    url:       `http://localhost:5173/incidents/${incident._id}`,
  });

const onIncidentResolved = (incident) =>
  fireWebhook(WEBHOOK_EVENTS.INCIDENT_RESOLVED, {
    id:          incident._id,
    title:       incident.title,
    severity:    incident.severity,
    host:        incident.host,
    resolvedAt:  incident.resolvedAt,
    url:         `http://localhost:5173/incidents/${incident._id}`,
  });

const onCriticalAlert = (alert, incident) =>
  fireWebhook(WEBHOOK_EVENTS.ALERT_CRITICAL, {
    id:             alert._id,
    host:           alert.host,
    metricType:     alert.metricType,
    triggeredValue: alert.triggeredValue,
    threshold:      alert.threshold,
    severity:       alert.severity,
    incidentId:     incident?._id || null,
    incidentUrl:    incident
      ? `http://localhost:5173/incidents/${incident._id}`
      : null,
  });

const onHighAlert = (alert, incident) =>
  fireWebhook(WEBHOOK_EVENTS.ALERT_HIGH, {
    id:             alert._id,
    host:           alert.host,
    metricType:     alert.metricType,
    triggeredValue: alert.triggeredValue,
    threshold:      alert.threshold,
    severity:       alert.severity,
    incidentId:     incident?._id || null,
  });

const onAnomalyDetected = (metric, score, severity) =>
  fireWebhook(WEBHOOK_EVENTS.ANOMALY_DETECTED, {
    host:         metric.host,
    anomalyScore: score,
    severity,
    cpu:          metric.cpu,
    memory:       metric.memory,
    disk:         metric.disk,
    timestamp:    metric.timestamp,
    url:          'http://localhost:5173/ai',
  });

// ── Delivery log access ───────────────────────
const getDeliveryLog = () => deliveryLog;

module.exports = {
  fireWebhook,
  onIncidentCreated,
  onIncidentUpdated,
  onIncidentResolved,
  onCriticalAlert,
  onHighAlert,
  onAnomalyDetected,
  getDeliveryLog,
  WEBHOOK_EVENTS,
};