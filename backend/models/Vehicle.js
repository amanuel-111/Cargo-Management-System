const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Vehicle extends Model {}

Vehicle.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    plateNumber: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    type: {
      type: DataTypes.ENUM('truck', 'van', 'pickup', 'motorcycle', 'trailer', 'container'),
      allowNull: false,
    },
    brand: { type: DataTypes.STRING(100), allowNull: false },
    model: { type: DataTypes.STRING(100), allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    capacity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    volumeCapacity: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    fuelType: {
      type: DataTypes.ENUM('diesel', 'petrol', 'electric', 'hybrid'),
      defaultValue: 'diesel',
    },
    status: {
      type: DataTypes.ENUM('available', 'in_transit', 'maintenance', 'inactive'),
      defaultValue: 'available',
    },
    assignedDriverId: { type: DataTypes.INTEGER, allowNull: true },
    currentLat: { type: DataTypes.DECIMAL(10, 8), defaultValue: 0 },
    currentLng: { type: DataTypes.DECIMAL(11, 8), defaultValue: 0 },
    insuranceExpiry: { type: DataTypes.DATE, allowNull: true },
    registrationExpiry: { type: DataTypes.DATE, allowNull: true },
    lastMaintenanceDate: { type: DataTypes.DATE, allowNull: true },
    nextMaintenanceDate: { type: DataTypes.DATE, allowNull: true },
    mileage: { type: DataTypes.INTEGER, defaultValue: 0 },
    traccarDeviceId: { type: DataTypes.STRING(100), allowNull: true },
    trackingEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    companyId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Vehicle',
    tableName: 'vehicles',
  }
);

module.exports = Vehicle;
