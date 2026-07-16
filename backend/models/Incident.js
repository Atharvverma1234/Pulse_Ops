// backend/models/Incident.js
const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema({
  note: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

// Add this schema inside Incident.js before the main incidentSchema

const rcaSchema = new mongoose.Schema({
  summary:          { type: String, default: '' },
  rootCause:        { type: String, default: '' },
  impact:           { type: String, default: '' },
  recommendations:  [{ type: String }],
  confidence:       {
    type:    String,
    enum:    ['high', 'medium', 'low'],
    default: 'low',
  },
  confidenceReason: { type: String, default: '' },
  generatedAt:      { type: Date },
  context: {
    metricStats:  { type: mongoose.Schema.Types.Mixed },
    alertCount:   { type: Number },
    metricCount:  { type: Number },
  },
}, { _id: false });

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved'],
      default: 'open',
      index: true,
    },
    host: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    relatedMetrics: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Metric' }
    ],
    timeline: [timelineEntrySchema],
    resolvedAt: {
      type: Date,
      default: null,
    },
    rca:            { type: rcaSchema, default: null },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Incident', incidentSchema);