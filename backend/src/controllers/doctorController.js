const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const Prescription = require('../models/Prescription');
const Note = require('../models/Note');
const AuditLog = require('../models/AuditLog');

// @route   GET /api/doctor/dashboard/stats
// @desc    Get doctor dashboard statistics
// @access  Doctor
exports.getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    
    // Find doctor profile
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor profile not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      activeMonitoring,
      criticalPatients,
      todayAlerts,
      pendingAlerts,
      todayPrescriptions
    ] = await Promise.all([
      Patient.countDocuments({ assignedDoctor: doctor._id }),
      Patient.countDocuments({ 
        assignedDoctor: doctor._id,
        monitoringStatus: 'active'
      }),
      Patient.countDocuments({
        assignedDoctor: doctor._id,
        riskLevel: 'critical'
      }),
      Alert.countDocuments({
        doctorId: doctor._id,
        triggeredAt: { $gte: today }
      }),
      Alert.countDocuments({
        doctorId: doctor._id,
        status: 'active'
      }),
      Prescription.countDocuments({
        doctorId: doctor._id,
        createdAt: { $gte: today }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        activeMonitoring,
        criticalPatients,
        todayAlerts,
        pendingAlerts,
        todayPrescriptions,
        availability: doctor.availability.status
      }
    });

  } catch (error) {
    console.error('Get doctor dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

// @route   GET /api/doctor/patients
// @desc    Get doctor's patients list
// @access  Doctor
exports.getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { page = 1, limit = 10, search, status } = req.query;

    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor profile not found'
      });
    }

    const query = { assignedDoctor: doctor._id };

    if (search) {
      query.$or = [
        { 'userId.firstName': { $regex: search, $options: 'i' } },
        { 'userId.lastName': { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.monitoringStatus = status;
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('userId', 'firstName lastName email profileImage')
      .sort({ 'admissionInfo.admissionDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get latest vitals for each patient
    const patientsWithVitals = await Promise.all(
      patients.map(async (patient) => {
        const latestVitals = await SensorData.findOne({ patientId: patient._id })
          .sort({ timestamp: -1 })
          .select('heartRate spo2 temperature bloodPressure timestamp')
          .lean();

        const activeAlerts = await Alert.countDocuments({
          patientId: patient._id,
          status: 'active'
        });

        return {
          ...patient,
          latestVitals,
          activeAlerts
        };
      })
    );

    res.json({
      success: true,
      data: {
        patients: patientsWithVitals,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patients'
    });
  }
};

// @route   GET /api/doctor/patients/:patientId
// @desc    Get patient details
// @access  Doctor
exports.getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.userId;

    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor profile not found'
      });
    }

    const patient = await Patient.findOne({
      _id: patientId,
      assignedDoctor: doctor._id
    })
      .populate('userId', 'firstName lastName email phone profileImage')
      .lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found or not assigned to you'
      });
    }

    // Get latest vitals
    const latestVitals = await SensorData.findOne({ patientId })
      .sort({ timestamp: -1 })
      .lean();

    // Get recent vitals history (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const vitalsHistory = await SensorData.find({
      patientId,
      timestamp: { $gte: oneDayAgo }
    })
      .sort({ timestamp: 1 })
      .select('heartRate spo2 temperature bloodPressure timestamp')
      .lean();

    // Get active alerts
    const activeAlerts = await Alert.find({
      patientId,
      status: 'active'
    })
      .sort({ triggeredAt: -1 })
      .limit(10)
      .lean();

    // Get recent prescriptions
    const prescriptions = await Prescription.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent notes
    const notes = await Note.find({ patientId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        patient,
        latestVitals,
        vitalsHistory,
        activeAlerts,
        prescriptions,
        notes
      }
    });

  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient details'
    });
  }
};

// @route   POST /api/doctor/patients/:patientId/notes
// @desc    Add note to patient
// @access  Doctor
exports.addPatientNote = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { title, content, priority, category } = req.body;
    const doctorId = req.user.userId;

    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor profile not found'
      });
    }

    // Verify patient is assigned to this doctor
    const patient = await Patient.findOne({
      _id: patientId,
      assignedDoctor: doctor._id
    });

    if (!patient) {
      return res.status(403).json({
        success: false,
        error: 'Patient not assigned to you'
      });
    }

    const note = await Note.create({
      patientId,
      createdBy: doctorId,
      title,
      content,
      priority: priority || 'normal',
      category: category || 'general'
    });

    // Log audit
    await AuditLog.create({
      userId: doctorId,
      userRole: 'doctor',
      action: 'note_created',
      actionType: 'create',
      module: 'notes',
      targetId: note._id,
      targetModel: 'Note',
      details: { patientId, title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: note
    });

  } catch (error) {
    console.error('Add patient note error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add note'
    });
  }
};

// @route   POST /api/doctor/prescriptions
// @desc    Create prescription
// @access  Doctor
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medications, diagnosis, instructions, followUpDate } = req.body;
    const doctorId = req.user.userId;

    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor profile not found'
      });
    }

    // Verify patient is assigned to this doctor
    const patient = await Patient.findOne({
      _id: patientId,
      assignedDoctor: doctor._id
    });

    if (!patient) {
      return res.status(403).json({
        success: false,
        error: 'Patient not assigned to you'
      });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: doctor._id,
      medications,
      diagnosis,
      instructions,
      followUpDate,
      status: 'active'
    });

    // Emit real-time event
    const { emitNewPrescription } = require('../socket/socketHandler');
    emitNewPrescription(prescription, patientId);

    // Log audit
    await AuditLog.create({
      userId: doctorId,
      userRole: 'doctor',
      action: 'prescription_created',
      actionType: 'create',
      module: 'prescriptions',
      targetId: prescription._id,
      targetModel: 'Prescription',
      details: { patientId, medicationCount: medications.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: prescription
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create prescription'
    });
  }
};

module.exports = exports;
