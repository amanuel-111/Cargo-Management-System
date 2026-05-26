const { LocationUpdate, User, Vehicle, Shipment, ShipmentStatusHistory } = require('../models');

// POST /api/tracking/location
exports.updateLocation = async (req, res, next) => {
  try {
    const { lat, lng, speed, heading, accuracy, shipmentId } = req.body;

    const locationUpdate = await LocationUpdate.create({
      driverId: req.user.id,
      lat,
      lng,
      speed,
      heading,
      accuracy,
      shipmentId: shipmentId || null,
    });

    await User.update({ currentLat: lat, currentLng: lng, lastSeen: new Date() }, { where: { id: req.user.id } });

    const driver = await User.findByPk(req.user.id);
    if (driver.vehicleAssignedId) {
      await Vehicle.update({ currentLat: lat, currentLng: lng }, { where: { id: driver.vehicleAssignedId } });
    }

    if (req.io) {
      req.io.emit('driverLocation', { driverId: req.user.id, lat, lng, speed, heading, shipmentId, timestamp: new Date() });
      if (shipmentId) {
        req.io.to(`shipment_${shipmentId}`).emit('driverLocation', { driverId: req.user.id, lat, lng, speed, heading, timestamp: new Date() });
      }
    }

    res.status(200).json({ success: true, data: locationUpdate });
  } catch (error) {
    next(error);
  }
};

// GET /api/tracking/driver/:driverId
exports.getDriverLocationHistory = async (req, res, next) => {
  try {
    const { limit = 50, shipmentId } = req.query;
    const where = { driverId: req.params.driverId };
    if (shipmentId) where.shipmentId = shipmentId;

    const locations = await LocationUpdate.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: Number(limit),
    });
    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
};

// GET /api/tracking/shipment/:shipmentId/route
exports.getShipmentRoute = async (req, res, next) => {
  try {
    const shipment = await Shipment.findByPk(req.params.shipmentId, {
      include: [{ model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'currentLat', 'currentLng'], required: false }],
    });
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    const route = await LocationUpdate.findAll({
      where: { shipmentId: req.params.shipmentId },
      order: [['timestamp', 'ASC']],
      attributes: ['lat', 'lng', 'timestamp', 'speed'],
    });

    res.status(200).json({ success: true, data: { shipment, route } });
  } catch (error) {
    next(error);
  }
};

// GET /api/tracking/active-drivers
exports.getActiveDrivers = async (req, res, next) => {
  try {
    const drivers = await User.findAll({
      where: { role: 'driver', isOnline: true, isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'avatar', 'currentLat', 'currentLng', 'rating', 'vehicleAssignedId'],
    });
    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    next(error);
  }
};
