const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createVehicle, getVehicles, getVehicle, updateVehicle, deleteVehicle, assignDriver, getLiveLocations,
} = require('../controllers/vehicleController');

router.use(protect);

router.get('/live-locations', getLiveLocations);
router.post('/', authorize('admin', 'fleet_manager'), createVehicle);
router.get('/', getVehicles);
router.get('/:id', getVehicle);
router.put('/:id', authorize('admin', 'fleet_manager'), updateVehicle);
router.delete('/:id', authorize('admin'), deleteVehicle);
router.put('/:id/assign-driver', authorize('admin', 'fleet_manager'), assignDriver);

module.exports = router;
