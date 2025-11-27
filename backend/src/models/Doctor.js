const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialty: {
    type: String,
    required: true
  },
  credentials: [{
    type: String
  }],
  availability: [{
    day: String,
    from: String,
    to: String
  }],
  assignedPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],
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
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
