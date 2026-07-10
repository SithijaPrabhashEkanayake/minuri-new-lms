const { prisma } = require('../config/db');

// @desc    Get user's progress summary
// @route   GET /api/progress/my-progress
// @access  Student
const getMyProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch published modules matching student's grade
    const modules = await prisma.module.findMany({ 
      where: {
        published: true,
        grade: student.grade || undefined
      },
      include: {
        videos: true
      }
    });

    // Fetch the user's video views
    const views = await prisma.videoView.findMany({
      where: { userId: studentId }
    });

    // Calculate progress per module
    let totalProgressSum = 0;
    let totalTimeSpent = 0;
    let fullyCompletedModules = 0;

    const moduleProgress = modules.map(m => {
      const totalVideos = m.videos.length;
      let watchedVideos = 0;

      m.videos.forEach(v => {
        const viewRecord = views.find(vw => vw.videoId === v.id);
        if (viewRecord && viewRecord.viewCount > 0) {
          watchedVideos++;
        }
      });

      const progress = totalVideos === 0 ? 0 : Math.round((watchedVideos / totalVideos) * 100);
      
      totalProgressSum += progress;
      if (progress === 100 && totalVideos > 0) fullyCompletedModules++;

      // Basic mock for time spent: 10 mins per watched video (600 sec)
      totalTimeSpent += (watchedVideos * 600);

      return {
        id: m.id,
        title: m.title,
        progress,
        totalVideos,
        watchedVideos
      };
    });

    const overallProgress = modules.length === 0 ? 0 : Math.round(totalProgressSum / modules.length);
    
    const badges = fullyCompletedModules > 0 ? fullyCompletedModules : 0;
    const timeSpentHours = Math.round((totalTimeSpent / 3600) * 10) / 10; // e.g. 1.5h

    res.json({
      overallProgress,
      totalModules: modules.length,
      badges,
      timeSpent: `${timeSpentHours}h`,
      moduleProgress,
      fullyCompletedModules
    });

  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = { getMyProgress };
