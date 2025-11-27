const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  medicines: [{
    name: { type: String, required: true },
    dose: { type: String, required: true },
    frequency: { type: String, required: true },
    durationDays: { type: Number, required: true }
  }],
  tests: [{
    type: String
  }],
  notes: {
    type: String,
    default: null
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: null
  },
  attachments: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ validFrom: 1, validUntil: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
