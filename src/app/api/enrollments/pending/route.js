import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const enrollments = await prisma.enrollment.findMany({
      where: { status: 'pending' },
      include: {
        student: { select: { name: true, email: true, grade: true, classType: true, medium: true, institution: true } },
        module: { select: { title: true, price: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(enrollments);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
