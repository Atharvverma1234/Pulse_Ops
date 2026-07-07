// backend/routes/alertRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getAlerts,
  getAlert,
  acknowledgeAlert,
  resolveAlert,
  getAlertStats,
  resolveHostAlerts,
} = require('../controllers/alertController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats',                    getAlertStats);
router.get('/',                         getAlerts);
router.get('/:id',                      getAlert);
router.patch('/:id/acknowledge',        acknowledgeAlert);
router.patch('/:id/resolve',            resolveAlert);
router.patch('/host/:host/resolve-all', restrictTo('admin', 'engineer'), resolveHostAlerts);

module.exports = router;