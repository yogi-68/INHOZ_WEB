const mongoose = require('mongoose');

const mlEventSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  event: {
    type: String,
    enum: ['fall', 'convulsion', 'no_movement', 'irregular_breathing', 'unresponsive'],
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  frameUrl: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Indexes
mlEventSchema.index({ patientId: 1, timestamp: -1 });
mlEventSchema.index({ event: 1 });
mlEventSchema.index({ deviceId: 1 });

module.exports = mongoose.model('MLEvent', mlEventSchema);
