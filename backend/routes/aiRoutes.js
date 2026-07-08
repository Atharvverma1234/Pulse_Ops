// backend/routes/aiRoutes.js
const express = require('express');
const router  = express.Router();
const Metric  = require('../models/Metric');
const { protect }              = require('../middleware/authMiddleware');
const { checkAIHealth, getModelStatus } = require('../utils/aiClient');

router.use(protect);

// ── AI service health + model info ────────────
router.get('/status', async (req, res) => {
  try {
    const [health, modelStatus] = await Promise.all([
      checkAIHealth(),
      getModelStatus(),
    ]);
    res.json({ health, modelStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Recent anomalies from MongoDB ─────────────
router.get('/anomalies', async (req, res) => {
  try {
    const {
      host,
      limit = 50,
      from,
      to,
    } = req.query;

    const filter = { isAnomaly: true };
    if (host) filter.host = host;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to)   filter.timestamp.$lte = new Date(to);
    }

    const anomalies = await Metric.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({
      total: anomalies.length,
      data:  anomalies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Risk score summary per host ───────────────
router.get('/risk-summary', async (req, res) => {
  try {
    const summary = await Metric.aggregate([
      {
        $match: {
          timestamp:    { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // last 30 min
          anomalyScore: { $ne: null },
        },
      },
      {
        $group: {
          _id:              '$host',
          avgAnomalyScore:  { $avg: '$anomalyScore' },
          maxAnomalyScore:  { $max: '$anomalyScore' },
          anomalyCount:     { $sum: { $cond: ['$isAnomaly', 1, 0] } },
          totalReadings:    { $sum: 1 },
          latestScore:      { $last: '$anomalyScore' },
          latestIsAnomaly:  { $last: '$isAnomaly' },
          latestCpu:        { $last: '$cpu' },
          latestMemory:     { $last: '$memory' },
          latestDisk:       { $last: '$disk' },
        },
      },
      {
        $addFields: {
          anomalyRate: {
            $divide: ['$anomalyCount', '$totalReadings'],
          },
          riskLevel: {
            $switch: {
              branches: [
                {
                  case: { $gte: ['$maxAnomalyScore', 0.85] },
                  then: 'critical',
                },
                {
                  case: { $gte: ['$avgAnomalyScore', 0.65] },
                  then: 'high',
                },
                {
                  case: { $gte: ['$avgAnomalyScore', 0.45] },
                  then: 'medium',
                },
              ],
              default: 'low',
            },
          },
        },
      },
      { $sort: { maxAnomalyScore: -1 } },
    ]);

    res.json({ data: summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Anomaly score history for a host (for chart) ──
router.get('/score-history/:host', async (req, res) => {
  try {
    const { host } = req.params;
    const { limit = 50 } = req.query;

    const history = await Metric.find(
      { host, anomalyScore: { $ne: null } },
      { timestamp: 1, anomalyScore: 1, isAnomaly: 1, cpu: 1, memory: 1, disk: 1 }
    )
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ data: history.reverse() }); // chronological order
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;