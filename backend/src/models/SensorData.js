const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  vitals: {
    heartRate: {
      value: Number,
      unit: { type: String, default: 'bpm' }
    },
    spo2: {
      value: Number,
      unit: { type: String, default: '%' }
    },
    temperature: {
      value: Number,
      unit: { type: String, default: '°C' }
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: { type: String, default: 'mmHg' }
    },
    respiratoryRate: {
      value: Number,
      unit: { type: String, default: 'breaths/min' }
    }
  },
  ecgData: {
    waveform: [Number], // ECG signal values
    heartRateVariability: Number,
    rhythm: String
  },
  activityData: {
    steps: Number,
    calories: Number,
    distance: Number,
    movement: {
      type: String,
      enum: ['resting', 'walking', 'running', 'sleeping']
    },
    fallDetected: {
      type: Boolean,
      default: false
    }
  },
  mlInference: {
    convulsionDetected: {
      type: Boolean,
      default: false
    },
    convulsionProbability: Number,
    seizureDetected: {
      type: Boolean,
      default: false
    },
    seizureProbability: Number,
    abnormalPattern: {
      type: Boolean,
      default: false
    },
    confidence: Number
  },
  dataQuality: {
    signalStrength: Number,
    noiseLevel: Number,
    accuracy: Number
  },
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
sensorDataSchema.index({ patientId: 1, timestamp: -1 });
sensorDataSchema.index({ deviceId: 1, timestamp: -1 });
sensorDataSchema.index({ timestamp: -1 });
sensorDataSchema.index({ processed: 1 });

// TTL index to auto-delete old data after 90 days
sensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
