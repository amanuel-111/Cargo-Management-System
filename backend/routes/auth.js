const express = require('express');
const router  = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register, login, logout, getMe,
  verifyEmail, forgotPassword, resetPassword, updatePassword,
} = require('../controllers/authController');

router.post('/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required')
      .isLength({ max: 100 }).withMessage('First name too long')
      .matches(/^[a-zA-Z\u00C0-\u024F\s'-]+$/).withMessage('First name contains invalid characters'),
    body('lastName').trim().notEmpty().withMessage('Last name is required')
      .isLength({ max: 100 }).withMessage('Last name too long')
      .matches(/^[a-zA-Z\u00C0-\u024F\s'-]+$/).withMessage('Last name contains invalid characters'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required')
      .matches(/^\+?[0-9\s\-]{7,20}$/).withMessage('Invalid phone number format'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('role').optional().isIn(['customer', 'driver']).withMessage('Invalid role'),
  ],
  validate,
  register
);

router.post('/login',
  [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

router.get('/verify-email/:token',
  [param('token').trim().notEmpty().withMessage('Token is required')],
  validate,
  verifyEmail
);

router.post('/forgot-password',
  [body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required')],
  validate,
  forgotPassword
);

router.put('/reset-password/:token',
  [
    param('token').trim().notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  ],
  validate,
  resetPassword
);

router.put('/update-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Must contain at least one number'),
  ],
  validate,
  updatePassword
);

module.exports = router;
