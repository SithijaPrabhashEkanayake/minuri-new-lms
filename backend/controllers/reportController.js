const { prisma } = require('../config/db');

// @desc    Get dashboard metrics
// @route   GET /api/reports/dashboard
// @access  Admin
const getDashboardMetrics = async (req, res) => {
  try {
    // 1. STATS
    const studentRole = await prisma.role.findUnique({ where: { name: 'Student' } });
    const totalStudents = studentRole ? await prisma.user.count({ where: { roleId: studentRole.id } }) : 0;
    const totalModules = await prisma.module.count();
    const totalAiSources = await prisma.aiSource.count();
    
    const allViews = await prisma.videoView.aggregate({
      _sum: {
        viewCount: true
      }
    });
    const totalViews = allViews._sum.viewCount || 0;

    // 2. BAR CHART: Views by Module
    const modules = await prisma.module.findMany({
      include: {
        videos: {
          include: {
            views: true
          }
        }
      }
    });

    const barLabels = [];
    const barData = [];
    modules.forEach(m => {
      // truncate very long module titles for the chart label
      const label = m.title.length > 15 ? m.title.substring(0, 15) + '...' : m.title;
      barLabels.push(label);
      
      let sum = 0;
      m.videos.forEach(v => {
        v.views.forEach(vw => sum += vw.viewCount);
      });
      barData.push(sum);
    });

    // 3. LINE CHART: New Students over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentUsers = studentRole ? await prisma.user.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        },
        roleId: studentRole.id
      },
      select: { createdAt: true }
    }) : [];

    const lineLabels = [];
    const lineData = [0, 0, 0, 0, 0, 0, 0];

    const today = new Date();
    today.setHours(0,0,0,0);

    for(let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      lineLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    recentUsers.forEach(u => {
      const uDate = new Date(u.createdAt);
      uDate.setHours(0,0,0,0);
      const diffTime = Math.abs(today - uDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 6) {
        lineData[6 - diffDays]++;
      }
    });

    res.json({
      stats: {
        totalStudents,
        totalModules,
        totalViews,
        totalAiSources
      },
      barChart: {
        labels: barLabels,
        data: barData
      },
      lineChart: {
        labels: lineLabels,
        data: lineData
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = { getDashboardMetrics };
