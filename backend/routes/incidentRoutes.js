// backend/routes/incidentRoutes.js
const express = require('express');
const router  = express.Router();
const {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  addTimelineNote,
  deleteIncident,
  getIncidentStats,
} = require('../controllers/incidentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes require auth
router.use(protect);

router.get('/stats',           getIncidentStats);
router.get('/',                getIncidents);
router.post('/',               createIncident);
router.get('/:id',             getIncident);
router.patch('/:id',           updateIncident);
router.post('/:id/timeline',   addTimelineNote);
router.delete('/:id',          restrictTo('admin'), deleteIncident);

module.exports = router;