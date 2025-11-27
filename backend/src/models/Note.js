const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: String,
  authorRole: String,
  noteType: {
    type: String,
    enum: ['progress-note', 'consultation', 'observation', 'instruction', 'discharge-summary', 'admission-note', 'other'],
    required: true
  },
  title: String,
  content: {
    type: String,
    required: true
  },
  attachments: [{
    fileName: String,
    fileType: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [String],
  relatedAlertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  },
  relatedPrescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
noteSchema.index({ patientId: 1, createdAt: -1 });
noteSchema.index({ authorId: 1 });
noteSchema.index({ noteType: 1 });

module.exports = mongoose.model('Note', noteSchema);
