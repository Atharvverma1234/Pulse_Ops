// backend/utils/aiClient.js
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
const TIMEOUT_MS     = 5000; // fail fast — don't block metric pipeline

// ── Single prediction ─────────────────────────
const predictAnomaly = async (metric) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/predict`,
      {
        cpu:         metric.cpu,
        memory:      metric.memory,
        disk:        metric.disk,
        network_in:  metric.network?.in  || 0,
        network_out: metric.network?.out || 0,
        host:        metric.host,
      },
      { timeout: TIMEOUT_MS }
    );
    return response.data;
  } catch (err) {
    // Never crash the metric pipeline because AI is down
    console.warn(`[AIClient] predict failed for ${metric.host}: ${err.message}`);
    return null;
  }
};

// ── Bulk prediction ───────────────────────────
const predictAnomalyBulk = async (metrics) => {
  try {
    const payload = {
      metrics: metrics.map((m) => ({
        cpu:         m.cpu,
        memory:      m.memory,
        disk:        m.disk,
        network_in:  m.network?.in  || 0,
        network_out: m.network?.out || 0,
        host:        m.host,
      })),
    };

    const response = await axios.post(
      `${AI_SERVICE_URL}/predict/bulk`,
      payload,
      { timeout: TIMEOUT_MS * 2 }
    );
    return response.data; // { total, anomalies, results }
  } catch (err) {
    console.warn(`[AIClient] bulk predict failed: ${err.message}`);
    return null;
  }
};

// ── Check if AI service is reachable ─────────
const checkAIHealth = async () => {
  try {
    const response = await axios.get(
      `${AI_SERVICE_URL}/health`,
      { timeout: 3000 }
    );
    return response.data;
  } catch (err) {
    return { status: 'unreachable', error: err.message };
  }
};

// ── Get model status ──────────────────────────
const getModelStatus = async () => {
  try {
    const response = await axios.get(
      `${AI_SERVICE_URL}/model/status`,
      { timeout: 3000 }
    );
    return response.data;
  } catch (err) {
    return { model_loaded: false, error: err.message };
  }
};

module.exports = {
  predictAnomaly,
  predictAnomalyBulk,
  checkAIHealth,
  getModelStatus,
};