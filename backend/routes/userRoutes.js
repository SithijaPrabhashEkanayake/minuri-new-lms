const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus, resetUserPassword } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, restrictTo('Admin'), getUsers);

router.route('/:id/status')
  .put(protect, restrictTo('Admin'), updateUserStatus);

router.route('/:id/reset-password')
  .post(protect, restrictTo('Admin'), resetUserPassword);

module.exports = router;
