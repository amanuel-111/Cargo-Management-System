const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats, getShipmentTrends, getStatusDistribution, getTopRoutes, getRevenueAnalytics, getPublicStats,
} = require('../controllers/analyticsController');

// Public route for landing page stats
router.get('/public-stats', getPublicStats);

router.use(protect, authorize('admin', 'fleet_manager'));

router.get('/dashboard', getDashboardStats);
router.get('/shipment-trends', getShipmentTrends);
router.get('/status-distribution', getStatusDistribution);
router.get('/top-routes', getTopRoutes);
router.get('/revenue', getRevenueAnalytics);

module.exports = router;
