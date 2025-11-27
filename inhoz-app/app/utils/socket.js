import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'http://localhost:3001';
// For Android emulator: http://10.0.2.2:3001
// For iOS simulator: http://localhost:3001
// For physical device: http://YOUR_COMPUTER_IP:3001

let socket = null;

export const initializeSocket = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  
  if (!token) {
    console.error('No token found, cannot initialize socket');
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized. Call initializeSocket() first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected manually');
  }
};

export const joinRoom = (room) => {
  if (socket?.connected) {
    socket.emit('join:room', room);
    console.log(`Joined room: ${room}`);
  } else {
    console.warn('Socket not connected. Cannot join room.');
  }
};

export const leaveRoom = (room) => {
  if (socket?.connected) {
    socket.emit('leave:room', room);
    console.log(`Left room: ${room}`);
  }
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
};
