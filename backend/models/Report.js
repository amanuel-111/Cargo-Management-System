const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Report extends Model {}

Report.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    type: {
      type: DataTypes.ENUM('delivery_performance', 'fleet_utilization', 'revenue', 'shipment_stats', 'driver_performance'),
      allowNull: false,
    },
    generatedById: { type: DataTypes.INTEGER, allowNull: false },
    periodStart: { type: DataTypes.DATE, allowNull: true },
    periodEnd: { type: DataTypes.DATE, allowNull: true },
    data: { type: DataTypes.JSON, allowNull: true },
    fileUrl: { type: DataTypes.STRING(500), allowNull: true },
    format: { type: DataTypes.ENUM('pdf', 'excel', 'csv'), defaultValue: 'pdf' },
  },
  { sequelize, modelName: 'Report', tableName: 'reports' }
);

module.exports = Report;
