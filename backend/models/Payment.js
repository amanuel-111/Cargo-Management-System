const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Payment extends Model {}

Payment.init(
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    shipmentId:   { type: DataTypes.INTEGER, allowNull: false },
    customerId:   { type: DataTypes.INTEGER, allowNull: false },
    amount:       { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    currency:     { type: DataTypes.STRING(10), defaultValue: 'ETB' },
    method:       { type: DataTypes.ENUM('cbe', 'telebirr', 'chapa'), allowNull: false },
    transactionId:{ type: DataTypes.STRING(100), allowNull: true },
    screenshotUrl:{ type: DataTypes.STRING(500), allowNull: true },
    note:         { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    reviewedById: { type: DataTypes.INTEGER, allowNull: true },
    reviewedAt:   { type: DataTypes.DATE, allowNull: true },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
  }
);

module.exports = Payment;
