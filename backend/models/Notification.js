const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Notification extends Model {}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    recipientId: { type: DataTypes.INTEGER, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: true },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    data: { type: DataTypes.JSON, allowNull: true },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    readAt: { type: DataTypes.DATE, allowNull: true },
    channelInApp: { type: DataTypes.BOOLEAN, defaultValue: true },
    channelEmail: { type: DataTypes.BOOLEAN, defaultValue: false },
    channelSms: { type: DataTypes.BOOLEAN, defaultValue: false },
    channelPush: { type: DataTypes.BOOLEAN, defaultValue: false },
    shipmentId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, modelName: 'Notification', tableName: 'notifications' }
);

module.exports = Notification;
