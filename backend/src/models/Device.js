const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  deviceType: {
    type: String,
    enum: ['wearable', 'bedside-monitor', 'ecg', 'pulse-oximeter', 'blood-pressure', 'temperature'],
    required: true
  },
  manufacturer: String,
  model: String,
  serialNumber: {
    type: String,
    unique: true
  },
  firmwareVersion: String,
  assignedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance', 'error'],
    default: 'offline'
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  lastHeartbeat: Date,
  lastDataReceived: Date,
  location: {
    room: String,
    bed: String,
    floor: String
  },
  calibrationInfo: {
    lastCalibrationDate: Date,
    nextCalibrationDate: Date,
    calibratedBy: String
  },
  errorLog: [{
    timestamp: Date,
    errorCode: String,
    errorMessage: String,
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  maintenanceLog: [{
    date: Date,
    performedBy: String,
    description: String,
    nextScheduled: Date
  }]
}, {
  timestamps: true
});

// Indexes
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ assignedPatient: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ lastHeartbeat: 1 });

// Update status based on last heartbeat
deviceSchema.methods.updateStatus = function() {
  if (this.lastHeartbeat) {
    const timeDiff = Date.now() - this.lastHeartbeat.getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (timeDiff > fiveMinutes) {
      this.status = 'offline';
    } else {
      this.status = 'online';
    }
  }
};

module.exports = mongoose.model('Device', deviceSchema);
