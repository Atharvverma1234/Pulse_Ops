// backend/models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    host: {
      type: String,
      required: true,
      index: true,
    },
    metricType: {
      type: String,
      enum: ['cpu', 'memory', 'disk', 'network'],
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    triggeredValue: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
    },
    notified: {
      type: Boolean,
      default: false,
    },
    incident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);