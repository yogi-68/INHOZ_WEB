const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = async (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN.split(','),
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Redis adapter disabled for now (can add later for production scaling)
  console.log('✅ Socket.IO initialized with default memory adapter');

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.role})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join role-specific rooms
    if (socket.role === 'admin') {
      socket.join('admins');
    } else if (socket.role === 'doctor') {
      socket.join('doctors');
    } else if (socket.role === 'patient') {
      socket.join('patients');
    }

    // Join patient room (for doctors monitoring specific patients)
    socket.on('monitor:patient', (patientId) => {
      if (socket.role === 'doctor' || socket.role === 'admin') {
        socket.join(`patient:${patientId}`);
        console.log(`Doctor ${socket.userId} monitoring patient ${patientId}`);
      }
    });

    // Leave patient room
    socket.on('unmonitor:patient', (patientId) => {
      socket.leave(`patient:${patientId}`);
      console.log(`Doctor ${socket.userId} stopped monitoring patient ${patientId}`);
    });

    // Handle vitals acknowledgment
    socket.on('vitals:ack', (data) => {
      console.log(`Vitals acknowledged by ${socket.userId}:`, data);
    });

    // Handle alert acknowledgment
    socket.on('alert:ack', async (alertId) => {
      try {
        // Update alert in database
        const Alert = require('../models/Alert');
        await Alert.findByIdAndUpdate(alertId, {
          acknowledgedAt: new Date(),
          acknowledgedBy: socket.userId
        });

        // Broadcast to relevant users
        io.to(`alert:${alertId}`).emit('alert:acknowledged', {
          alertId,
          acknowledgedBy: socket.userId,
          acknowledgedAt: new Date()
        });

        console.log(`Alert ${alertId} acknowledged by ${socket.userId}`);
      } catch (error) {
        console.error('Error acknowledging alert:', error);
        socket.emit('error', { message: 'Failed to acknowledge alert' });
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

// Emit vitals to patient room and assigned doctor
const emitVitals = (patientId, vitalsData) => {
  if (!io) return;
  
  io.to(`patient:${patientId}`).emit('vitals:update', vitalsData);
  console.log(`Vitals emitted for patient ${patientId}`);
};

// Emit alert to doctors and admins
const emitAlert = (alert) => {
  if (!io) return;

  // Send to specific doctor if assigned
  if (alert.doctorId) {
    io.to(`user:${alert.doctorId}`).emit('alert:new', alert);
  }

  // Send to all admins
  io.to('admins').emit('alert:new', alert);

  // Send to patient
  io.to(`user:${alert.patientId}`).emit('alert:new', alert);

  console.log(`Alert emitted: ${alert.severity} - ${alert.message}`);
};

// Emit ML event
const emitMLEvent = (event) => {
  if (!io) return;

  io.to(`patient:${event.patientId}`).emit('ml:event', event);
  io.to('admins').emit('ml:event', event);
  
  console.log(`ML event emitted: ${event.event} for patient ${event.patientId}`);
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  emitVitals,
  emitAlert,
  emitMLEvent,
  getIO
};
