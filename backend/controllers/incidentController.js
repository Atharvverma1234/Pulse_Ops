// backend/controllers/incidentController.js
const Incident = require('../models/Incident');

const {
  onIncidentCreated,
  onIncidentUpdated,
  onIncidentResolved,
} = require('../services/webhookService');

// ── Create Incident ───────────────────────────
const createIncident = async (req, res) => {
  try {
    const {
      title,
      description,
      severity,
      host,
      assignedTo,
      relatedMetrics,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const incident = await Incident.create({
      title,
      description,
      severity: severity || 'medium',
      host,
      assignedTo: assignedTo || null,
      relatedMetrics: relatedMetrics || [],
      timeline: [
        {
          note: `Incident created by ${req.user.name}`,
          addedBy: req.user._id,
        },
      ],
    });

    await incident.populate('assignedTo', 'name email role');

    // Broadcast to dashboard via socket.io
    const io = req.app.get('io');
    if (io) io.emit('incident:created', incident);

    // Fire webhook (non-blocking)
onIncidentCreated(incident).catch((e) =>
  console.error('[Webhook] incident created error:', e.message)
);

    res.status(201).json({ message: 'Incident created', data: incident });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Get All Incidents (with filters) ─────────
const getIncidents = async (req, res) => {
  try {
    const {
      status,
      severity,
      host,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter = {};

    if (status)   filter.status   = status;
    if (severity) filter.severity = severity;
    if (host)     filter.host     = host;

    // Text search on title and description
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { host:        { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .populate('assignedTo', 'name email role')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Incident.countDocuments(filter),
    ]);

    res.status(200).json({
      total,
      page:  Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
      data:  incidents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Get Single Incident ───────────────────────
const getIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('assignedTo',            'name email role')
      .populate('timeline.addedBy',      'name email')
      .populate('relatedMetrics');

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.status(200).json({ data: incident });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Update Incident ───────────────────────────
const updateIncident = async (req, res) => {
  try {
    const { status, severity, assignedTo, title, description } = req.body;

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Track status change in timeline
    if (status && status !== incident.status) {
      incident.timeline.push({
        note:    `Status changed from ${incident.status} → ${status} by ${req.user.name}`,
        addedBy: req.user._id,
      });
      incident.status = status;

      // Auto-set resolvedAt
      if (status === 'resolved') {
        incident.resolvedAt = new Date();
      } else {
        incident.resolvedAt = null;
      }
    }

    if (severity)    incident.severity    = severity;
    if (assignedTo)  incident.assignedTo  = assignedTo;
    if (title)       incident.title       = title;
    if (description) incident.description = description;

    await incident.save();
    await incident.populate('assignedTo', 'name email role');

    const io = req.app.get('io');
    if (io) io.emit('incident:updated', incident);
    // Fire webhook based on new status
if (incident.status === 'resolved') {
  onIncidentResolved(incident).catch((e) =>
    console.error('[Webhook] incident resolved error:', e.message)
  );
} else {
  onIncidentUpdated(incident).catch((e) =>
    console.error('[Webhook] incident updated error:', e.message)
  );
}

    res.status(200).json({ message: 'Incident updated', data: incident });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Add Timeline Note ─────────────────────────
const addTimelineNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: 'Note is required' });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.timeline.push({ note, addedBy: req.user._id });
    await incident.save();
    await incident.populate('timeline.addedBy', 'name email');

    const io = req.app.get('io');
    if (io) io.emit('incident:updated', incident);

    res.status(200).json({
      message:  'Note added',
      timeline: incident.timeline,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Delete Incident (admin only) ──────────────
const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const io = req.app.get('io');
    if (io) io.emit('incident:deleted', { id: req.params.id });

    res.status(200).json({ message: 'Incident deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Incident Stats ────────────────────────────
const getIncidentStats = async (req, res) => {
  try {
    const [statusStats, severityStats, total] = await Promise.all([
      Incident.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Incident.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Incident.countDocuments(),
    ]);

    const byStatus = {};
    statusStats.forEach((s) => (byStatus[s._id] = s.count));

    const bySeverity = {};
    severityStats.forEach((s) => (bySeverity[s._id] = s.count));

    res.status(200).json({
      data: { total, byStatus, bySeverity },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  addTimelineNote,
  deleteIncident,
  getIncidentStats,
};