const express = require('express');
const router  = express.Router();
const { body, param, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../config/cloudinary');
const {
  createShipment, getShipments, getShipment, trackShipment,
  assignShipment, updateStatus, uploadProofOfDelivery, cancelShipment, rateShipment,
  estimatePrice, downloadInvoice,
} = require('../controllers/shipmentController');

// ── Public routes ─────────────────────────────────────────────
router.get('/track/:trackingNumber',
  [param('trackingNumber').trim().notEmpty().withMessage('Tracking number required')],
  validate,
  trackShipment
);

router.get('/estimate',
  [
    query('pickupLat').optional().isFloat({ min: -90,  max: 90  }),
    query('pickupLng').optional().isFloat({ min: -180, max: 180 }),
    query('destLat').optional().isFloat({ min: -90,  max: 90  }),
    query('destLng').optional().isFloat({ min: -180, max: 180 }),
    query('weight').optional().isFloat({ min: 0.1 }).withMessage('Weight must be positive'),
    query('priority').optional().isIn(['normal', 'urgent']),
  ],
  validate,
  estimatePrice
);

router.use(protect);

// ── Create shipment ───────────────────────────────────────────
router.post('/',
  [
    body('pickup.city').trim().notEmpty().withMessage('Pickup city is required'),
    body('pickup.address').trim().notEmpty().withMessage('Pickup address is required')
      .isLength({ max: 255 }).withMessage('Address too long'),
    body('pickup.lat').optional().isFloat({ min: -90,  max: 90  }).withMessage('Invalid latitude'),
    body('pickup.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('pickup.contactPhone').optional().trim()
      .matches(/^\+?[0-9\s\-]{7,20}$/).withMessage('Invalid phone number'),

    body('destination.city').trim().notEmpty().withMessage('Destination city is required'),
    body('destination.address').trim().notEmpty().withMessage('Destination address is required')
      .isLength({ max: 255 }).withMessage('Address too long'),
    body('destination.lat').optional().isFloat({ min: -90,  max: 90  }).withMessage('Invalid latitude'),
    body('destination.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('destination.contactPhone').optional().trim()
      .matches(/^\+?[0-9\s\-]{7,20}$/).withMessage('Invalid phone number'),

    body('cargo.description').trim().notEmpty().withMessage('Cargo description is required')
      .isLength({ max: 1000 }).withMessage('Description too long'),
    body('cargo.weight').isFloat({ min: 0.1, max: 50000 }).withMessage('Weight must be between 0.1 and 50,000 kg'),
    body('cargo.quantity').optional().isInt({ min: 1, max: 10000 }).withMessage('Quantity must be 1–10,000'),
    body('cargo.category').optional()
      .isIn(['general', 'fragile', 'perishable', 'hazardous', 'electronics', 'furniture', 'livestock'])
      .withMessage('Invalid cargo category'),
    body('cargo.specialInstructions').optional().trim().isLength({ max: 500 }),

    body('priority').optional().isIn(['normal', 'urgent']).withMessage('Priority must be normal or urgent'),
  ],
  validate,
  authorize('customer', 'admin', 'fleet_manager'),
  createShipment
);

// ── List shipments ────────────────────────────────────────────
router.get('/',
  [
    query('status').optional()
      .isIn(['pending','confirmed','assigned','picked_up','in_transit','out_for_delivery','delivered','failed','cancelled']),
    query('priority').optional().isIn(['normal', 'urgent']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  ],
  validate,
  getShipments
);

// ── Single shipment ───────────────────────────────────────────
router.get('/:id',
  [param('id').notEmpty().withMessage('Invalid shipment identifier')],
  validate,
  getShipment
);

// ── Download Invoice (PDF) ────────────────────────────────────
router.get('/:id/invoice',
  [param('id').isInt({ min: 1 }).withMessage('Invalid shipment ID')],
  validate,
  downloadInvoice
);

// ── Assign driver + vehicle ───────────────────────────────────
router.put('/:id/assign',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid shipment ID'),
    body('driverId').isInt({ min: 1 }).withMessage('Valid driver ID required'),
    body('vehicleId').isInt({ min: 1 }).withMessage('Valid vehicle ID required'),
  ],
  validate,
  authorize('fleet_manager', 'admin'),
  assignShipment
);

// ── Update status ─────────────────────────────────────────────
router.put('/:id/status',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid shipment ID'),
    body('status')
      .isIn(['confirmed','assigned','picked_up','in_transit','out_for_delivery','delivered','failed','cancelled'])
      .withMessage('Invalid status'),
    body('note').optional().trim().isLength({ max: 500 }),
    body('locationLat').optional().isFloat({ min: -90,  max: 90  }),
    body('locationLng').optional().isFloat({ min: -180, max: 180 }),
  ],
  validate,
  authorize('driver', 'fleet_manager', 'admin'),
  updateStatus
);

// ── Proof of delivery ─────────────────────────────────────────
router.post('/:id/proof',
  authorize('driver'),
  upload.single('photo'),
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid shipment ID'),
    body('deliveredTo').optional().trim().isLength({ max: 100 }),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  uploadProofOfDelivery
);

// ── Cancel ────────────────────────────────────────────────────
router.put('/:id/cancel',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid shipment ID'),
    body('reason').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  cancelShipment
);

// ── Rate ──────────────────────────────────────────────────────
router.post('/:id/rate',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid shipment ID'),
    body('score').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('comment').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  authorize('customer'),
  rateShipment
);

module.exports = router;
