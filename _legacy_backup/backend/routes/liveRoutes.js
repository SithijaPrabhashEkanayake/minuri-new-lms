const express = require('express');
const router = express.Router();
const { 
  startLiveSession, 
  stopLiveSession, 
  getTeacherLiveSessions, 
  getStudentLiveSessions, 
  joinLiveSession 
} = require('../controllers/liveController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/', protect, restrictTo('Admin', 'Teacher'), startLiveSession);
router.put('/:id/stop', protect, restrictTo('Admin', 'Teacher'), stopLiveSession);
router.get('/teacher', protect, restrictTo('Admin', 'Teacher'), getTeacherLiveSessions);
router.get('/student', protect, getStudentLiveSessions);
router.get('/join/:id', protect, joinLiveSession);

module.exports = router;
