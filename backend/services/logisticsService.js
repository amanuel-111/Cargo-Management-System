const { Op } = require('sequelize');
const Shipment = require('../models/Shipment');
const Vehicle = require('../models/Vehicle');

const ACTIVE_STATUSES = ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'];

class LogisticsService {
  /**
   * Calculate current load and check if new shipment fits.
   */
  static async getVehicleCapacityInfo(vehicleId, newShipmentWeight = 0, transaction = null) {
    const vehicle = await Vehicle.findByPk(vehicleId, { transaction });
    if (!vehicle) throw new Error('Vehicle not found');

    const activeShipments = await Shipment.findAll({
      where: {
        vehicleId,
        status: { [Op.in]: ACTIVE_STATUSES },
      },
      transaction,
    });

    const currentLoad = activeShipments.reduce((sum, s) => sum + (parseFloat(s.cargoWeight) || 0), 0);
    const capacity = parseFloat(vehicle.capacity) || 0;
    const afterAssignment = currentLoad + (parseFloat(newShipmentWeight) || 0);

    return {
      vehicleId: vehicle.id,
      capacity,
      currentLoad,
      availableCapacity: capacity - currentLoad,
      newShipmentWeight: parseFloat(newShipmentWeight) || 0,
      afterAssignment,
      remainingCapacity: capacity - afterAssignment,
      isCompatible: afterAssignment <= capacity,
      activeShipmentCount: activeShipments.length,
      utilizationPercentage: capacity > 0 ? Math.round((currentLoad / capacity) * 100) : 0,
    };
  }

  /**
   * Check if a new shipment's destination is generally compatible with the active route.
   */
  static async checkRouteCompatibility(vehicleId, newShipment, transaction = null) {
    const activeShipments = await Shipment.findAll({
      where: {
        vehicleId,
        status: { [Op.in]: ACTIVE_STATUSES },
      },
      transaction,
    });

    if (activeShipments.length === 0) {
      return {
        compatible: true,
        warning: false,
        reason: 'Vehicle has no existing active shipments.',
        existingDestinations: [],
        newDestination: newShipment.destCity,
      };
    }

    const existingDestinations = [...new Set(activeShipments.map((s) => s.destCity))];

    // Basic heuristic: if the new destination is not in the list of existing destinations, flag a warning.
    // In a real system, we'd use geographic distances.
    if (!existingDestinations.includes(newShipment.destCity)) {
      return {
        compatible: false,
        warning: true,
        reason: 'The new shipment destination differs from existing active destinations.',
        existingDestinations,
        newDestination: newShipment.destCity,
      };
    }

    return {
      compatible: true,
      warning: false,
      reason: 'Destinations follow a compatible general route.',
      existingDestinations,
      newDestination: newShipment.destCity,
    };
  }

  /**
   * Check if the schedule of the new shipment conflicts with existing shipments.
   */
  static async checkScheduleCompatibility(vehicleId, newShipment, transaction = null) {
    const activeShipments = await Shipment.findAll({
      where: {
        vehicleId,
        status: { [Op.in]: ACTIVE_STATUSES },
      },
      transaction,
    });

    if (activeShipments.length === 0) {
      return {
        compatible: true,
        warning: false,
        reason: 'Vehicle has no existing active shipments.',
      };
    }

    // Basic heuristic: check if there are any conflicting deadlines
    // Since we don't have travel times, we just report if we lack data.
    return {
      compatible: true,
      warning: false,
      reason: 'Schedule compatibility cannot be fully calculated with currently available data.',
    };
  }
}

module.exports = LogisticsService;
