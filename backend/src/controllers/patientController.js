const Patient = require('../models/Patient');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');
const Device = require('../models/Device');

// @route   GET /api/patient/dashboard/stats
// @desc    Get patient dashboard statistics
// @access  Patient
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const patient = await Patient.findOne({ userId })
      .populate('assignedDoctor')
      .populate({
        path: 'assignedDoctor',
        populate: { path: 'userId', select: 'firstName lastName profileImage' }
      })
      .lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }

    // Get latest vitals
    const latestVitals = await SensorData.findOne({ patientId: patient._id })
      .sort({ timestamp: -1 })
      .select('heartRate spo2 temperature bloodPressure respiratoryRate timestamp')
      .lean();

    // Get active alerts count
    const activeAlerts = await Alert.countDocuments({
      patientId: patient._id,
      status: 'active'
    });

    // Get active prescriptions count
    const activePrescriptions = await Prescription.countDocuments({
      patientId: patient._id,
      status: 'active'
    });

    // Get pending bills total
    const pendingBills = await Bill.aggregate([
      {
        $match: {
          patientId: patient._id,
          paymentStatus: { $in: ['pending', 'partial'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountDue' }
        }
      }
    ]);

    // Get connected devices
    const devices = await Device.find({
      patientId: patient._id,
      status: 'online'
    })
      .select('deviceId deviceType battery status')
      .lean();

    res.json({
      success: true,
      data: {
        patient: {
          id: patient._id,
          patientId: patient.patientId,
          name: `${patient.userId.firstName} ${patient.userId.lastName}`,
          assignedDoctor: patient.assignedDoctor,
          monitoringStatus: patient.monitoringStatus,
          riskLevel: patient.riskLevel,
          admissionInfo: patient.admissionInfo
        },
        latestVitals,
        activeAlerts,
        activePrescriptions,
        pendingBillsAmount: pendingBills[0]?.total || 0,
        devices
      }
    });

  } catch (error) {
    console.error('Get patient dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

// @route   GET /api/patient/vitals/history
// @desc    Get patient vitals history
// @access  Patient
exports.getVitalsHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = 'day', vitalType } = req.query;

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'hour':
        startDate = new Date(now - 60 * 60 * 1000);
        break;
      case 'day':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 24 * 60 * 60 * 1000);
    }

    const query = {
      patientId: patient._id,
      timestamp: { $gte: startDate }
    };

    const projection = vitalType 
      ? { timestamp: 1, [vitalType]: 1 }
      : { timestamp: 1, heartRate: 1, spo2: 1, temperature: 1, bloodPressure: 1, respiratoryRate: 1 };

    const vitals = await SensorData.find(query)
      .select(projection)
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        vitals,
        period,
        vitalType: vitalType || 'all'
      }
    });

  } catch (error) {
    console.error('Get vitals history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vitals history'
    });
  }
};

// @route   GET /api/patient/alerts
// @desc    Get patient alerts
// @access  Patient
exports.getMyAlerts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, status, severity } = req.query;

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }

    const query = { patientId: patient._id };

    if (status) {
      query.status = status;
    }

    if (severity) {
      query.severity = severity;
    }

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .sort({ triggeredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
};

// @route   GET /api/patient/prescriptions
// @desc    Get patient prescriptions
// @access  Patient
exports.getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }

    const query = { patientId: patient._id };

    if (status) {
      query.status = status;
    }

    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate('doctorId')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName profileImage' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prescriptions'
    });
  }
};

// @route   GET /api/patient/billing
// @desc    Get patient bills
// @access  Patient
exports.getMyBills = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient profile not found'
      });
    }

    const query = { patientId: patient._id };

    if (status) {
      query.paymentStatus = status;
    }

    const total = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .sort({ billDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Calculate totals
    const totals = await Bill.aggregate([
      { $match: { patientId: patient._id } },
      {
        $group: {
          _id: '$paymentStatus',
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        bills,
        totals,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bills'
    });
  }
};

module.exports = exports;
