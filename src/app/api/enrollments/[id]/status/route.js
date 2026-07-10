import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function PUT(request, { params }) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: { status },
      include: {
        student: { select: { name: true, email: true, grade: true } },
        module: { select: { title: true, price: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
