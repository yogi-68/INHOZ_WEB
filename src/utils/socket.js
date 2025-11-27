import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket.IO disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event handlers
export const onVitalsUpdate = (callback) => {
  const socket = getSocket();
  socket.on('vitals:update', callback);
  return () => socket.off('vitals:update', callback);
};

export const onAlertNew = (callback) => {
  const socket = getSocket();
  socket.on('alert:new', callback);
  return () => socket.off('alert:new', callback);
};

export const onMLEvent = (callback) => {
  const socket = getSocket();
  socket.on('ml:event', callback);
  return () => socket.off('ml:event', callback);
};

export const monitorPatient = (patientId) => {
  const socket = getSocket();
  socket.emit('monitor:patient', patientId);
};

export const unmonitorPatient = (patientId) => {
  const socket = getSocket();
  socket.emit('unmonitor:patient', patientId);
};

export const acknowledgeAlert = (alertId) => {
  const socket = getSocket();
  socket.emit('alert:ack', alertId);
};
