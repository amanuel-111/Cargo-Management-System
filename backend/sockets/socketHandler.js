const jwt = require('jsonwebtoken');
const { User } = require('../models');

const socketHandler = (io) => {
  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.firstName} (${socket.user.role})`);

    socket.join(`user_${socket.user.id}`);
    socket.join(`role_${socket.user.role}`);

    User.update({ isOnline: true, lastSeen: new Date() }, { where: { id: socket.user.id } });

    socket.on('joinShipment', (shipmentId) => socket.join(`shipment_${shipmentId}`));
    socket.on('leaveShipment', (shipmentId) => socket.leave(`shipment_${shipmentId}`));

    socket.on('updateLocation', async ({ lat, lng, shipmentId, speed, heading }) => {
      const payload = { driverId: socket.user.id, driverName: `${socket.user.firstName} ${socket.user.lastName}`, lat, lng, speed, heading, timestamp: new Date() };

      io.to('role_fleet_manager').emit('driverLocationUpdate', payload);
      if (shipmentId) io.to(`shipment_${shipmentId}`).emit('driverLocation', payload);

      await User.update({ currentLat: lat, currentLng: lng, lastSeen: new Date() }, { where: { id: socket.user.id } });
    });

    socket.on('toggleAvailability', async (isOnline) => {
      await User.update({ isOnline }, { where: { id: socket.user.id } });
      io.to('role_fleet_manager').emit('driverAvailabilityChange', { driverId: socket.user.id, isOnline });
    });

    socket.on('sendMessage', ({ recipientId, message }) => {
      io.to(`user_${recipientId}`).emit('newMessage', {
        from: socket.user.id,
        fromName: `${socket.user.firstName} ${socket.user.lastName}`,
        message,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.user.firstName}`);
      await User.update({ isOnline: false, lastSeen: new Date() }, { where: { id: socket.user.id } });
      io.to('role_fleet_manager').emit('driverAvailabilityChange', { driverId: socket.user.id, isOnline: false });
    });
  });
};

module.exports = socketHandler;
