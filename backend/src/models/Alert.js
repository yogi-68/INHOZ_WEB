const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['sensor', 'ml'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  vitalSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  mlConfidence: {
    type: Number,
    default: null
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  acknowledgedAt: {
    type: Date,
    default: null
  }
});

// Indexes
alertSchema.index({ patientId: 1, createdAt: -1 });
alertSchema.index({ doctorId: 1, acknowledgedAt: 1 });
alertSchema.index({ severity: 1, createdAt: -1 });
alertSchema.index({ type: 1 });
alertSchema.index({ source: 1 });

module.exports = mongoose.model('Alert', alertSchema);
