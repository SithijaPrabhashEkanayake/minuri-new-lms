const express = require('express');
const router = express.Router();
const { getMyProgress } = require('../controllers/progressController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/my-progress')
  .get(protect, restrictTo('Student'), getMyProgress);

module.exports = router;
