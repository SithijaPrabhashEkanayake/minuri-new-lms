import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Student');

    const student = await prisma.user.findUnique({
      where: { id: userAuth.id }
    });

    if (!student) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { 
        studentId: userAuth.id,
        status: 'approved'
      },
      include: {
        module: {
          include: { 
            videos: {
              include: {
                views: {
                  where: { userId: userAuth.id }
                }
              }
            }
          }
        }
      }
    });

    const modules = enrollments.map(e => e.module);
    return NextResponse.json(modules);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
