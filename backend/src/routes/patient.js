const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Invoice = require('../models/Invoice');
const Alert = require('../models/Alert');
const Vitals = require('../models/Vitals');
const { authenticate, authorize } = require('../middleware/rbac');

router.use(authenticate);
router.use(authorize('patient'));

// Get patient's own profile
router.get('/profile', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId, deletedAt: null })
      .populate('userId', 'email profile')
      .populate('assignedDoctorId')
      .populate({ path: 'assignedDoctorId', populate: { path: 'userId', select: 'profile' } });

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// Get patient's own vitals
router.get('/vitals', async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;

    const patient = await Patient.findOne({ userId: req.user.userId, deletedAt: null });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const query = { 'meta.patientId': patient._id };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const vitals = await Vitals.find(query).sort({ timestamp: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: vitals });
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch vitals' });
  }
});

// Get patient's own alerts
router.get('/alerts', async (req, res) => {
  try {
    const { acknowledged, severity, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const patient = await Patient.findOne({ userId: req.user.userId, deletedAt: null });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const query = { patientId: patient._id };
    if (acknowledged === 'true') query.acknowledgedAt = { $ne: null };
    else if (acknowledged === 'false') query.acknowledgedAt = null;
    if (severity) query.severity = severity;

    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .populate('doctorId')
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'profile' } })
        .populate('acknowledgedBy', 'profile')
        .skip(skip).limit(parseInt(limit)).sort({ timestamp: -1 }),
      Alert.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: alerts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

// Get patient's own prescriptions
router.get('/prescriptions', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId, deletedAt: null });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const prescriptions = await Prescription.find({ patientId: patient._id, deletedAt: null })
      .populate('doctorId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'profile' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch prescriptions' });
  }
});

// Get patient's own invoices
router.get('/invoices', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const patient = await Patient.findOne({ userId: req.user.userId, deletedAt: null });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const query = { patientId: patient._id };
    if (status) query.status = status;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('issuedBy', 'profile')
        .skip(skip).limit(parseInt(limit)).sort({ issuedAt: -1 }),
      Invoice.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
  }
});

// Get assigned doctor
router.get('/assigned-doctor', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId, deletedAt: null })
      .populate('assignedDoctorId')
      .populate({ path: 'assignedDoctorId', populate: { path: 'userId', select: 'profile email' } });

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    if (!patient.assignedDoctorId) {
      return res.json({ success: true, data: null, message: 'No doctor assigned' });
    }

    res.json({ success: true, data: patient.assignedDoctorId });
  } catch (error) {
    console.error('Get assigned doctor error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assigned doctor' });
  }
});

module.exports = router;
