import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function PUT(request, { params }) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Teacher', 'Admin');

    const { id } = await params;

    const session = await prisma.liveSession.update({
      where: { id },
      data: { status: 'ended' }
    });

    return NextResponse.json(session);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
