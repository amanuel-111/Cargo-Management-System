const express = require('express');
const router  = express.Router();
const { body, param, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createVehicle, getVehicles, getVehicle, updateVehicle, deleteVehicle, assignDriver, getLiveLocations, updateTrackingDevice, checkAssignment,
} = require('../controllers/vehicleController');

router.use(protect);

router.get('/live-locations', getLiveLocations);

router.post('/',
  [
    body('plateNumber').trim().notEmpty().withMessage('Plate number is required')
      .isLength({ max: 30 }).withMessage('Plate number too long')
      .matches(/^[A-Z0-9\s\-]+$/i).withMessage('Invalid plate number format'),
    body('type').isIn(['truck','van','pickup','motorcycle','trailer','container'])
      .withMessage('Invalid vehicle type'),
    body('brand').trim().notEmpty().withMessage('Brand is required').isLength({ max: 100 }),
    body('model').trim().notEmpty().withMessage('Model is required').isLength({ max: 100 }),
    body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 })
      .withMessage('Invalid year'),
    body('capacity').isFloat({ min: 0.1, max: 100000 }).withMessage('Invalid capacity'),
    body('volumeCapacity').optional().isFloat({ min: 0 }),
    body('fuelType').optional().isIn(['diesel','petrol','electric','hybrid']),
  ],
  validate,
  authorize('admin', 'fleet_manager'),
  createVehicle
);

router.get('/',
  [
    query('status').optional().isIn(['available','in_transit','maintenance','inactive']),
    query('type').optional().isIn(['truck','van','pickup','motorcycle','trailer','container']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getVehicles
);

router.get('/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid vehicle ID')],
  validate,
  getVehicle
);

router.get('/:id/assignment-check',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid vehicle ID'),
    query('shipmentId').isInt({ min: 1 }).withMessage('Valid shipment ID required'),
  ],
  validate,
  authorize('admin', 'fleet_manager'),
  checkAssignment
);

router.put('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid vehicle ID'),
    body('plateNumber').optional().trim().isLength({ max: 30 })
      .matches(/^[A-Z0-9\s\-]+$/i).withMessage('Invalid plate number format'),
    body('type').optional().isIn(['truck','van','pickup','motorcycle','trailer','container']),
    body('brand').optional().trim().isLength({ max: 100 }),
    body('model').optional().trim().isLength({ max: 100 }),
    body('year').optional().isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
    body('capacity').optional().isFloat({ min: 0.1 }),
    body('status').optional().isIn(['available','in_transit','maintenance','inactive']),
    body('fuelType').optional().isIn(['diesel','petrol','electric','hybrid']),
  ],
  validate,
  authorize('admin', 'fleet_manager'),
  updateVehicle
);

router.delete('/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid vehicle ID')],
  validate,
  authorize('admin'),
  deleteVehicle
);

router.put('/:id/assign-driver',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid vehicle ID'),
    body('driverId').isInt({ min: 1 }).withMessage('Valid driver ID required'),
  ],
  validate,
  authorize('admin', 'fleet_manager'),
  assignDriver
);

router.patch('/:id/tracking-device',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid vehicle ID'),
    body('traccarDeviceId').notEmpty().withMessage('Traccar device ID is required'),
  ],
  validate,
  authorize('admin', 'fleet_manager'),
  updateTrackingDevice
);

module.exports = router;
