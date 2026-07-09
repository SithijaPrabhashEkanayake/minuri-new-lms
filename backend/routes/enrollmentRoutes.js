const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createEnrollment, getPendingEnrollments, updateEnrollmentStatus } = require('../controllers/enrollmentController');

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Allowed MIME types for receipt uploads
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/receipts/'));
  },
  filename: function (req, file, cb) {
    // Generate a safe, random filename to prevent path traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = crypto.randomUUID() + ext;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// Student creates enrollment request
router.post('/', protect, upload.single('receipt'), createEnrollment);
// Admin gets all pending requests
router.get('/pending', protect, restrictTo('Admin'), getPendingEnrollments);

// Admin updates enrollment status (approve/reject)
router.put('/:id/status', protect, restrictTo('Admin'), updateEnrollmentStatus);

module.exports = router;
