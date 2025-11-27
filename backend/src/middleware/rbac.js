/**
 * RBAC Middleware for INHOZ System
 * Verifies JWT role claims on endpoints
 * Rejects with 403 if insufficient permissions
 */

const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and extract user information
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Check if user has required role(s)
 * @param {String|Array} allowedRoles - Single role or array of allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole
      });
    }
    
    next();
  };
};

/**
 * Check if user is admin
 */
const requireAdmin = authorize('admin');

/**
 * Check if user is doctor or admin
 */
const requireDoctor = authorize('doctor', 'admin');

/**
 * Check if user is patient, doctor, or admin
 */
const requirePatient = authorize('patient', 'doctor', 'admin');

/**
 * Check if user can access specific patient data
 * Patients can only access their own data
 * Doctors can access assigned patients
 * Admins can access all
 */
const canAccessPatient = async (req, res, next) => {
  try {
    const { role, userId } = req.user;
    const targetPatientId = req.params.patientId || req.body.patientId;
    
    if (!targetPatientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID required'
      });
    }
    
    // Admin can access all
    if (role === 'admin') {
      return next();
    }
    
    // For patient role, verify they're accessing their own data
    if (role === 'patient') {
      const Patient = require('../models/Patient');
      const patient = await Patient.findOne({ 
        _id: targetPatientId, 
        userId: userId,
        deletedAt: null 
      });
      
      if (!patient) {
        return res.status(403).json({
          success: false,
          error: 'Cannot access other patient data'
        });
      }
      
      return next();
    }
    
    // For doctor role, verify patient is assigned to them
    if (role === 'doctor') {
      const Doctor = require('../models/Doctor');
      const Patient = require('../models/Patient');
      
      const doctor = await Doctor.findOne({ userId: userId, deletedAt: null });
      
      if (!doctor) {
        return res.status(403).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }
      
      const patient = await Patient.findOne({
        _id: targetPatientId,
        assignedDoctorId: doctor._id,
        deletedAt: null
      });
      
      if (!patient) {
        return res.status(403).json({
          success: false,
          error: 'Patient not assigned to you'
        });
      }
      
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions'
    });
    
  } catch (error) {
    console.error('Patient access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization check failed'
    });
  }
};

/**
 * Device API key authentication for ingestion endpoints
 */
const authenticateDevice = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-device-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Device API key required'
      });
    }
    
    // In production, verify against database
    // For now, check against environment variable
    const validKeys = (process.env.DEVICE_API_KEYS || '').split(',');
    
    if (!validKeys.includes(apiKey)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid device API key'
      });
    }
    
    // Attach device context
    req.device = {
      apiKey: apiKey,
      authenticated: true
    };
    
    next();
  } catch (error) {
    console.error('Device authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Device authentication failed'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  requireDoctor,
  requirePatient,
  canAccessPatient,
  authenticateDevice
};
