const express = require('express');
const router = express.Router();
const { getAiSources, addAiSource } = require('../controllers/aiSourceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, restrictTo('Admin'), getAiSources)
  .post(protect, restrictTo('Admin'), addAiSource);

module.exports = router;
