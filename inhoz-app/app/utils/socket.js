import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://inhoz-backend.onrender.com';
// Using Render backend for production
// Local development: http://localhost:3001

let socket = null;
let isInitializing = false;

export const initializeSocket = async () => {
  try {
    // Prevent multiple simultaneous initializations
    if (isInitializing) {
      console.log('Socket initialization already in progress...');
      return socket;
    }

    if (socket?.connected) {
      console.log('Socket already connected');
      return socket;
    }

    isInitializing = true;
    const token = await AsyncStorage.getItem('accessToken');
    
    if (!token) {
      console.warn('No token found for socket connection - continuing without auth');
      isInitializing = false;
      return null;
    }

    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
      timeout: 10000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      isInitializing = false;
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      isInitializing = false;
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection error (non-critical):', error.message);
      isInitializing = false;
      // Don't throw error - app should work without real-time updates
    });

    socket.on('error', (error) => {
      console.warn('Socket error (non-critical):', error.message);
      // Don't throw error - app should work without real-time updates
    });

    return socket;
  } catch (error) {
    console.warn('Socket initialization failed (non-critical):', error.message);
    isInitializing = false;
    return null;
  }
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
