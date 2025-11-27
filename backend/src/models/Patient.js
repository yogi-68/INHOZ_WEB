const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  hospitalId: {
    type: String,
    required: true
  },
  roomNo: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['M', 'F', 'Other'],
    required: true
  },
  emergencyContact: {
    name: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['admitted', 'monitoring', 'discharged'],
    default: 'admitted'
  },
  assignedDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

// Indexes
// Note: userId index is automatic via unique: true
patientSchema.index({ assignedDoctorId: 1 });
patientSchema.index({ hospitalId: 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('Patient', patientSchema);
