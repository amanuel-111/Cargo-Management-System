const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  updateLocation, getDriverLocationHistory, getShipmentRoute, getActiveDrivers,
  startTracking, stopTracking, getShipmentLiveLocation, getShipmentLocationHistory, getPublicTracking
} = require('../controllers/trackingController');

// ── Explicit Protected Routes (before parameter routes) ──
router.get('/active-drivers', protect, authorize('fleet_manager', 'admin'), getActiveDrivers);

// ── Public Routes ──
router.get('/:trackingNumber', getPublicTracking);

// ── Protected Routes ──
router.use(protect);

router.post('/location', authorize('driver'), updateLocation);
router.get('/driver/:driverId', getDriverLocationHistory);
router.get('/shipment/:shipmentId/route', getShipmentRoute);

// Traccar GPS Tracking Routes
router.post('/shipment/:shipmentId/start', authorize('admin', 'fleet_manager'), startTracking);
router.post('/shipment/:shipmentId/stop', authorize('admin', 'fleet_manager'), stopTracking);
router.get('/shipment/:shipmentId/live', getShipmentLiveLocation);
router.get('/shipment/:shipmentId/history', getShipmentLocationHistory);

module.exports = router;
