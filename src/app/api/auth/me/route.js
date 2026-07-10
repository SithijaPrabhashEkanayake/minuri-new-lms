import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const userAuth = await protect(request);

    const user = await prisma.user.findUnique({
      where: { id: userAuth.id },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      grade: user.grade
    });
  } catch (error) {
    if (error.message === 'Not authorized, no token' || error.message === 'Not authorized, token failed') {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
