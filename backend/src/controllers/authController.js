const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');

// Generate JWT tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Log failed attempt
      await AuditLog.create({
        action: 'login_failed',
        actionType: 'login',
        module: 'user',
        details: { email, reason: 'User not found' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
        timestamp: new Date()
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Log failed attempt
      await AuditLog.create({
        userId: user._id,
        userName: user.fullName,
        userRole: user.role,
        action: 'login_failed',
        actionType: 'login',
        module: 'user',
        details: { reason: 'Invalid password' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
        timestamp: new Date()
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get role-specific data
    let roleData = null;
    if (user.role === 'doctor') {
      roleData = await Doctor.findOne({ userId: user._id })
        .select('specialization department availability performance');
    } else if (user.role === 'patient') {
      roleData = await Patient.findOne({ userId: user._id })
        .select('patientId assignedDoctor monitoringStatus riskLevel')
        .populate('assignedDoctor', 'userId');
    }

    // Log successful login
    await AuditLog.create({
      userId: user._id,
      userName: user.fullName,
      userRole: user.role,
      action: 'login_success',
      actionType: 'login',
      module: 'user',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      duration: Date.now() - startTime,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileImage: user.profileImage,
          ...roleData?.toObject()
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({
      success: true,
      data: { accessToken }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Log logout
    await AuditLog.create({
      userId: req.user.userId,
      userRole: req.user.role,
      action: 'logout',
      actionType: 'logout',
      module: 'user',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
};

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide old and new passwords'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log password change
    await AuditLog.create({
      userId: user._id,
      userName: user.fullName,
      userRole: user.role,
      action: 'password_changed',
      actionType: 'update',
      module: 'user',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error changing password'
    });
  }
};

module.exports = exports;
