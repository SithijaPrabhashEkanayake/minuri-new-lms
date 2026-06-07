const { prisma } = require('../config/db');

// @desc    Get all modules (Catalog)
// @route   GET /api/modules
// @access  Public (or protected depending on design)
const getModules = async (req, res) => {
  try {
    const modules = await prisma.module.findMany({ 
      where: { published: true },
      include: { videos: true }
    });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new module
// @route   POST /api/modules
// @access  Admin
const createModule = async (req, res) => {
  try {
    const { title, subject, grade, price, durationSec, previewUrl, published } = req.body;
    const instructorId = req.user.id; // From protect middleware

    const newModule = await prisma.module.create({
      data: {
        title,
        subject,
        grade,
        price,
        durationSec,
        previewUrl,
        instructorId,
        published
      }
    });

    res.status(201).json(newModule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get enrolled modules and their videos for a student
// @route   GET /api/modules/enrolled
// @access  Protected (Student)
const getEnrolledModules = async (req, res) => {
  try {
    // Fetch the logged-in student to get their grade
    const student = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch enrollments for the student that are approved
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        studentId: req.user.id,
        status: 'approved'
      },
      include: {
        module: {
          include: { 
            videos: {
              include: {
                views: {
                  where: { userId: req.user.id }
                }
              }
            }
          }
        }
      }
    });

    // Map enrollments to just return the module objects
    const modules = enrollments.map(e => e.module);
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save a newly uploaded video to a module
// @route   POST /api/modules/:id/videos
// @access  Admin
const saveVideo = async (req, res) => {
  try {
    const { id } = req.params; // module ID
    const { title, videoId } = req.body; // VdoCipher video ID

    if (!title || !videoId) {
      return res.status(400).json({ message: 'Title and VdoCipher videoId are required' });
    }

    const newVideo = await prisma.video.create({
      data: {
        title,
        vdoCipherId: videoId,
        moduleId: id
      }
    });

    res.status(201).json(newVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update view limit for a module
// @route   PUT /api/modules/:id/limit
// @access  Admin
const updateModuleLimit = async (req, res) => {
  try {
    const { id } = req.params;
    const { viewLimit } = req.body;

    if (viewLimit === undefined || viewLimit < 0) {
      return res.status(400).json({ message: 'Valid viewLimit is required' });
    }

    const updatedModule = await prisma.module.update({
      where: { id },
      data: { viewLimit: parseInt(viewLimit) }
    });

    res.json(updatedModule);
  } catch (error) {
    console.error('Error in updateModuleLimit:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getModules, createModule, getEnrolledModules, saveVideo, updateModuleLimit };
