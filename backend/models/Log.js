// backend/models/Log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    host: {
      type: String,
      required: true,
      index: true,
    },
    service: {
      type: String,
      default: 'system',
    },
    level: {
      type: String,
      enum: ['info', 'warn', 'error', 'debug'],
      default: 'info',
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // any extra context
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

logSchema.index({ host: 1, level: 1, timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);