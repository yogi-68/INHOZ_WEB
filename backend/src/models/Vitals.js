const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  meta: {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    deviceId: String
  },
  heartRate: {
    type: Number,
    min: 0,
    max: 300
  },
  spo2: {
    type: Number,
    min: 0,
    max: 100
  },
  temperature: {
    type: Number,
    min: 20,
    max: 50
  },
  systolic: {
    type: Number,
    min: 0,
    max: 300
  },
  diastolic: {
    type: Number,
    min: 0,
    max: 200
  },
  glucose: {
    type: Number,
    min: 0,
    max: 1000
  }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'meta',
    granularity: 'seconds'
  }
});

// Indexes
vitalsSchema.index({ 'meta.patientId': 1, timestamp: -1 });
vitalsSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Vitals', vitalsSchema);
