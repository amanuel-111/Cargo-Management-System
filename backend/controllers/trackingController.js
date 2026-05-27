const { LocationUpdate, User, Vehicle, Shipment, ShipmentStatusHistory } = require('../models');

// POST /api/tracking/location
exports.updateLocation = async (req, res, next) => {
  try {
    const { lat, lng, speed, heading, accuracy, shipmentId } = req.body;

    // Only drivers can update location
    if (req.user.role !== 'driver')
      return res.status(403).json({ success: false, message: 'Only drivers can update location' });

    // Validate coordinates
    if (!lat || !lng)
      return res.status(400).json({ success: false, message: 'lat and lng are required' });

    // If shipmentId provided, verify driver owns that shipment
    if (shipmentId) {
      const shipment = await Shipment.findByPk(shipmentId);
      if (!shipment || shipment.driverId !== req.user.id)
        return res.status(403).json({ success: false, message: 'Not authorized for this shipment' });
    }

    const locationUpdate = await LocationUpdate.create({
      driverId: req.user.id,
      lat, lng, speed, heading, accuracy,
      shipmentId: shipmentId || null,
    });

    // Update driver's current position
    await User.update(
      { currentLat: lat, currentLng: lng, lastSeen: new Date() },
      { where: { id: req.user.id } }
    );

    // Update vehicle position — re-fetch to get latest vehicleAssignedId
    const driver = await User.findByPk(req.user.id, { attributes: ['vehicleAssignedId'] });
    if (driver?.vehicleAssignedId) {
      await Vehicle.update({ currentLat: lat, currentLng: lng }, { where: { id: driver.vehicleAssignedId } });
    }

    if (req.io) {
      // Emit to fleet managers only (not broadcast to everyone)
      req.io.to('role_fleet_manager').emit('driverLocationUpdate', {
        driverId: req.user.id, lat, lng, speed, heading, shipmentId, timestamp: new Date(),
      });
      if (shipmentId) {
        req.io.to(`shipment_${shipmentId}`).emit('driverLocation', {
          driverId: req.user.id, lat, lng, speed, heading, timestamp: new Date(),
        });
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
    const driverId = req.params.driverId;

    // Drivers can only see their own history; fleet/admin can see any
    if (req.user.role === 'driver' && String(req.user.id) !== String(driverId))
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const where = { driverId };
    if (shipmentId) where.shipmentId = shipmentId;

    const locations = await LocationUpdate.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Math.min(Number(limit), 500), // cap at 500
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

    // Customers can only see their own shipment route
    if (req.user.role === 'customer' && shipment.customerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const route = await LocationUpdate.findAll({
      where: { shipmentId: req.params.shipmentId },
      order: [['createdAt', 'ASC']],
      attributes: ['lat', 'lng', 'createdAt', 'speed'],
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
