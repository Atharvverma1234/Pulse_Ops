// backend/models/Metric.js
const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema(
  {
    host: {
      type: String,
      required: [true, 'Host is required'],
      trim: true,
      index: true, // frequently queried
    },
    service: {
      type: String,
      default: 'system', // e.g. system, nginx, postgres
      trim: true,
    },
    cpu: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    memory: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    disk: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    network: {
      in: { type: Number, default: 0 },  // bytes/sec incoming
      out: { type: Number, default: 0 }, // bytes/sec outgoing
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // time-range queries
    },
    anomalyScore: {
      type: Number,
      default: null, // filled by AI service in Week 8
    },
    isAnomaly: {
      type: Boolean,
      default: false,
    },
  }
);

// Compound index for most common query: "give me metrics for host X in time range Y-Z"
metricSchema.index({ host: 1, timestamp: -1 });

module.exports = mongoose.model('Metric', metricSchema);