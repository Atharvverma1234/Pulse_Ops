// backend/routes/webhookRoutes.js
const express = require('express');
const router  = express.Router();
const { protect, restrictTo }  = require('../middleware/authMiddleware');
const { getDeliveryLog, fireWebhook, WEBHOOK_EVENTS } = require('../services/webhookService');

router.use(protect);

// ── Delivery log ──────────────────────────────
router.get('/log', (req, res) => {
  const log = getDeliveryLog();
  res.json({ total: log.length, data: log });
});

// ── Manual test fire ──────────────────────────
router.post('/test', restrictTo('admin', 'engineer'), async (req, res) => {
  const { event } = req.body;

  if (!event || !WEBHOOK_EVENTS[event.toUpperCase().replace('.', '_')]) {
    return res.status(400).json({
      message: 'Invalid event',
      validEvents: Object.values(WEBHOOK_EVENTS),
    });
  }

  const testPayload = {
    test:    true,
    message: `Test webhook fired for event: ${event}`,
    firedBy: req.user.name,
    at:      new Date().toISOString(),
  };

  const result = await fireWebhook(event, testPayload);

  res.json({
    message: result ? 'Webhook fired successfully' : 'Webhook failed — check n8n',
    event,
    result: result ? 'delivered' : 'failed',
  });
});

// ── n8n workflow list ─────────────────────────
router.get('/workflows', async (req, res) => {
  try {
    const axios   = require('axios');
    const response = await axios.get(
      `${process.env.N8N_BASE_URL}/api/v1/workflows`,
      {
        auth: { username: 'admin', password: 'pulseops123' },
        timeout: 5000,
      }
    );
    res.json({ data: response.data });
  } catch (err) {
    res.status(503).json({
      message: 'Could not reach n8n',
      error:   err.message,
    });
  }
});

module.exports = router;