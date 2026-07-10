import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const userAuth = await protect(request);
    const studentId = userAuth.id;

    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const modules = await prisma.module.findMany({ 
      where: {
        published: true,
        grade: student.grade || undefined
      },
      include: {
        videos: true
      }
    });

    const views = await prisma.videoView.findMany({
      where: { userId: studentId }
    });

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
    const timeSpentHours = Math.round((totalTimeSpent / 3600) * 10) / 10;

    return NextResponse.json({
      overallProgress,
      totalModules: modules.length,
      badges,
      timeSpent: `${timeSpentHours}h`,
      moduleProgress,
      fullyCompletedModules
    });

  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
