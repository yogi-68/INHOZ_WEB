const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const Device = require('../models/Device');
const Bill = require('../models/Bill');
const AuditLog = require('../models/AuditLog');

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      totalDoctors,
      activeMonitoring,
      criticalAlerts,
      devicesOnline,
      devicesOffline,
      todayRevenue,
      monthRevenue,
      admissionsToday,
      alertsToday
    ] = await Promise.all([
      Patient.countDocuments({ 'admissionInfo.status': { $in: ['admitted', 'transferred'] } }),
      Doctor.countDocuments({ 'userId.isActive': true }),
      Patient.countDocuments({ monitoringStatus: 'active' }),
      Alert.countDocuments({ severity: 'critical', status: 'active' }),
      Device.countDocuments({ status: 'online' }),
      Device.countDocuments({ status: 'offline' }),
      Bill.aggregate([
        { $match: { billDate: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Bill.aggregate([
        { 
          $match: { 
            billDate: { 
              $gte: new Date(today.getFullYear(), today.getMonth(), 1) 
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Patient.countDocuments({ 
        'admissionInfo.admissionDate': { $gte: today } 
      }),
      Alert.countDocuments({ triggeredAt: { $gte: today } })
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        activeMonitoring,
        criticalAlerts,
        devicesOnline,
        devicesOffline,
        revenueToday: todayRevenue[0]?.total || 0,
        revenueMonth: monthRevenue[0]?.total || 0,
        admissionsToday,
        alertsToday,
        onlineDoctors: await Doctor.countDocuments({ 'availability.status': 'available' })
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

// @route   GET /api/admin/dashboard/charts
// @desc    Get chart data
// @access  Admin
exports.getChartData = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Admissions per day
    const admissions = await Patient.aggregate([
      {
        $match: {
          'admissionInfo.admissionDate': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$admissionInfo.admissionDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Alerts per day
    const alerts = await Alert.aggregate([
      {
        $match: {
          triggeredAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$triggeredAt' } },
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Device usage
    const deviceUsage = await Device.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        admissions,
        alerts,
        deviceUsage
      }
    });

  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chart data'
    });
  }
};

module.exports = exports;
