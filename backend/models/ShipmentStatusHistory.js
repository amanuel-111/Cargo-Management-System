const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ShipmentStatusHistory extends Model {}

ShipmentStatusHistory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    shipmentId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false },
    note: { type: DataTypes.TEXT, allowNull: true },
    updatedById: { type: DataTypes.INTEGER, allowNull: true },
    locationLat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    locationLng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    locationAddress: { type: DataTypes.STRING(255), allowNull: true },
  },
  { sequelize, modelName: 'ShipmentStatusHistory', tableName: 'shipment_status_history' }
);

module.exports = ShipmentStatusHistory;
