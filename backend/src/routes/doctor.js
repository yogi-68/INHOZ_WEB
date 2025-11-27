const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Alert = require('../models/Alert');
const Vitals = require('../models/Vitals');
const { authenticate, requireDoctor, canAccessPatient } = require('../middleware/rbac');
const { auditOperations } = require('../middleware/audit');

router.use(authenticate);
router.use(requireDoctor);

// Get all assigned patients
router.get('/patients', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId, deletedAt: null });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    const patients = await Patient.find({
      _id: { $in: doctor.assignedPatients },
      deletedAt: null
    }).populate('userId', 'email profile').sort({ createdAt: -1 });

    const patientsWithVitals = await Promise.all(
      patients.map(async (patient) => {
        const latestVitals = await Vitals.findOne({ 'meta.patientId': patient._id })
          .sort({ timestamp: -1 }).limit(1);
        const unacknowledgedAlerts = await Alert.countDocuments({
          patientId: patient._id,
          acknowledgedAt: null
        });
        return { ...patient.toObject(), latestVitals: latestVitals || null, unacknowledgedAlerts };
      })
    );

    res.json({ success: true, data: patientsWithVitals });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch patients' });
  }
});

// Get patient details
router.get('/patients/:patientId', canAccessPatient, async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.patientId, deletedAt: null })
      .populate('userId', 'email profile')
      .populate('assignedDoctorId')
      .populate({ path: 'assignedDoctorId', populate: { path: 'userId', select: 'profile' } });

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch patient details' });
  }
});

// Get patient vitals history
router.get('/patients/:patientId/vitals', canAccessPatient, async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    const query = { 'meta.patientId': req.params.patientId };
    
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

// Get alerts for assigned patients
router.get('/alerts', async (req, res) => {
  try {
    const { acknowledged, severity, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const doctor = await Doctor.findOne({ userId: req.user.userId, deletedAt: null });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    const query = { patientId: { $in: doctor.assignedPatients } };
    if (acknowledged === 'true') query.acknowledgedAt = { $ne: null };
    else if (acknowledged === 'false') query.acknowledgedAt = null;
    if (severity) query.severity = severity;

    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .populate('patientId', 'hospitalId roomNo userId')
        .populate({ path: 'patientId', populate: { path: 'userId', select: 'profile' } })
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

// Acknowledge alert
router.put('/alerts/:alertId/acknowledge', auditOperations.acknowledgeAlert, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.userId, deletedAt: null });
    if (!doctor || !doctor.assignedPatients.includes(alert.patientId.toString())) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (alert.acknowledgedAt) {
      return res.status(400).json({ success: false, error: 'Alert already acknowledged' });
    }

    alert.acknowledgedBy = req.user.userId;
    alert.acknowledgedAt = new Date();
    await alert.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`patient:${alert.patientId}`).emit('alert:acknowledged', {
        alertId: alert._id,
        acknowledgedBy: req.user.userId,
        acknowledgedAt: alert.acknowledgedAt
      });
    }

    res.json({ success: true, message: 'Alert acknowledged', data: alert });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ success: false, error: 'Failed to acknowledge alert' });
  }
});

// Get patient prescriptions
router.get('/patients/:patientId/prescriptions', canAccessPatient, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId, deletedAt: null })
      .populate('doctorId')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'profile' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch prescriptions' });
  }
});

// Create prescription
router.post('/patients/:patientId/prescriptions', canAccessPatient, auditOperations.createPrescription, async (req, res) => {
  try {
    const { medicines, tests, notes, validFrom, validUntil } = req.body;

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ success: false, error: 'Medicines array is required' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.userId, deletedAt: null });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    const prescription = new Prescription({
      patientId: req.params.patientId,
      doctorId: doctor._id,
      medicines,
      tests: tests || [],
      notes,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null
    });

    await prescription.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`patient:${req.params.patientId}`).emit('prescription:created', {
        prescriptionId: prescription._id,
        patientId: req.params.patientId,
        doctorId: doctor._id
      });
    }

    res.status(201).json({ success: true, message: 'Prescription created', data: prescription });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ success: false, error: 'Failed to create prescription' });
  }
});

module.exports = router;
