const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/dashboard')
  .get(protect, restrictTo('Admin', 'Teacher'), getDashboardMetrics);

module.exports = router;
