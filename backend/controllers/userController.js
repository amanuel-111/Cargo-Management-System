const { Op } = require('sequelize');
const { User, Vehicle, Shipment } = require('../models');

// GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, isActive, search, page = 1, limit = 10 } = req.query;
    const where = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
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

// GET /api/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'addressStreet', 'addressCity', 'addressRegion', 'fcmToken'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (req.file) updates.avatar = req.file.path;

    await User.update(updates, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id  (admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...updates } = req.body;
    await User.update(updates, { where: { id: req.params.id } });
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id  (soft-delete)
exports.deleteUser = async (req, res, next) => {
  try {
    await User.update({ isActive: false }, { where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/drivers
exports.getDrivers = async (req, res, next) => {
  try {
    const where = { role: 'driver', isActive: true };

    let drivers = await User.findAll({ where, order: [['createdAt', 'DESC']] });

    // If available=true, filter out drivers who are on an active delivery
    if (req.query.available === 'true') {
      const busyDriverIds = (await Shipment.findAll({
        where: { status: { [Op.in]: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'] } },
        attributes: ['driverId'],
        raw: true,
      })).map((s) => s.driverId).filter(Boolean);

      drivers = drivers.filter((d) => !busyDriverIds.includes(d.id));
    }

    res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/drivers/:id/stats
exports.getDriverStats = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [total, delivered, inTransit, failed] = await Promise.all([
      Shipment.count({ where: { driverId: id } }),
      Shipment.count({ where: { driverId: id, status: 'delivered' } }),
      Shipment.count({ where: { driverId: id, status: 'in_transit' } }),
      Shipment.count({ where: { driverId: id, status: 'failed' } }),
    ]);
    res.status(200).json({
      success: true,
      data: { total, delivered, inTransit, failed, successRate: total ? ((delivered / total) * 100).toFixed(1) : 0 },
    });
  } catch (error) {
    next(error);
  }
};
