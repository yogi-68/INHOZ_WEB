const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billId: {
    type: String,
    unique: true,
    required: true
  },
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  admissionId: String,
  billDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  admissionDate: Date,
  dischargeDate: Date,
  durationDays: Number,
  charges: {
    roomCharges: [{
      roomType: String,
      roomNumber: String,
      ratePerDay: Number,
      days: Number,
      amount: Number
    }],
    consultationCharges: [{
      doctorName: String,
      specialization: String,
      consultationType: String,
      amount: Number,
      date: Date
    }],
    medicineCharges: [{
      medicineName: String,
      quantity: Number,
      unitPrice: Number,
      amount: Number
    }],
    procedureCharges: [{
      procedureName: String,
      procedureCode: String,
      amount: Number,
      date: Date
    }],
    diagnosticCharges: [{
      testName: String,
      testCode: String,
      amount: Number,
      date: Date
    }],
    equipmentCharges: [{
      equipmentName: String,
      usageDuration: String,
      amount: Number
    }],
    nursingCharges: {
      amount: Number,
      days: Number
    },
    miscellaneousCharges: [{
      description: String,
      amount: Number
    }]
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    percentage: Number,
    amount: Number
  },
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    value: Number,
    amount: Number,
    reason: String
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  dueAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid'
  },
  payments: [{
    paymentId: String,
    amount: Number,
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank-transfer', 'insurance', 'other']
    },
    transactionId: String,
    paymentDate: {
      type: Date,
      default: Date.now
    },
    receivedBy: String,
    notes: String
  }],
  insurance: {
    hasInsurance: {
      type: Boolean,
      default: false
    },
    insuranceProvider: String,
    policyNumber: String,
    claimAmount: Number,
    claimStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'partial']
    },
    approvedAmount: Number
  },
  billGeneratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  pdfPath: String
}, {
  timestamps: true
});

// Indexes
billSchema.index({ billId: 1 });
billSchema.index({ invoiceNumber: 1 });
billSchema.index({ patientId: 1, billDate: -1 });
billSchema.index({ paymentStatus: 1 });
billSchema.index({ billDate: -1 });

// Generate bill ID and invoice number
billSchema.pre('save', async function(next) {
  if (!this.billId) {
    const count = await mongoose.model('Bill').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.billId = `BILL${year}${month}${String(count + 1).padStart(5, '0')}`;
    this.invoiceNumber = `INV${year}${month}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate totals
billSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  
  // Sum all charges
  if (this.charges.roomCharges) {
    this.charges.roomCharges.forEach(charge => subtotal += charge.amount || 0);
  }
  if (this.charges.consultationCharges) {
    this.charges.consultationCharges.forEach(charge => subtotal += charge.amount || 0);
  }
  if (this.charges.medicineCharges) {
    this.charges.medicineCharges.forEach(charge => subtotal += charge.amount || 0);
  }
  if (this.charges.procedureCharges) {
    this.charges.procedureCharges.forEach(charge => subtotal += charge.amount || 0);
  }
  if (this.charges.diagnosticCharges) {
    this.charges.diagnosticCharges.forEach(charge => subtotal += charge.amount || 0);
  }
  if (this.charges.equipmentCharges) {
    this.charges.equipmentCharges.forEach(charge => subtotal += charge.amount || 0);
  }
  if (this.charges.nursingCharges) {
    subtotal += this.charges.nursingCharges.amount || 0;
  }
  if (this.charges.miscellaneousCharges) {
    this.charges.miscellaneousCharges.forEach(charge => subtotal += charge.amount || 0);
  }
  
  this.subtotal = subtotal;
  
  // Calculate tax
  if (this.tax && this.tax.percentage) {
    this.tax.amount = (subtotal * this.tax.percentage) / 100;
  }
  
  let total = subtotal + (this.tax?.amount || 0);
  
  // Calculate discount
  if (this.discount) {
    if (this.discount.type === 'percentage') {
      this.discount.amount = (subtotal * this.discount.value) / 100;
    } else {
      this.discount.amount = this.discount.value;
    }
    total -= this.discount.amount;
  }
  
  this.totalAmount = total;
  this.dueAmount = total - this.paidAmount;
  
  // Update payment status
  if (this.paidAmount === 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'paid';
    this.dueAmount = 0;
  } else {
    this.paymentStatus = 'partial';
  }
};

module.exports = mongoose.model('Bill', billSchema);
