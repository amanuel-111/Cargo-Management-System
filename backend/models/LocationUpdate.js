const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class LocationUpdate extends Model {}

LocationUpdate.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    driverId: { type: DataTypes.INTEGER, allowNull: false },
    shipmentId: { type: DataTypes.INTEGER, allowNull: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: true },
    lat: { type: DataTypes.DECIMAL(10, 8), allowNull: false },
    lng: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
    address: { type: DataTypes.STRING(255), allowNull: true },
    speed: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    heading: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    accuracy: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    traccarPositionId: { type: DataTypes.INTEGER, allowNull: true },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: 'LocationUpdate', tableName: 'location_updates' }
);

module.exports = LocationUpdate;
