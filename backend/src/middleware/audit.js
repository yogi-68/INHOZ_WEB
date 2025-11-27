/**
 * Audit Logging Middleware for INHOZ System
 * Tracks sensitive operations with before/after snapshots
 * Immutable audit trail for compliance
 */

const AuditLog = require('../models/AuditLog');

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.connection?.socket?.remoteAddress ||
         'unknown';
};

/**
 * Create audit log entry
 * @param {Object} options - Audit log options
 */
async function createAuditLog({
  actorUserId,
  actorRole,
  action,
  resource,
  resourceId,
  before = null,
  after = null,
  ipAddress,
  metadata = {}
}) {
  try {
    const auditLog = new AuditLog({
      actorUserId,
      actorRole,
      action,
      resource,
      resourceId,
      before,
      after,
      ipAddress,
      metadata,
      createdAt: new Date()
    });
    
    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
    return null;
  }
}

/**
 * Middleware to automatically log resource modifications
 * Use after authentication middleware
 */
const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to capture response
    res.json = function(data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Don't await - log asynchronously
        createAuditLog({
          actorUserId: req.user?.userId,
          actorRole: req.user?.role,
          action,
          resource,
          resourceId: req.params.id || req.params.patientId || req.params.doctorId || data?.data?._id,
          before: req.auditBefore || null,
          after: data?.data || null,
          ipAddress: getClientIP(req),
          metadata: {
            method: req.method,
            path: req.originalUrl,
            userAgent: req.headers['user-agent']
          }
        }).catch(err => {
          console.error('Audit log creation failed:', err);
        });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Capture resource state before modification
 * Call this in route handlers before making changes
 */
async function captureBeforeState(req, Model, resourceId) {
  try {
    const resource = await Model.findById(resourceId).lean();
    req.auditBefore = resource;
    return resource;
  } catch (error) {
    console.error('Failed to capture before state:', error);
    req.auditBefore = null;
    return null;
  }
}

/**
 * Pre-configured audit middleware for common operations
 */
const auditOperations = {
  // User operations
  createUser: auditMiddleware('CREATE_USER', 'user'),
  updateUser: auditMiddleware('UPDATE_USER', 'user'),
  deleteUser: auditMiddleware('DELETE_USER', 'user'),
  
  // Patient operations
  createPatient: auditMiddleware('CREATE_PATIENT', 'patient'),
  updatePatient: auditMiddleware('UPDATE_PATIENT', 'patient'),
  deletePatient: auditMiddleware('DELETE_PATIENT', 'patient'),
  dischargePatient: auditMiddleware('DISCHARGE_PATIENT', 'patient'),
  
  // Doctor operations
  createDoctor: auditMiddleware('CREATE_DOCTOR', 'doctor'),
  updateDoctor: auditMiddleware('UPDATE_DOCTOR', 'doctor'),
  deleteDoctor: auditMiddleware('DELETE_DOCTOR', 'doctor'),
  
  // Assignment operations
  assignDoctor: auditMiddleware('ASSIGN_DOCTOR', 'assignment'),
  unassignDoctor: auditMiddleware('UNASSIGN_DOCTOR', 'assignment'),
  
  // Prescription operations
  createPrescription: auditMiddleware('CREATE_PRESCRIPTION', 'prescription'),
  updatePrescription: auditMiddleware('UPDATE_PRESCRIPTION', 'prescription'),
  deletePrescription: auditMiddleware('DELETE_PRESCRIPTION', 'prescription'),
  
  // Invoice operations
  createInvoice: auditMiddleware('CREATE_INVOICE', 'invoice'),
  updateInvoice: auditMiddleware('UPDATE_INVOICE', 'invoice'),
  payInvoice: auditMiddleware('PAY_INVOICE', 'invoice'),
  cancelInvoice: auditMiddleware('CANCEL_INVOICE', 'invoice'),
  
  // Alert operations
  acknowledgeAlert: auditMiddleware('ACKNOWLEDGE_ALERT', 'alert'),
  
  // Authentication operations
  login: auditMiddleware('LOGIN', 'auth'),
  logout: auditMiddleware('LOGOUT', 'auth'),
  refreshToken: auditMiddleware('REFRESH_TOKEN', 'auth')
};

/**
 * Manual audit logging for custom operations
 */
async function logAudit(req, action, resource, resourceId, before = null, after = null) {
  return createAuditLog({
    actorUserId: req.user?.userId,
    actorRole: req.user?.role,
    action,
    resource,
    resourceId,
    before,
    after,
    ipAddress: getClientIP(req),
    metadata: {
      method: req.method,
      path: req.originalUrl,
      userAgent: req.headers['user-agent']
    }
  });
}

module.exports = {
  createAuditLog,
  auditMiddleware,
  captureBeforeState,
  auditOperations,
  logAudit,
  getClientIP
};
