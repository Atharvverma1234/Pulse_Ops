// backend/services/metricsQueue.js
const { getRedisClient } = require('../utils/redisClient');
const Metric = require('../models/Metric');

const QUEUE_KEY = 'metrics:queue';
const BATCH_SIZE = 20; // write to MongoDB in batches of 20

// Push a metric to Redis queue
const enqueueMetric = async (metricData) => {
  const redis = await getRedisClient();
  await redis.lPush(QUEUE_KEY, JSON.stringify(metricData));
};

// Drain queue and bulk write to MongoDB
const flushMetricsToMongo = async () => {
  const redis = await getRedisClient();

  const queueLength = await redis.lLen(QUEUE_KEY);
  if (queueLength === 0) return;

  const toProcess = Math.min(queueLength, BATCH_SIZE);
  const items = [];

  for (let i = 0; i < toProcess; i++) {
    const item = await redis.rPop(QUEUE_KEY);
    if (item) items.push(JSON.parse(item));
  }

  if (items.length > 0) {
    await Metric.insertMany(items);
    console.log(`Flushed ${items.length} metrics to MongoDB`);
  }
};

// Start a background flush interval (every 3 seconds)
const startMetricsFlushWorker = async () => {
  console.log('Metrics flush worker started');
  setInterval(async () => {
    try {
      await flushMetricsToMongo();
    } catch (err) {
      console.error('Flush error:', err.message);
    }
  }, 3000);
};

module.exports = { enqueueMetric, flushMetricsToMongo, startMetricsFlushWorker };