const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Assignment = require('../models/Assignment');
const Invoice = require('../models/Invoice');
const Alert = require('../models/Alert');
const Vitals = require('../models/Vitals');
const AuditLog = require('../models/AuditLog');
const { authenticate, requireAdmin } = require('../middleware/rbac');
const { auditOperations, captureBeforeState } = require('../middleware/audit');

// Apply admin authentication to all routes
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalPatients,
      activePatients,
      totalDoctors,
      activeDoctors,
      totalAlerts,
      unacknowledgedAlerts,
      todayVitals
    ] = await Promise.all([
      Patient.countDocuments({ deletedAt: null }),
      Patient.countDocuments({ status: 'monitoring', deletedAt: null }),
      Doctor.countDocuments({ deletedAt: null }),
      User.countDocuments({ role: 'doctor', isActive: true, deletedAt: null }),
      Alert.countDocuments({}),
      Alert.countDocuments({ acknowledgedAt: null }),
      Vitals.countDocuments({ 
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
      })
    ]);

    res.json({
      success: true,
      data: {
        patients: { total: totalPatients, active: activePatients },
        doctors: { total: totalDoctors, active: activeDoctors },
        alerts: { total: totalAlerts, unacknowledged: unacknowledgedAlerts },
        vitals: { today: todayVitals }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard statistics' });
  }
});

/**
 * GET /api/admin/doctors
 * List all doctors with pagination
 */
router.get('/doctors', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    const query = { deletedAt: null };
    
    if (search) {
      const users = await User.find({
        role: 'doctor',
        $or: [
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      query.userId = { $in: users.map(u => u._id) };
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(query)
        .populate('userId', 'email profile isActive')
        .populate('assignedPatients', 'hospitalId roomNo')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Doctor.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: doctors,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('List doctors error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch doctors' });
  }
});

/**
 * POST /api/admin/doctors
 * Create new doctor
 */
router.post('/doctors', auditOperations.createDoctor, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, specialty, credentials, availability } = req.body;

    if (!email || !password || !firstName || !lastName || !specialty) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email, deletedAt: null });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      passwordHash,
      role: 'doctor',
      profile: { firstName, lastName, phone },
      isActive: true
    });
    await user.save();

    const doctor = new Doctor({
      userId: user._id,
      specialty,
      credentials: credentials || [],
      availability: availability || []
    });
    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: { doctorId: doctor._id, userId: user._id, email: user.email, name: user.fullName, specialty: doctor.specialty }
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ success: false, error: 'Failed to create doctor' });
  }
});

/**
 * PUT /api/admin/doctors/:doctorId
 * Update doctor profile
 */
router.put('/doctors/:doctorId', auditOperations.updateDoctor, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { firstName, lastName, phone, specialty, credentials, availability, isActive } = req.body;

    const doctor = await Doctor.findOne({ _id: doctorId, deletedAt: null });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    await captureBeforeState(req, Doctor, doctorId);

    if (specialty) doctor.specialty = specialty;
    if (credentials) doctor.credentials = credentials;
    if (availability) doctor.availability = availability;
    await doctor.save();

    const user = await User.findById(doctor.userId);
    if (user) {
      if (firstName) user.profile.firstName = firstName;
      if (lastName) user.profile.lastName = lastName;
      if (phone) user.profile.phone = phone;
      if (isActive !== undefined) user.isActive = isActive;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: await Doctor.findById(doctorId).populate('userId', 'email profile isActive')
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ success: false, error: 'Failed to update doctor' });
  }
});

/**
 * DELETE /api/admin/doctors/:doctorId
 * Soft delete doctor
 */
router.delete('/doctors/:doctorId', auditOperations.deleteDoctor, async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findOne({ _id: doctorId, deletedAt: null });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    await captureBeforeState(req, Doctor, doctorId);

    doctor.deletedAt = new Date();
    await doctor.save();

    const user = await User.findById(doctor.userId);
    if (user) await user.softDelete();

    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete doctor' });
  }
});

/**
 * GET /api/admin/patients
 * List all patients
 */
router.get('/patients', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { deletedAt: null };
    if (status) query.status = status;
    
    if (search) {
      const users = await User.find({
        role: 'patient',
        $or: [
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      query.userId = { $in: users.map(u => u._id) };
    }

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate('userId', 'email profile')
        .populate('assignedDoctorId')
        .populate({ path: 'assignedDoctorId', populate: { path: 'userId', select: 'profile' } })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Patient.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: patients,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('List patients error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch patients' });
  }
});

/**
 * POST /api/admin/patients
 * Create new patient (admission)
 */
router.post('/patients', auditOperations.createPatient || ((req, res, next) => next()), async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, age, gender, bloodGroup, hospitalId, roomNo, emergencyContact } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, error: 'Missing required fields: email, password, firstName, lastName' });
    }

    const existingUser = await User.findOne({ email, deletedAt: null });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      passwordHash,
      role: 'patient',
      profile: { firstName, lastName, phone, age, gender },
      isActive: true
    });
    await user.save();

    const patient = new Patient({
      userId: user._id,
      hospitalId: hospitalId || `PAT-${Date.now()}`,
      roomNo: roomNo || 'N/A',
      bloodGroup: bloodGroup || 'Unknown',
      emergencyContact: emergencyContact || {},
      status: 'admitted'
    });
    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Patient admitted successfully',
      data: { patientId: patient._id, userId: user._id, email: user.email, hospitalId: patient.hospitalId }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ success: false, error: 'Failed to admit patient' });
  }
});

/**
 * POST /api/admin/assignments
 * Assign doctor to patient
 */
router.post('/assignments', auditOperations.assignDoctor, async (req, res) => {
  try {
    const { patientId, doctorId, notes, validFrom, validUntil } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({ success: false, error: 'patientId and doctorId are required' });
    }

    const [patient, doctor] = await Promise.all([
      Patient.findOne({ _id: patientId, deletedAt: null }),
      Doctor.findOne({ _id: doctorId, deletedAt: null })
    ]);

    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });

    const assignment = new Assignment({
      patientId,
      doctorId,
      assignedBy: req.user.userId,
      from: validFrom ? new Date(validFrom) : new Date(),
      to: validUntil ? new Date(validUntil) : null,
      notes
    });
    await assignment.save();

    patient.assignedDoctorId = doctorId;
    await patient.save();

    if (!doctor.assignedPatients.includes(patientId)) {
      doctor.assignedPatients.push(patientId);
      await doctor.save();
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`doctor:${doctorId}`).emit('assignment:created', { assignmentId: assignment._id, patientId, doctorId });
    }

    res.status(201).json({ success: true, message: 'Doctor assigned successfully', data: assignment });
  } catch (error) {
    console.error('Assign doctor error:', error);
    res.status(500).json({ success: false, error: 'Failed to assign doctor' });
  }
});

/**
 * GET /api/admin/invoices
 * List all invoices
 */
router.get('/invoices', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate({ path: 'patientId', populate: { path: 'userId', select: 'profile' } })
        .populate('issuedBy', 'profile')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ issuedAt: -1 }),
      Invoice.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('List invoices error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
  }
});

/**
 * POST /api/admin/invoices
 * Create new invoice
 */
router.post('/invoices', auditOperations.createInvoice, async (req, res) => {
  try {
    const { patientId, items, dueAt, notes } = req.body;

    if (!patientId || !items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'patientId and items array are required' });
    }

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    const invoice = new Invoice({
      patientId,
      items,
      total,
      issuedBy: req.user.userId,
      status: 'pending',
      issuedAt: new Date(),
      dueAt: dueAt ? new Date(dueAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes
    });

    await invoice.save();

    res.status(201).json({ success: true, message: 'Invoice created successfully', data: invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ success: false, error: 'Failed to create invoice' });
  }
});

/**
 * GET /api/admin/audit-logs
 * Retrieve audit logs with filtering
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resource, actorUserId, startDate, endDate } = req.query;
    
    const skip = (page - 1) * limit;
    const query = {};

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (actorUserId) query.actorUserId = actorUserId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actorUserId', 'email profile')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
