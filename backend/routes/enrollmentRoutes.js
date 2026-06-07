const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createEnrollment, getPendingEnrollments, updateEnrollmentStatus } = require('../controllers/enrollmentController');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/receipts/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Student creates enrollment request
router.post('/', protect, upload.single('receipt'), createEnrollment);
// Admin gets all pending requests
router.get('/pending', protect, restrictTo('Admin'), getPendingEnrollments);

// Admin updates enrollment status (approve/reject)
router.put('/:id/status', protect, restrictTo('Admin'), updateEnrollmentStatus);

module.exports = router;
