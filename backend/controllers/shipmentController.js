const { Op } = require('sequelize');
const { Shipment, ShipmentStatusHistory, User, Vehicle, Notification } = require('../models');
const notificationService = require('../services/notificationService');

// ── Pricing helpers ───────────────────────────────────────────
const PRICE_PER_KM = 25;          // ETB per km
const MIN_PRICE    = 200;         // minimum fare in ETB
const WEIGHT_RATE  = 2;           // ETB per kg (secondary surcharge)

/**
 * Haversine distance between two lat/lng points — returns km.
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate shipment price breakdown.
 * Returns { distanceKm, distancePrice, weightPrice, totalPrice }
 */
function calculatePrice(pickupLat, pickupLng, destLat, destLng, weightKg) {
  let distanceKm = 0;
  let distancePrice = 0;

  if (pickupLat && pickupLng && destLat && destLng) {
    distanceKm    = parseFloat(haversineKm(pickupLat, pickupLng, destLat, destLng).toFixed(2));
    distancePrice = parseFloat((distanceKm * PRICE_PER_KM).toFixed(2));
  }

  const weightPrice = parseFloat(((Number(weightKg) || 0) * WEIGHT_RATE).toFixed(2));
  const total       = Math.max(distancePrice + weightPrice, MIN_PRICE);

  return {
    distanceKm,
    distancePrice,
    weightPrice,
    totalPrice: parseFloat(total.toFixed(2)),
  };
}

// POST /api/shipments
exports.createShipment = async (req, res, next) => {
  try {
    const b = req.body;

    const pricing = calculatePrice(
      b.pickup?.lat,
      b.pickup?.lng,
      b.destination?.lat,
      b.destination?.lng,
      b.cargo?.weight
    );

    const shipment = await Shipment.create({
      customerId: req.user.id,
      pickupAddress: b.pickup.address,
      pickupCity: b.pickup.city,
      pickupRegion: b.pickup.region,
      pickupLat: b.pickup.lat || null,
      pickupLng: b.pickup.lng || null,
      pickupContactName: b.pickup.contactName,
      pickupContactPhone: b.pickup.contactPhone,
      destAddress: b.destination.address,
      destCity: b.destination.city,
      destRegion: b.destination.region,
      destLat: b.destination.lat || null,
      destLng: b.destination.lng || null,
      destContactName: b.destination.contactName,
      destContactPhone: b.destination.contactPhone,
      cargoDescription: b.cargo.description,
      cargoCategory: b.cargo.category || 'general',
      cargoWeight: b.cargo.weight,
      cargoQuantity: b.cargo.quantity || 1,
      specialInstructions: b.cargo.specialInstructions,
      priority: b.priority || 'normal',
      basePrice: 0,
      distancePrice: pricing.distancePrice,
      weightPrice: pricing.weightPrice,
      totalPrice: pricing.totalPrice,
      estimatedDistance: pricing.distanceKm || null,
    });

    await ShipmentStatusHistory.create({ shipmentId: shipment.id, status: 'pending', note: 'Shipment created', updatedById: req.user.id });

    // Notify fleet managers
    const managers = await User.findAll({ where: { role: 'fleet_manager', isActive: true } });
    for (const m of managers) {
      await notificationService.createNotification({
        recipientId: m.id,
        type: 'shipment_created',
        title: 'New Shipment Request',
        message: `New shipment #${shipment.trackingNumber} from ${shipment.pickupCity} to ${shipment.destCity}`,
        shipmentId: shipment.id,
      });
    }

    const result = await getShipmentWithRelations(shipment.id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/shipments
exports.getShipments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search, startDate, endDate, priority } = req.query;
    const where = {};

    if (req.user.role === 'customer') where.customerId = req.user.id;
    if (req.user.role === 'driver') where.driverId = req.user.id;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where[Op.or] = [
        { trackingNumber: { [Op.like]: `%${search}%` } },
        { pickupCity: { [Op.like]: `%${search}%` } },
        { destCity: { [Op.like]: `%${search}%` } },
        { cargoDescription: { [Op.like]: `%${search}%` } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Shipment.findAndCountAll({
      where,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'phone', 'avatar', 'rating'], required: false },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'type', 'brand', 'model'], required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    res.status(200).json({
      success: true,
      count: rows.length,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/shipments/:id
exports.getShipment = async (req, res, next) => {
  try {
    const shipment = await getShipmentWithRelations(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    if (req.user.role === 'customer' && shipment.customerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    next(error);
  }
};

// GET /api/shipments/track/:trackingNumber  (public)
exports.trackShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({
      where: { trackingNumber: req.params.trackingNumber },
      include: [
        { model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'phone', 'avatar', 'rating', 'currentLat', 'currentLng'], required: false },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'type', 'brand', 'model'], required: false },
        { model: ShipmentStatusHistory, as: 'statusHistory', order: [['createdAt', 'ASC']] },
      ],
    });
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    next(error);
  }
};

// PUT /api/shipments/:id/assign
exports.assignShipment = async (req, res, next) => {
  try {
    const { driverId, vehicleId } = req.body;
    const shipment = await Shipment.findByPk(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    const driver = await User.findByPk(driverId);
    if (!driver || driver.role !== 'driver')
      return res.status(400).json({ success: false, message: 'Invalid driver' });

    await shipment.update({ driverId, vehicleId, assignedById: req.user.id, status: 'assigned' });
    await ShipmentStatusHistory.create({
      shipmentId: shipment.id,
      status: 'assigned',
      note: `Assigned to driver ${driver.firstName} ${driver.lastName}`,
      updatedById: req.user.id,
    });
    await Vehicle.update({ status: 'in_transit', assignedDriverId: driverId }, { where: { id: vehicleId } });

    await notificationService.createNotification({ recipientId: driverId, type: 'driver_assigned', title: 'New Delivery Assigned', message: `You have been assigned shipment #${shipment.trackingNumber}`, shipmentId: shipment.id });
    await notificationService.createNotification({ recipientId: shipment.customerId, type: 'shipment_assigned', title: 'Driver Assigned', message: `A driver has been assigned to your shipment #${shipment.trackingNumber}`, shipmentId: shipment.id });

    const result = await getShipmentWithRelations(shipment.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// PUT /api/shipments/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note, locationLat, locationLng } = req.body;
    const shipment = await Shipment.findByPk(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    if (req.user.role === 'driver' && shipment.driverId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await shipment.update({ status, ...(status === 'delivered' ? { actualArrival: new Date() } : {}) });
    await ShipmentStatusHistory.create({ shipmentId: shipment.id, status, note, locationLat, locationLng, updatedById: req.user.id });

    if (status === 'delivered') {
      await Vehicle.update({ status: 'available' }, { where: { id: shipment.vehicleId } });
      await User.increment('totalDeliveries', { where: { id: shipment.driverId } });
    }

    const statusMessages = {
      picked_up: 'Your cargo has been picked up',
      in_transit: 'Your shipment is on the way',
      out_for_delivery: 'Your shipment is out for delivery',
      delivered: 'Your shipment has been delivered',
      failed: 'Delivery attempt failed',
    };
    if (statusMessages[status]) {
      await notificationService.createNotification({ recipientId: shipment.customerId, type: `shipment_${status}`, title: 'Shipment Update', message: `${statusMessages[status]} - #${shipment.trackingNumber}`, shipmentId: shipment.id });
    }

    if (req.io) req.io.to(`shipment_${shipment.id}`).emit('statusUpdate', { shipmentId: shipment.id, status, note });

    res.status(200).json({ success: true, data: await getShipmentWithRelations(shipment.id) });
  } catch (error) {
    next(error);
  }
};

// POST /api/shipments/:id/proof
exports.uploadProofOfDelivery = async (req, res, next) => {
  try {
    const { deliveredTo, notes } = req.body;
    const shipment = await Shipment.findByPk(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    await shipment.update({
      podPhoto: req.file?.path || '',
      podDeliveredTo: deliveredTo,
      podNotes: notes,
      podTimestamp: new Date(),
      status: 'delivered',
      actualArrival: new Date(),
    });
    await ShipmentStatusHistory.create({ shipmentId: shipment.id, status: 'delivered', note: 'Proof of delivery uploaded', updatedById: req.user.id });

    res.status(200).json({ success: true, data: await getShipmentWithRelations(shipment.id) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/shipments/:id/cancel
exports.cancelShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    if (['delivered', 'cancelled'].includes(shipment.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel this shipment' });
    if (req.user.role === 'customer' && shipment.customerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await shipment.update({ status: 'cancelled' });
    await ShipmentStatusHistory.create({ shipmentId: shipment.id, status: 'cancelled', note: req.body.reason || 'Cancelled by user', updatedById: req.user.id });
    if (shipment.vehicleId) await Vehicle.update({ status: 'available' }, { where: { id: shipment.vehicleId } });

    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    next(error);
  }
};

// POST /api/shipments/:id/rate
exports.rateShipment = async (req, res, next) => {
  try {
    const { score, comment } = req.body;
    const shipment = await Shipment.findByPk(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    if (shipment.status !== 'delivered')
      return res.status(400).json({ success: false, message: 'Can only rate delivered shipments' });

    await shipment.update({ ratingScore: score, ratingComment: comment, ratedAt: new Date() });

    if (shipment.driverId) {
      const deliveries = await Shipment.findAll({ where: { driverId: shipment.driverId, ratingScore: { [Op.not]: null } } });
      const avg = deliveries.reduce((s, d) => s + d.ratingScore, 0) / deliveries.length;
      await User.update({ rating: avg.toFixed(2) }, { where: { id: shipment.driverId } });
    }

    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    next(error);
  }
};

// GET /api/shipments/estimate  — price estimate before creating
exports.estimatePrice = (req, res) => {
  const { pickupLat, pickupLng, destLat, destLng, weight } = req.query;
  const pricing = calculatePrice(pickupLat, pickupLng, destLat, destLng, weight);
  res.json({
    success: true,
    data: {
      distanceKm: pricing.distanceKm,
      distancePrice: pricing.distancePrice,
      weightSurcharge: pricing.weightPrice,
      totalPrice: pricing.totalPrice,
      currency: 'ETB',
      ratePerKm: PRICE_PER_KM,
      minimumFare: MIN_PRICE,
    },
  });
};

// Helper
async function getShipmentWithRelations(id) {
  return Shipment.findByPk(id, {
    include: [
      { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'] },
      { model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'phone', 'avatar', 'rating', 'currentLat', 'currentLng'], required: false },
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'type', 'brand', 'model'], required: false },
      { model: User, as: 'assignedBy', attributes: ['id', 'firstName', 'lastName'], required: false },
      { model: ShipmentStatusHistory, as: 'statusHistory', order: [['createdAt', 'ASC']] },
    ],
  });
}
