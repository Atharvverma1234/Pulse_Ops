// backend/controllers/rcaController.js
const { generateRCA, getRCA } = require('../services/rca/rcaService');
const Incident = require('../models/Incident');

// ── Generate RCA for incident ─────────────────
const generateIncidentRCA = async (req, res) => {
  try {
    const { id } = req.params;

    // Check incident exists
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Check if RCA already exists and force flag not set
    if (incident.rca?.generatedAt && !req.query.force) {
      return res.status(200).json({
        message: 'RCA already exists. Use ?force=true to regenerate.',
        data:    incident.rca,
        cached:  true,
      });
    }

    // Generate RCA
    const rca = await generateRCA(id);

    // Broadcast to dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit('rca:generated', { incidentId: id, rca });
    }

    res.status(200).json({
      message: 'RCA generated successfully',
      data:    rca,
      cached:  false,
    });
  } catch (error) {
    console.error('[RCA Controller]', error.message);

    if (error.message.includes('GROQ_API_KEY')) {
      return res.status(503).json({
        message: 'AI service unavailable — GROQ_API_KEY not configured',
      });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Get existing RCA ──────────────────────────
const getIncidentRCA = async (req, res) => {
  try {
    const rca = await getRCA(req.params.id);
    if (!rca) {
      return res.status(404).json({
        message: 'No RCA generated yet. POST to /generate to create one.',
      });
    }
    res.status(200).json({ data: rca });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Bulk generate RCA for open incidents ──────
const bulkGenerateRCA = async (req, res) => {
  try {
    // Only admin/engineer can trigger bulk generation
    const openIncidents = await Incident.find({
      status:       { $in: ['open', 'investigating'] },
      'rca.generatedAt': null, // only ones without RCA
    }).select('_id title').limit(10);

    if (openIncidents.length === 0) {
      return res.status(200).json({
        message: 'No incidents need RCA generation',
      });
    }

    // Generate in background — don't await all
    res.status(202).json({
      message:  `Generating RCA for ${openIncidents.length} incidents in background`,
      incidents: openIncidents.map((i) => ({ id: i._id, title: i.title })),
    });

    // Background processing
    for (const inc of openIncidents) {
      try {
        await generateRCA(inc._id.toString());
        // Small delay between API calls
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.error(`[RCA Bulk] Failed for ${inc._id}:`, err.message);
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── RCA stats ─────────────────────────────────
const getRCAStats = async (req, res) => {
  try {
    const [total, withRCA, highConf, medConf, lowConf] = await Promise.all([
      Incident.countDocuments(),
      Incident.countDocuments({ 'rca.generatedAt': { $ne: null } }),
      Incident.countDocuments({ 'rca.confidence': 'high'   }),
      Incident.countDocuments({ 'rca.confidence': 'medium' }),
      Incident.countDocuments({ 'rca.confidence': 'low'    }),
    ]);

    res.status(200).json({
      data: {
        total,
        withRCA,
        withoutRCA:  total - withRCA,
        coverage:    total > 0 ? ((withRCA / total) * 100).toFixed(1) : 0,
        byConfidence: { high: highConf, medium: medConf, low: lowConf },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  generateIncidentRCA,
  getIncidentRCA,
  bulkGenerateRCA,
  getRCAStats,
};