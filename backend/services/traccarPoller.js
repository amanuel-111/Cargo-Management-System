const { Shipment, Vehicle, LocationUpdate } = require('../models');
const traccarService = require('./traccarService');
const { Op } = require('sequelize');

class TraccarPoller {
  constructor() {
    this.intervalId = null;
    this.pollIntervalMs = parseInt(process.env.TRACKING_POLL_INTERVAL_MS) || 15000;
  }

  start(io) {
    if (this.intervalId) return;
    console.log(`🚀 Starting Traccar polling service every ${this.pollIntervalMs}ms`);
    
    this.intervalId = setInterval(() => this.poll(io), this.pollIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Stopped Traccar polling service');
    }
  }

  async poll(io) {
    try {
      // Find all active tracked shipments
      const activeShipments = await Shipment.findAll({
        where: {
          trackingEnabled: true,
          trackingStatus: 'active',
          vehicleId: { [Op.not]: null }
        },
        include: [{
          model: Vehicle,
          as: 'vehicle',
          where: { traccarDeviceId: { [Op.not]: null } }
        }]
      });

      if (activeShipments.length === 0) return; // Nothing to poll

      for (const shipment of activeShipments) {
        try {
          const deviceId = shipment.vehicle.traccarDeviceId;
          const position = await traccarService.getLatestPosition(deviceId);

          if (position) {
            // Check if we already have this exact position ID to avoid duplicates
            const existing = await LocationUpdate.findOne({
              where: { traccarPositionId: position.traccarPositionId }
            });

            if (!existing) {
              // Save to database
              await LocationUpdate.create({
                shipmentId: shipment.id,
                vehicleId: shipment.vehicle.id,
                driverId: shipment.driverId || 0, // Fallback if no driver explicitly linked
                traccarPositionId: position.traccarPositionId,
                lat: position.latitude,
                lng: position.longitude,
                speed: position.speed,
                heading: position.heading,
                accuracy: position.accuracy,
                timestamp: position.recordedAt
              });

              // Update vehicle current position
              await Vehicle.update(
                { currentLat: position.latitude, currentLng: position.longitude },
                { where: { id: shipment.vehicle.id } }
              );

              // Broadcast over socket
              if (io) {
                io.to(`shipment_${shipment.id}`).emit('shipmentLocationUpdated', {
                  shipmentId: shipment.id,
                  latitude: position.latitude,
                  longitude: position.longitude,
                  speed: position.speed,
                  heading: position.heading,
                  recordedAt: position.recordedAt
                });

                // Also notify fleet managers
                io.to('role_fleet_manager').emit('driverLocationUpdate', {
                  shipmentId: shipment.id,
                  lat: position.latitude,
                  lng: position.longitude,
                  speed: position.speed,
                  heading: position.heading,
                  timestamp: position.recordedAt
                });
              }
            }
          }
        } catch (err) {
          console.error(`Error polling for shipment ${shipment.id}:`, err.message);
        }
      }
    } catch (error) {
      console.error('Error in Traccar polling cycle:', error.message);
    }
  }
}

module.exports = new TraccarPoller();
