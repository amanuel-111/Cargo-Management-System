const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Shipment extends Model {}

Shipment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    trackingNumber: { type: DataTypes.STRING(50), unique: true },

    customerId: { type: DataTypes.INTEGER, allowNull: false },
    driverId: { type: DataTypes.INTEGER, allowNull: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: true },
    assignedById: { type: DataTypes.INTEGER, allowNull: true },

    // Pickup
    pickupAddress: { type: DataTypes.STRING(255), allowNull: false },
    pickupCity: { type: DataTypes.STRING(100), allowNull: false },
    pickupRegion: { type: DataTypes.STRING(100), allowNull: true },
    pickupKebele: { type: DataTypes.STRING(50), allowNull: true },
    pickupHomeNumber: { type: DataTypes.STRING(50), allowNull: true },
    pickupMapLink: { type: DataTypes.STRING(500), allowNull: true },
    pickupLat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    pickupLng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    pickupContactName: { type: DataTypes.STRING(100), allowNull: true },
    pickupContactPhone: { type: DataTypes.STRING(30), allowNull: true },
    pickupScheduledTime: { type: DataTypes.DATE, allowNull: true },
    pickupActualTime: { type: DataTypes.DATE, allowNull: true },

    // Destination
    destAddress: { type: DataTypes.STRING(255), allowNull: false },
    destCity: { type: DataTypes.STRING(100), allowNull: false },
    destRegion: { type: DataTypes.STRING(100), allowNull: true },
    destKebele: { type: DataTypes.STRING(50), allowNull: true },
    destHomeNumber: { type: DataTypes.STRING(50), allowNull: true },
    destMapLink: { type: DataTypes.STRING(500), allowNull: true },
    destLat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    destLng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    destContactName: { type: DataTypes.STRING(100), allowNull: true },
    destContactPhone: { type: DataTypes.STRING(30), allowNull: true },
    destScheduledTime: { type: DataTypes.DATE, allowNull: true },
    destActualTime: { type: DataTypes.DATE, allowNull: true },

    // Cargo
    cargoDescription: { type: DataTypes.TEXT, allowNull: false },
    cargoCategory: {
      type: DataTypes.ENUM('general', 'fragile', 'perishable', 'hazardous', 'electronics', 'furniture', 'livestock'),
      defaultValue: 'general',
    },
    cargoWeight: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    cargoVolume: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    cargoQuantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    specialInstructions: { type: DataTypes.TEXT, allowNull: true },

    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled'),
      defaultValue: 'pending',
    },

    // GPS Tracking
    trackingEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    trackingStatus: {
      type: DataTypes.ENUM('inactive', 'active', 'completed'),
      defaultValue: 'inactive',
    },
    trackingStartedAt: { type: DataTypes.DATE, allowNull: true },
    trackingEndedAt: { type: DataTypes.DATE, allowNull: true },

    // Pricing
    basePrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    distancePrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    weightPrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    totalPrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    currency: { type: DataTypes.STRING(10), defaultValue: 'ETB' },
    isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
    paymentMethod: { type: DataTypes.STRING(50), allowNull: true },
    paymentDate: { type: DataTypes.DATE, allowNull: true },

    estimatedDistance: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    estimatedDuration: { type: DataTypes.INTEGER, allowNull: true },
    estimatedArrival: { type: DataTypes.DATE, allowNull: true },
    actualArrival: { type: DataTypes.DATE, allowNull: true },

    // Proof of delivery
    podSignature: { type: DataTypes.STRING(500), allowNull: true },
    podPhoto: { type: DataTypes.STRING(500), allowNull: true },
    podNotes: { type: DataTypes.TEXT, allowNull: true },
    podDeliveredTo: { type: DataTypes.STRING(100), allowNull: true },
    podTimestamp: { type: DataTypes.DATE, allowNull: true },

    // Rating
    ratingScore: { type: DataTypes.TINYINT, allowNull: true },
    ratingComment: { type: DataTypes.TEXT, allowNull: true },
    ratedAt: { type: DataTypes.DATE, allowNull: true },

    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal',
    },
    isInsured: { type: DataTypes.BOOLEAN, defaultValue: false },
    insuranceValue: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  },
  {
    sequelize,
    modelName: 'Shipment',
    tableName: 'shipments',
    hooks: {
      beforeCreate: (shipment) => {
        if (!shipment.trackingNumber) {
          const ts = Date.now().toString(36).toUpperCase();
          const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
          shipment.trackingNumber = `STC-${ts}-${rand}`;
        }
      },
    },
  }
);

module.exports = Shipment;
