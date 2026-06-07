const express = require('express');
const router = express.Router();
const { askQuestion } = require('../controllers/aiTutorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/ask')
  .post(protect, restrictTo('Student'), askQuestion);

module.exports = router;
