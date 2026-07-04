// backend/controllers/metricsController.js
const Metric = require('../models/Metric');
const { enqueueMetric } = require('../services/metricsQueue');

// ── Ingest a single metric ────────────────────
const ingestMetric = async (req, res) => {
  try {
    const { host, service, cpu, memory, disk, network } = req.body;

    if (!host || cpu === undefined || memory === undefined || disk === undefined) {
      return res.status(400).json({
        message: 'host, cpu, memory, and disk are required',
      });
    }

    const metricData = {
      host,
      service: service || 'system',
      cpu,
      memory,
      disk,
      network: network || { in: 0, out: 0 },
      timestamp: new Date(),
    };

    // Push to Redis queue instead of writing directly to MongoDB
    await enqueueMetric(metricData);

    res.status(202).json({
      message: 'Metric accepted',
      data: metricData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Ingest bulk metrics ───────────────────────
const ingestBulkMetrics = async (req, res) => {
  try {
    const { metrics } = req.body;

    if (!Array.isArray(metrics) || metrics.length === 0) {
      return res.status(400).json({ message: 'metrics array is required' });
    }

    for (const m of metrics) {
      await enqueueMetric({ ...m, timestamp: new Date() });
    }

    res.status(202).json({
      message: `${metrics.length} metrics accepted`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Get metrics with filters ──────────────────
const getMetrics = async (req, res) => {
  try {
    const {
      host,
      from,
      to,
      limit = 100,
      page = 1,
    } = req.query;

    const filter = {};

    if (host) filter.host = host;

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const metrics = await Metric.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Metric.countDocuments(filter);

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Get latest metric per host ────────────────
const getLatestPerHost = async (req, res) => {
  try {
    const latest = await Metric.aggregate([
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: '$host',
          latestMetric: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: { newRoot: '$latestMetric' },
      },
    ]);

    res.status(200).json({ data: latest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Get aggregated stats for a host ──────────
const getHostStats = async (req, res) => {
  try {
    const { host } = req.params;
    const { from, to } = req.query;

    const matchStage = { host };
    if (from || to) {
      matchStage.timestamp = {};
      if (from) matchStage.timestamp.$gte = new Date(from);
      if (to) matchStage.timestamp.$lte = new Date(to);
    }

    const stats = await Metric.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$host',
          avgCpu: { $avg: '$cpu' },
          maxCpu: { $max: '$cpu' },
          avgMemory: { $avg: '$memory' },
          maxMemory: { $max: '$memory' },
          avgDisk: { $avg: '$disk' },
          maxDisk: { $max: '$disk' },
          count: { $sum: 1 },
          from: { $min: '$timestamp' },
          to: { $max: '$timestamp' },
        },
      },
    ]);

    if (!stats.length) {
      return res.status(404).json({ message: 'No metrics found for host' });
    }

    res.status(200).json({ data: stats[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  ingestMetric,
  ingestBulkMetrics,
  getMetrics,
  getLatestPerHost,
  getHostStats,
};