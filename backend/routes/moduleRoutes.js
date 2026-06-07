const express = require('express');
const router = express.Router();
const { getModules, createModule, getEnrolledModules, saveVideo } = require('../controllers/moduleController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(getModules)
  .post(protect, restrictTo('Admin'), createModule);

router.route('/enrolled')
  .get(protect, getEnrolledModules);

router.route('/:id/videos')
  .post(protect, restrictTo('Admin'), saveVideo);

router.route('/:id/limit')
  .put(protect, restrictTo('Admin'), require('../controllers/moduleController').updateModuleLimit);

module.exports = router;
