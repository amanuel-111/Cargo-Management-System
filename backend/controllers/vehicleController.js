const { Op } = require('sequelize');
const { Vehicle, User } = require('../models');

// POST /api/vehicles
exports.createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// GET /api/vehicles
exports.getVehicles = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 10, search } = req.query;
    const where = { isActive: true };

    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { plateNumber: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Vehicle.findAndCountAll({
      where,
      include: [{ model: User, as: 'assignedDriver', attributes: ['id', 'firstName', 'lastName', 'phone', 'avatar', 'isOnline'], required: false }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.status(200).json({ success: true, count: rows.length, total: count, pages: Math.ceil(count / limit), data: rows });
  } catch (error) {
    next(error);
  }
};

// GET /api/vehicles/:id
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [{ model: User, as: 'assignedDriver', attributes: ['id', 'firstName', 'lastName', 'phone'], required: false }],
    });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// PUT /api/vehicles/:id
exports.updateVehicle = async (req, res, next) => {
  try {
    // Whitelist updatable fields — prevent overwriting sensitive columns
    const allowed = ['plateNumber','type','brand','model','year','capacity','volumeCapacity',
      'fuelType','status','insuranceExpiry','registrationExpiry','lastMaintenanceDate','nextMaintenanceDate','mileage'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    await Vehicle.update(updates, { where: { id: req.params.id } });
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [{ model: User, as: 'assignedDriver', attributes: ['id','firstName','lastName','phone'], required: false }],
    });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res, next) => {
  try {
    await Vehicle.update({ isActive: false }, { where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Vehicle deactivated' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/vehicles/:id/assign-driver
exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    const driver = await User.findByPk(driverId);
    if (!driver || driver.role !== 'driver')
      return res.status(400).json({ success: false, message: 'Invalid driver' });

    // Unassign from previous vehicle
    await Vehicle.update({ assignedDriverId: null }, { where: { assignedDriverId: driverId } });

    await Vehicle.update({ assignedDriverId: driverId }, { where: { id: req.params.id } });
    await User.update({ vehicleAssignedId: req.params.id }, { where: { id: driverId } });

    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [{ model: User, as: 'assignedDriver', attributes: ['id', 'firstName', 'lastName', 'phone'], required: false }],
    });
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

// GET /api/vehicles/live-locations
exports.getLiveLocations = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: { status: 'in_transit', isActive: true },
      include: [{ model: User, as: 'assignedDriver', attributes: ['id', 'firstName', 'lastName', 'phone', 'isOnline', 'currentLat', 'currentLng'], required: false }],
      attributes: ['id', 'plateNumber', 'type', 'brand', 'model', 'currentLat', 'currentLng', 'status'],
    });
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};
