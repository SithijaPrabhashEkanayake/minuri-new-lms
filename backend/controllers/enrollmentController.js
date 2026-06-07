const { prisma } = require('../config/db');

// @desc    Create a new enrollment request (Student)
// @route   POST /api/enrollments
// @access  Protected (Student)
const createEnrollment = async (req, res) => {
  try {
    const { moduleId, paymentRef, classType, grade, medium, institution } = req.body;
    const studentId = req.user.id;

    if (!moduleId) {
      return res.status(400).json({ message: 'Module ID is required' });
    }

    let receiptUrl = null;
    if (req.file) {
      receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }

    // Check if already enrolled or requested
    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_moduleId: {
          studentId,
          moduleId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ message: `You already have a ${existing.status} request for this module.` });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        moduleId,
        paymentRef,
        receiptUrl,
        classType,
        grade: grade ? parseInt(grade) : null,
        medium,
        institution,
        status: 'pending',
        ipAddress: req.ip
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending enrollments (Admin)
// @route   GET /api/enrollments/pending
// @access  Protected (Admin)
const getPendingEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { status: 'pending' },
      include: {
        student: { select: { name: true, email: true } },
        module: { select: { title: true, price: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update enrollment status (Admin)
// @route   PUT /api/enrollments/:id/status
// @access  Protected (Admin)
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: { status },
      include: {
        student: { select: { name: true, email: true, grade: true } },
        module: { select: { title: true, price: true } }
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createEnrollment, getPendingEnrollments, updateEnrollmentStatus };
