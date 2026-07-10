import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function GET(request, { params }) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Student');

    const { id } = await params;

    const session = await prisma.liveSession.findUnique({
      where: { id },
      include: { modules: true }
    });

    if (!session || session.status !== 'live') {
      return NextResponse.json({ message: 'Live session not found or has ended.' }, { status: 404 });
    }

    const sessionModuleIds = session.modules.map(m => m.id);
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: userAuth.id,
        status: 'approved',
        moduleId: { in: sessionModuleIds }
      }
    });

    if (!enrollment) {
      return NextResponse.json({ message: 'Access denied. You are not enrolled in the required catalog for this live class.' }, { status: 403 });
    }

    return NextResponse.json({ zoomLink: session.zoomLink });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
