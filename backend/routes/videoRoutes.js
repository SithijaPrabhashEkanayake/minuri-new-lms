const express = require('express');
const router = express.Router();
const { getVdoCipherOtp, getUploadCredentials } = require('../controllers/videoController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// In a real app, this route should be protected by an authentication middleware
// to ensure only enrolled students can request an OTP for a video.
router.post('/otp', protect, getVdoCipherOtp);

// Route for admins to get S3 upload credentials from VdoCipher
router.post('/upload-credentials', protect, restrictTo('Admin'), getUploadCredentials);

module.exports = router;
