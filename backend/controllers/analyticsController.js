const { sequelize } = require('../config/db');
const { Shipment, User, Vehicle } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalShipments, monthlyShipments, lastMonthShipments,
      deliveredShipments, pendingShipments, inTransitShipments,
      totalCustomers, totalDrivers, totalVehicles, availableVehicles,
    ] = await Promise.all([
      Shipment.count(),
      Shipment.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      Shipment.count({ where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }),
      Shipment.count({ where: { status: 'delivered' } }),
      Shipment.count({ where: { status: 'pending' } }),
      Shipment.count({ where: { status: 'in_transit' } }),
      User.count({ where: { role: 'customer', isActive: true } }),
      User.count({ where: { role: 'driver', isActive: true } }),
      Vehicle.count({ where: { isActive: true } }),
      Vehicle.count({ where: { status: 'available', isActive: true } }),
    ]);

    const revenueResult = await Shipment.findOne({
      where: { isPaid: true },
      attributes: [
        [fn('SUM', col('totalPrice')), 'total'],
        [fn('SUM', literal(`CASE WHEN createdAt >= ${sequelize.escape(startOfMonth)} THEN totalPrice ELSE 0 END`)), 'monthly'],
      ],
      raw: true,
    });

    const growth = lastMonthShipments > 0
      ? Number((((monthlyShipments - lastMonthShipments) / lastMonthShipments) * 100).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        shipments: { total: totalShipments, monthly: monthlyShipments, delivered: deliveredShipments, pending: pendingShipments, inTransit: inTransitShipments, growth },
        users: { customers: totalCustomers, drivers: totalDrivers },
        vehicles: { total: totalVehicles, available: availableVehicles },
        revenue: { total: Number(revenueResult?.total || 0), monthly: Number(revenueResult?.monthly || 0) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/shipment-trends
exports.getShipmentTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Shipment.findAll({
      where: { createdAt: { [Op.gte]: startDate } },
      attributes: [
        [fn('DATE', col('createdAt')), '_id'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', literal(`CASE WHEN status = 'delivered' THEN 1 ELSE 0 END`)), 'delivered'],
        [fn('SUM', col('totalPrice')), 'revenue'],
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });

    const formatted = trends.map((t) => ({
      _id: t._id,
      count: Number(t.count || 0),
      delivered: Number(t.delivered || 0),
      revenue: Number(t.revenue || 0),
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/status-distribution
exports.getStatusDistribution = async (req, res, next) => {
  try {
    const distribution = await Shipment.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      order: [[literal('count'), 'DESC']],
      raw: true,
    });
    const formatted = distribution.map((d) => ({ _id: d.status, count: Number(d.count || 0) }));
    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/top-routes
exports.getTopRoutes = async (req, res, next) => {
  try {
    const routes = await Shipment.findAll({
      attributes: [
        'pickupCity',
        'destCity',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('totalPrice')), 'revenue'],
      ],
      group: ['pickupCity', 'destCity'],
      order: [[literal('count'), 'DESC']],
      limit: 10,
      raw: true,
    });
    const formatted = routes.map((r) => ({
      _id: { from: r.pickupCity, to: r.destCity },
      count: Number(r.count || 0),
      revenue: Number(r.revenue || 0),
    }));
    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/revenue
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const revenue = await Shipment.findAll({
      where: { createdAt: { [Op.gte]: startDate }, isPaid: true },
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), '_id'],
        [fn('SUM', col('totalPrice')), 'total'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [fn('DATE_FORMAT', col('createdAt'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'ASC']],
      raw: true,
    });

    const formatted = revenue.map((r) => ({
      _id: r._id,
      total: Number(r.total || 0),
      count: Number(r.count || 0),
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/public-stats  — Public stats dynamically queried from DB
exports.getPublicStats = async (req, res, next) => {
  try {
    const [
      deliveredCount,
      activeDriversCount,
      activeVehiclesCount,
      activeShipmentsCount,
      totalShipmentsCount,
      onlineDriversCount,
    ] = await Promise.all([
      Shipment.count({ where: { status: 'delivered' } }),
      User.count({ where: { role: 'driver', isActive: true } }),
      Vehicle.count({ where: { isActive: true } }),
      Shipment.count({ where: { status: { [Op.in]: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] } } }),
      Shipment.count(),
      User.count({ where: { role: 'driver', isActive: true, isOnline: true } }),
    ]);

    const onTimeRate = totalShipmentsCount > 0
      ? ((deliveredCount / totalShipmentsCount) * 100).toFixed(1)
      : '100.0';

    res.status(200).json({
      success: true,
      data: {
        deliveriesCompleted: deliveredCount,
        activeDrivers: activeDriversCount,
        fleetVehicles: activeVehiclesCount,
        activeShipments: activeShipmentsCount,
        onlineDrivers: onlineDriversCount,
        onTimeRate: `${onTimeRate}%`,
      },
    });
  } catch (error) {
    next(error);
  }
};
