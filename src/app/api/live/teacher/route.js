import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Teacher', 'Admin');

    const sessions = await prisma.liveSession.findMany({
      where: { teacherId: userAuth.id },
      orderBy: { createdAt: 'desc' },
      include: {
        modules: { select: { title: true, grade: true } }
      }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
