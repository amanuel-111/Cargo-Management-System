const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  updateLocation, getDriverLocationHistory, getShipmentRoute, getActiveDrivers,
} = require('../controllers/trackingController');

router.use(protect);

router.post('/location', authorize('driver'), updateLocation);
router.get('/active-drivers', authorize('fleet_manager', 'admin'), getActiveDrivers);
router.get('/driver/:driverId', getDriverLocationHistory);
router.get('/shipment/:shipmentId/route', getShipmentRoute);

module.exports = router;
