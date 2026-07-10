const { prisma } = require('../config/db');
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// @desc    Update user status
// @route   PUT /api/users/:id/status
// @access  Admin
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'locked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      include: { role: true }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update user status.' });
  }
};

// @desc    Generate password reset link
// @route   POST /api/users/:id/reset-password
// @access  Admin
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: user.email
    });

    if (error) {
      return res.status(400).json({ message: 'Failed to generate password reset link.' });
    }

    // The recovery link is sent via email by Supabase; do NOT return it in the API response
    res.json({ message: 'Password reset link has been sent to the user\'s email.' });
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = { getUsers, updateUserStatus, resetUserPassword };
