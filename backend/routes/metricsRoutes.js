// backend/routes/metricsRoutes.js
const express = require('express');
const router = express.Router();
const {
  ingestMetric,
  ingestBulkMetrics,
  getMetrics,
  getLatestPerHost,
  getHostStats,
} = require('../controllers/metricsController');
const { protect } = require('../middleware/authMiddleware');

// Ingest (no auth — agents push freely; add auth in production)
router.post('/', ingestMetric);
router.post('/bulk', ingestBulkMetrics);

// Query (protected)
router.get('/', protect, getMetrics);
router.get('/latest', protect, getLatestPerHost);
router.get('/stats/:host', protect, getHostStats);

module.exports = router;