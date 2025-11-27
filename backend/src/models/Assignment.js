const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
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
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
assignmentSchema.index({ patientId: 1, createdAt: -1 });
assignmentSchema.index({ doctorId: 1, createdAt: -1 });
assignmentSchema.index({ from: 1, to: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
