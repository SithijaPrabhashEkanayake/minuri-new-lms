const { prisma } = require('../config/db');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Admin Supabase client using service role for creating users server-side
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// @desc    Create a student profile in LMS after Supabase signup
// @route   POST /api/auth/complete-profile
// @access  Public
const completeProfile = async (req, res) => {
  try {
    const { id, name, email, phone, grade, consentGiven, classType, medium, institution } = req.body;

    if (!consentGiven) {
      return res.status(400).json({ message: 'Parental consent is required (PDPA compliance)' });
    }

    const userExistsById = await prisma.user.findUnique({ where: { id } });
    if (userExistsById) {
      return res.status(400).json({ message: 'User profile already exists' });
    }

    const userExistsByEmail = await prisma.user.findUnique({ where: { email } });
    if (userExistsByEmail) {
      return res.status(400).json({ message: 'An account with this email already exists. Please use a different email.' });
    }

    const phoneHash = crypto.createHash('sha256').update(phone || '').digest('hex');

    let studentRole = await prisma.role.findUnique({ where: { name: 'Student' } });
    if (!studentRole) {
      studentRole = await prisma.role.create({
        data: { name: 'Student', permissions: ['view_library', 'take_quiz'] }
      });
    }

    const user = await prisma.user.create({
      data: {
        id,
        name,
        email,
        password: 'MANAGED_BY_SUPABASE',
        phoneHash,
        grade,
        classType,
        medium,
        institution,
        roleId: studentRole.id,
        consentGiven: true,
        consentTs: new Date()
      }
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: 'Student',
      message: 'Profile completed successfully.'
    });
  } catch (error) {
    console.error('Profile Creation Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new Admin or Teacher account (invite code protected)
// @route   POST /api/auth/register-staff
// @access  Public (protected by invite code)
const registerStaff = async (req, res) => {
  try {
    const { name, email, password, role: roleName, inviteCode } = req.body;

    // Validate invite code
    if (inviteCode !== process.env.STAFF_INVITE_CODE) {
      return res.status(403).json({ message: 'Invalid invite code. Contact your administrator.' });
    }

    // Validate role
    if (!['Admin', 'Teacher'].includes(roleName)) {
      return res.status(400).json({ message: 'Role must be Admin or Teacher.' });
    }

    // Check for service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ message: 'Server configuration error: service role key missing.' });
    }

    // Check if user already exists in LMS DB
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Create user in Supabase Auth using service role (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      console.error('Supabase staff creation error:', authError);
      return res.status(400).json({ message: authError.message });
    }

    const supabaseUserId = authData.user.id;

    // Get or create the role
    let dbRole = await prisma.role.findUnique({ where: { name: roleName } });
    if (!dbRole) {
      const permMap = {
        Admin: ['manage_users', 'approve_payments', 'manage_content'],
        Teacher: ['stream_class', 'create_quiz', 'view_reports']
      };
      dbRole = await prisma.role.create({
        data: { name: roleName, permissions: permMap[roleName] }
      });
    }

    // Create LMS profile
    const user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        name,
        email,
        password: 'MANAGED_BY_SUPABASE',
        phoneHash: crypto.createHash('sha256').update('').digest('hex'),
        roleId: dbRole.id,
        consentGiven: true,
        consentTs: new Date()
      }
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: roleName,
      message: `${roleName} account created successfully. You can now log in.`
    });
  } catch (error) {
    console.error('Staff Registration Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      grade: user.grade
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  completeProfile,
  registerStaff,
  getMe
};
