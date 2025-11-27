const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  items: [{
    label: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  total: {
    type: Number,
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  issuedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueAt: {
    type: Date,
    default: null
  },
  attachmentUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
invoiceSchema.index({ patientId: 1, issuedAt: -1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueAt: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
