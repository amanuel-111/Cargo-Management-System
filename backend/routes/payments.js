const express = require('express');
const router  = express.Router();
const { body, param, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../config/cloudinary');
const {
  submitPayment, getPayments, getPayment, approvePayment, rejectPayment, getPaymentStats,
} = require('../controllers/paymentController');

router.use(protect);

router.get('/stats', authorize('fleet_manager', 'admin'), getPaymentStats);

// Customer submits payment proof
router.post(
  '/',
  upload.single('screenshot'),
  [
    body('shipmentId').isInt({ min: 1 }).withMessage('Valid shipment ID required'),
    body('method').isIn(['cbe', 'telebirr', 'chapa']).withMessage('Invalid payment method'),
    body('transactionId').optional().trim().isLength({ max: 100 }).withMessage('Transaction ID too long'),
    body('note').optional().trim().isLength({ max: 500 }).withMessage('Note too long'),
  ],
  validate,
  authorize('customer'),
  submitPayment
);

router.get(
  '/',
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  authorize('customer', 'fleet_manager', 'admin'),
  getPayments
);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid payment ID')],
  validate,
  authorize('customer', 'fleet_manager', 'admin'),
  getPayment
);

router.put(
  '/:id/approve',
  [param('id').isInt({ min: 1 }).withMessage('Invalid payment ID')],
  validate,
  authorize('fleet_manager', 'admin'),
  approvePayment
);

router.put(
  '/:id/reject',
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid payment ID'),
    body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long'),
  ],
  validate,
  authorize('fleet_manager', 'admin'),
  rejectPayment
);

module.exports = router;
