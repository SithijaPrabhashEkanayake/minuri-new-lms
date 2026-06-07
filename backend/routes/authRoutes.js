const express = require('express');
const router = express.Router();
const { completeProfile, registerStaff, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Called immediately after Supabase auth.signUp succeeds on the frontend (Students)
router.post('/complete-profile', completeProfile);

// Register a new Admin or Teacher (protected by invite code)
router.post('/register-staff', registerStaff);

// Fetch user profile from LMS database using Supabase JWT
router.get('/me', protect, getMe);

module.exports = router;
