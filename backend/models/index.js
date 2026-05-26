const { sequelize } = require('../config/db');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Shipment = require('./Shipment');
const ShipmentStatusHistory = require('./ShipmentStatusHistory');
const Notification = require('./Notification');
const LocationUpdate = require('./LocationUpdate');
const Report = require('./Report');

// ── Associations ──────────────────────────────────────────────

// User <-> Vehicle (driver assigned to vehicle)
User.belongsTo(Vehicle, { as: 'vehicleAssigned', foreignKey: 'vehicleAssignedId', constraints: false });
Vehicle.hasMany(User, { as: 'drivers', foreignKey: 'vehicleAssignedId', constraints: false });

// Vehicle assigned driver
Vehicle.belongsTo(User, { as: 'assignedDriver', foreignKey: 'assignedDriverId', constraints: false });

// Shipment relations
Shipment.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
Shipment.belongsTo(User, { as: 'driver', foreignKey: 'driverId', constraints: false });
Shipment.belongsTo(User, { as: 'assignedBy', foreignKey: 'assignedById', constraints: false });
Shipment.belongsTo(Vehicle, { as: 'vehicle', foreignKey: 'vehicleId', constraints: false });

User.hasMany(Shipment, { as: 'customerShipments', foreignKey: 'customerId' });
User.hasMany(Shipment, { as: 'driverShipments', foreignKey: 'driverId' });

// Status history
ShipmentStatusHistory.belongsTo(Shipment, { foreignKey: 'shipmentId' });
ShipmentStatusHistory.belongsTo(User, { as: 'updatedBy', foreignKey: 'updatedById', constraints: false });
Shipment.hasMany(ShipmentStatusHistory, { as: 'statusHistory', foreignKey: 'shipmentId' });

// Notifications
Notification.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });
Notification.belongsTo(User, { as: 'sender', foreignKey: 'senderId', constraints: false });
Notification.belongsTo(Shipment, { as: 'shipment', foreignKey: 'shipmentId', constraints: false });

// Location updates
LocationUpdate.belongsTo(User, { as: 'driver', foreignKey: 'driverId' });
LocationUpdate.belongsTo(Shipment, { foreignKey: 'shipmentId', constraints: false });
LocationUpdate.belongsTo(Vehicle, { foreignKey: 'vehicleId', constraints: false });

// Reports
Report.belongsTo(User, { as: 'generatedBy', foreignKey: 'generatedById' });

module.exports = { sequelize, User, Vehicle, Shipment, ShipmentStatusHistory, Notification, LocationUpdate, Report };
