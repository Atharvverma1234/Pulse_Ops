// backend/controllers/alertController.js
const Alert = require('../models/Alert');

// ── Get all alerts with filters ───────────────
const getAlerts = async (req, res) => {
  try {
    const {
      status,
      severity,
      host,
      metricType,
      page  = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status)     filter.status     = status;
    if (severity)   filter.severity   = severity;
    if (host)       filter.host       = host;
    if (metricType) filter.metricType = metricType;

    const skip = (Number(page) - 1) * Number(limit);

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('incident', 'title status severity')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Alert.countDocuments(filter),
    ]);

    res.status(200).json({
      total,
      page:  Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
      data:  alerts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Get single alert ──────────────────────────
const getAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('incident', 'title status severity');

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.status(200).json({ data: alert });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Acknowledge alert ─────────────────────────
const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'acknowledged' },
      { new: true }
    ).populate('incident', 'title status');

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    const io = req.app.get('io');
    if (io) io.emit('alert:acknowledged', alert);

    res.status(200).json({ message: 'Alert acknowledged', data: alert });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Resolve alert ─────────────────────────────
const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    ).populate('incident', 'title status');

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    const io = req.app.get('io');
    if (io) io.emit('alert:resolved', alert);

    res.status(200).json({ message: 'Alert resolved', data: alert });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Alert stats ───────────────────────────────
const getAlertStats = async (req, res) => {
  try {
    const [statusStats, severityStats, total] = await Promise.all([
      Alert.aggregate([{ $group: { _id: '$status',   count: { $sum: 1 } } }]),
      Alert.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Alert.countDocuments(),
    ]);

    const byStatus   = {};
    const bySeverity = {};
    statusStats.forEach((s)   => (byStatus[s._id]   = s.count));
    severityStats.forEach((s) => (bySeverity[s._id] = s.count));

    res.status(200).json({ data: { total, byStatus, bySeverity } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Bulk resolve all active alerts for a host ─
const resolveHostAlerts = async (req, res) => {
  try {
    const { host } = req.params;
    const result = await Alert.updateMany(
      { host, status: 'active' },
      { status: 'resolved' }
    );
    res.status(200).json({
      message: `Resolved ${result.modifiedCount} alerts for ${host}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAlerts,
  getAlert,
  acknowledgeAlert,
  resolveAlert,
  getAlertStats,
  resolveHostAlerts,
};