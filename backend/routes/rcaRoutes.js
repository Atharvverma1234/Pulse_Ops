// backend/routes/rcaRoutes.js
const express = require('express');
const router  = express.Router();
const {
  generateIncidentRCA,
  getIncidentRCA,
  bulkGenerateRCA,
  getRCAStats,
} = require('../controllers/rcaController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats',                       getRCAStats);
router.post('/bulk',  restrictTo('admin', 'engineer'), bulkGenerateRCA);
router.post('/:id/generate',               generateIncidentRCA);
router.get('/:id',                         getIncidentRCA);

module.exports = router;