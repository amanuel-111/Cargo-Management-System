const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  createShipment, getShipments, getShipment, trackShipment,
  assignShipment, updateStatus, uploadProofOfDelivery, cancelShipment, rateShipment,
  estimatePrice,
} = require('../controllers/shipmentController');

// Public routes
router.get('/track/:trackingNumber', trackShipment);
router.get('/estimate', estimatePrice);

router.use(protect);

router.post('/', authorize('customer', 'admin', 'fleet_manager'), createShipment);
router.get('/', getShipments);
router.get('/:id', getShipment);
router.put('/:id/assign', authorize('fleet_manager', 'admin'), assignShipment);
router.put('/:id/status', authorize('driver', 'fleet_manager', 'admin'), updateStatus);
router.post('/:id/proof', authorize('driver'), upload.single('photo'), uploadProofOfDelivery);
router.put('/:id/cancel', cancelShipment);
router.post('/:id/rate', authorize('customer'), rateShipment);

module.exports = router;
