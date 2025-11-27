const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { authenticate } = require('../middleware/rbac');
const { auditOperations } = require('../middleware/audit');

const router = express.Router();

// Login
router.post('/login', auditOperations.login, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email, deletedAt: null });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Get role-specific profile
    let roleProfile = null;
    if (user.role === 'doctor') {
      roleProfile = await Doctor.findOne({ userId: user._id, deletedAt: null });
    } else if (user.role === 'patient') {
      roleProfile = await Patient.findOne({ userId: user._id, deletedAt: null })
        .populate('assignedDoctorId')
        .populate({ path: 'assignedDoctorId', populate: { path: 'userId', select: 'profile' } });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    // Store user in req for audit logging
    req.user = { userId: user._id, role: user.role };

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          roleProfile: roleProfile ? { id: roleProfile._id, ...roleProfile.toObject() } : null
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', auditOperations.refreshToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ _id: decoded.userId, deletedAt: null });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'User not found or inactive' });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );

    req.user = { userId: user._id, role: user.role };

    res.json({ success: true, data: { accessToken } });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', authenticate, auditOperations.logout, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let roleProfile = null;
    if (user.role === 'doctor') {
      roleProfile = await Doctor.findOne({ userId: user._id, deletedAt: null });
    } else if (user.role === 'patient') {
      roleProfile = await Patient.findOne({ userId: user._id, deletedAt: null })
        .populate('assignedDoctorId')
        .populate({ path: 'assignedDoctorId', populate: { path: 'userId', select: 'profile' } });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          isActive: user.isActive,
          roleProfile: roleProfile ? roleProfile.toObject() : null
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

module.exports = router;
