const { prisma } = require('../config/db');

// @desc    Get all AI sources
// @route   GET /api/ai-sources
// @access  Admin
const getAiSources = async (req, res) => {
  try {
    const sources = await prisma.aiSource.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(sources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new AI source
// @route   POST /api/ai-sources
// @access  Admin
const addAiSource = async (req, res) => {
  try {
    const { name, pages } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Source name is required' });
    }

    const newSource = await prisma.aiSource.create({
      data: {
        name,
        pages: pages || 1,
        status: 'Indexed'
      }
    });

    res.status(201).json(newSource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAiSources, addAiSource };
