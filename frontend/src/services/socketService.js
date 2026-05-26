import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('disconnect', () => console.log('Socket disconnected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const joinShipmentRoom = (shipmentId) => {
  socket?.emit('joinShipment', shipmentId);
};

export const leaveShipmentRoom = (shipmentId) => {
  socket?.emit('leaveShipment', shipmentId);
};

export const updateDriverLocation = (locationData) => {
  socket?.emit('updateLocation', locationData);
};

export const toggleDriverAvailability = (isOnline) => {
  socket?.emit('toggleAvailability', isOnline);
};
