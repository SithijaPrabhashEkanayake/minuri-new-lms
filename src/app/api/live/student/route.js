import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Student');

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userAuth.id, status: 'approved' },
      select: { moduleId: true }
    });
    
    const enrolledModuleIds = enrollments.map(e => e.moduleId);

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
      }
    });

    return NextResponse.json(activeSessions);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
