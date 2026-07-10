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

    if (!['active', 'locked'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      include: { role: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'Failed to update user status.' }, { status: 400 });
  }
}
