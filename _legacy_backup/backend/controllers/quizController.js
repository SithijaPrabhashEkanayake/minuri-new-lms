const { prisma } = require('../config/db');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Teacher/Admin
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: { _count: { select: { questions: true } }, module: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Teacher/Admin/Student
const getQuizById = async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: { questions: true, module: true }
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Teacher/Admin
const createQuiz = async (req, res) => {
  try {
    const { title, timeLimit, moduleId, questions } = req.body;

    if (!title || !timeLimit) {
      return res.status(400).json({ message: 'Title and time limit are required' });
    }

    // Construct questions data if provided
    const questionsData = questions && questions.length > 0 ? { create: questions } : undefined;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        timeLimit: parseInt(timeLimit),
        moduleId: moduleId || null,
        questions: questionsData
      },
      include: { questions: true }
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Teacher/Admin
const updateQuiz = async (req, res) => {
  try {
    const { title, timeLimit, moduleId } = req.body;
    const quiz = await prisma.quiz.update({
      where: { id: req.params.id },
      data: {
        title,
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
        moduleId: moduleId || null
      }
    });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Teacher/Admin
const deleteQuiz = async (req, res) => {
  try {
    await prisma.quiz.delete({ where: { id: req.params.id } });
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
};
