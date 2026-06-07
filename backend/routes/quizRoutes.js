const express = require('express');
const router = express.Router();
const { getQuizzes, createQuiz, getQuizById, updateQuiz, deleteQuiz } = require('../controllers/quizController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, restrictTo('Admin', 'Teacher'), createQuiz);

router.route('/:id')
  .get(protect, getQuizById)
  .put(protect, restrictTo('Admin', 'Teacher'), updateQuiz)
  .delete(protect, restrictTo('Admin', 'Teacher'), deleteQuiz);

module.exports = router;
