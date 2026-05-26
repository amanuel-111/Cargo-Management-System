const { Notification, Shipment } = require('../models');

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const where = { recipientId: req.user.id };
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const offset = (page - 1) * limit;
    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    const unreadCount = await Notification.count({ where: { recipientId: req.user.id, isRead: false } });

    res.status(200).json({
      success: true,
      count: rows.length,
      total: count,
      unreadCount,
      pages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const [updated] = await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { id: req.params.id, recipientId: req.user.id } }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' });
    const notification = await Notification.findByPk(req.params.id);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update({ isRead: true, readAt: new Date() }, { where: { recipientId: req.user.id, isRead: false } });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.destroy({ where: { id: req.params.id, recipientId: req.user.id } });
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
