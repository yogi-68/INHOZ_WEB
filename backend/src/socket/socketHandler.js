// Enhanced Socket.IO setup with room-based subscriptions
let io;

const initializeSocket = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Join room based on user role
    socket.on('join-room', ({ userId, role }) => {
      let room;
      
      if (role === 'admin') {
        room = 'admin';
      } else if (role === 'doctor') {
        room = `doctor:${userId}`;
      } else if (role === 'patient') {
        room = `patient:${userId}`;
      }

      if (room) {
        socket.join(room);
        console.log(`👤 User ${userId} (${role}) joined room: ${room}`);
        
        socket.emit('room-joined', { room, userId, role });
      }
    });

    // Leave room
    socket.on('leave-room', ({ room }) => {
      socket.leave(room);
      console.log(`👋 Left room: ${room}`);
    });

    // Request latest vitals
    socket.on('request-vitals', async ({ patientId }) => {
      try {
        const SensorData = require('./models/SensorData');
        const latestData = await SensorData.findOne({ patientId })
          .sort({ timestamp: -1 })
          .limit(1);
        
        socket.emit('patient-vitals-update', {
          patientId,
          data: latestData
        });
      } catch (error) {
        console.error('Error fetching vitals:', error);
      }
    });

    // Device status update
    socket.on('device-status', ({ deviceId, status }) => {
      // Broadcast to admin room
      io.to('admin').emit('device-status-update', { deviceId, status });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

// Emit events to specific rooms
const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

// Emit to admin room
const emitToAdmin = (event, data) => {
  emitToRoom('admin', event, data);
};

// Emit to specific doctor
const emitToDoctor = (doctorId, event, data) => {
  emitToRoom(`doctor:${doctorId}`, event, data);
};

// Emit to specific patient
const emitToPatient = (patientId, event, data) => {
  emitToRoom(`patient:${patientId}`, event, data);
};

// Emit new vitals data
const emitVitalsUpdate = (patientId, doctorId, data) => {
  // Send to patient
  emitToPatient(patientId, 'patient-vitals-update', data);
  
  // Send to assigned doctor
  if (doctorId) {
    emitToDoctor(doctorId, 'patient-vitals-update', data);
  }
  
  // Send to admin
  emitToAdmin('patient-vitals-update', data);
};

// Emit new alert
const emitAlert = (alert, patientId, doctorId) => {
  const alertData = {
    alertId: alert.alertId,
    patientId,
    severity: alert.severity,
    title: alert.title,
    message: alert.message,
    triggeredAt: alert.triggeredAt
  };

  // Send to patient
  emitToPatient(patientId, 'patient-alert', alertData);
  
  // Send to assigned doctor
  if (doctorId) {
    emitToDoctor(doctorId, 'patient-alert', alertData);
  }
  
  // Send to admin
  emitToAdmin('patient-alert', alertData);
};

// Emit new prescription
const emitNewPrescription = (prescription, patientId) => {
  const prescriptionData = {
    prescriptionId: prescription.prescriptionId,
    patientId,
    medications: prescription.medications,
    createdAt: prescription.createdAt
  };

  emitToPatient(patientId, 'new-prescription', prescriptionData);
  emitToAdmin('new-prescription', prescriptionData);
};

// Emit device status change
const emitDeviceStatusChange = (deviceId, status, patientId) => {
  emitToAdmin('device-status-update', { deviceId, status, patientId });
  
  if (patientId) {
    emitToPatient(patientId, 'device-status-update', { deviceId, status });
  }
};

// Emit doctor dashboard update
const emitDoctorDashboardUpdate = (doctorId, stats) => {
  emitToDoctor(doctorId, 'doctor-dashboard-update', stats);
};

// Emit admin stats update
const emitAdminStatsUpdate = (stats) => {
  emitToAdmin('admin-stats-update', stats);
};

module.exports = {
  initializeSocket,
  emitToRoom,
  emitToAdmin,
  emitToDoctor,
  emitToPatient,
  emitVitalsUpdate,
  emitAlert,
  emitNewPrescription,
  emitDeviceStatusChange,
  emitDoctorDashboardUpdate,
  emitAdminStatsUpdate
};
