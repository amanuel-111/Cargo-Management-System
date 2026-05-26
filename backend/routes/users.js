const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getUsers, getUser, updateProfile, updateUser, deleteUser, getDrivers, getDriverStats,
} = require('../controllers/userController');

router.use(protect);

router.get('/drivers', authorize('fleet_manager', 'admin'), getDrivers);
router.get('/drivers/:id/stats', authorize('fleet_manager', 'admin'), getDriverStats);
router.put('/profile', upload.single('avatar'), updateProfile);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin', 'fleet_manager'), getUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
