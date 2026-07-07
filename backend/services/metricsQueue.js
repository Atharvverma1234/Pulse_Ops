// backend/services/metricsQueue.js
const { getRedisClient }    = require('../utils/redisClient');
const Metric                = require('../models/Metric');
const { evaluateMetrics }   = require('./alertEngine');

const QUEUE_KEY  = 'metrics:queue';
const BATCH_SIZE = 20;

let _io = null;

const setIO = (io) => { _io = io; };

const enqueueMetric = async (metricData) => {
  const redis = await getRedisClient();
  await redis.lPush(QUEUE_KEY, JSON.stringify(metricData));
};

const flushMetricsToMongo = async () => {
  const redis = await getRedisClient();
  const queueLength = await redis.lLen(QUEUE_KEY);
  if (queueLength === 0) return;

  const toProcess = Math.min(queueLength, BATCH_SIZE);
  const items     = [];

  for (let i = 0; i < toProcess; i++) {
    const item = await redis.rPop(QUEUE_KEY);
    if (item) items.push(JSON.parse(item));
  }

  if (items.length > 0) {
    const saved = await Metric.insertMany(items);
    console.log(`Flushed ${saved.length} metrics to MongoDB`);

    // Broadcast live metrics to dashboard
    if (_io) _io.emit('metrics:update', saved);

    // ── Evaluate alert rules against flushed metrics ──
    await evaluateMetrics(saved);
  }
};

const startMetricsFlushWorker = async (io) => {
  if (io) setIO(io);
  console.log('Metrics flush worker started');
  setInterval(async () => {
    try {
      await flushMetricsToMongo();
    } catch (err) {
      console.error('Flush error:', err.message);
    }
  }, 3000);
};

module.exports = {
  enqueueMetric,
  flushMetricsToMongo,
  startMetricsFlushWorker,
  setIO,
};