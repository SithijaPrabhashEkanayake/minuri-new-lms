const { prisma } = require('../config/db');
const crypto = require('crypto');

// @desc    Start a new live session
// @route   POST /api/live
// @access  Protected (Teacher/Admin)
const startLiveSession = async (req, res) => {
  try {
    const { topic, moduleIds } = req.body;
    
    if (!topic || !moduleIds || moduleIds.length === 0) {
      return res.status(400).json({ message: 'Topic and at least one Module are required.' });
    }

    // Auto-generate a cryptographically secure, unique Jitsi Meet link
    const uniqueRoomId = 'ICT-Academy-' + crypto.randomUUID();
    const jitsiLink = `https://meet.jit.si/${uniqueRoomId}`;

    const session = await prisma.liveSession.create({
      data: {
        topic,
        zoomLink: jitsiLink, // We store the Jitsi link in the existing zoomLink column
        status: 'live',
        teacherId: req.user.id,
        modules: {
          connect: moduleIds.map(id => ({ id }))
        }
      },
      include: {
        modules: true
      }
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// @desc    Stop a live session
// @route   PUT /api/live/:id/stop
// @access  Protected (Teacher/Admin)
const stopLiveSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.liveSession.update({
      where: { id },
      data: { status: 'ended' }
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// @desc    Get all active sessions for teacher
// @route   GET /api/live/teacher
// @access  Protected (Teacher/Admin)
const getTeacherLiveSessions = async (req, res) => {
  try {
    const sessions = await prisma.liveSession.findMany({
      where: { teacherId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        modules: { select: { title: true, grade: true } }
      }
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// @desc    Get active live sessions for student
// @route   GET /api/live/student
// @access  Protected (Student)
const getStudentLiveSessions = async (req, res) => {
  try {
    // Find all modules the student is actively enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user.id, status: 'approved' },
      select: { moduleId: true }
    });
    
    const enrolledModuleIds = enrollments.map(e => e.moduleId);

    // Find any "live" sessions connected to these modules
    const activeSessions = await prisma.liveSession.findMany({
      where: {
        status: 'live',
        modules: {
          some: {
            id: { in: enrolledModuleIds }
          }
        }
      },
      select: {
        id: true,
        topic: true,
        status: true,
        createdAt: true,
        teacher: { select: { name: true } },
        modules: { select: { title: true, grade: true } }
        // CRITICAL: zoomLink is NOT selected here!
      }
    });

    res.json(activeSessions);
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// @desc    Securely join a live session (Returns link)
// @route   GET /api/live/join/:id
// @access  Protected (Student)
const joinLiveSession = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify session exists and is live
    const session = await prisma.liveSession.findUnique({
      where: { id },
      include: { modules: true }
    });

    if (!session || session.status !== 'live') {
      return res.status(404).json({ message: 'Live session not found or has ended.' });
    }

    // Verify student is enrolled in at least one of the required modules
    const sessionModuleIds = session.modules.map(m => m.id);
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: req.user.id,
        status: 'approved',
        moduleId: { in: sessionModuleIds }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Access denied. You are not enrolled in the required catalog for this live class.' });
    }

    // Give them the zoom link
    res.json({ zoomLink: session.zoomLink });
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = {
  startLiveSession,
  stopLiveSession,
  getTeacherLiveSessions,
  getStudentLiveSessions,
  joinLiveSession
};
