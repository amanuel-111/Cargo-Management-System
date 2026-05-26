const { Notification } = require('../models');

exports.createNotification = async ({ recipientId, senderId, type, title, message, data, shipmentId }) => {
  try {
    return await Notification.create({ recipientId, senderId, type, title, message, data, shipmentId });
  } catch (error) {
    console.error('Notification creation failed:', error.message);
  }
};

exports.sendBulkNotifications = async (recipientIds, notificationData) => {
  const records = recipientIds.map((recipientId) => ({ recipientId, ...notificationData }));
  return Notification.bulkCreate(records);
};
