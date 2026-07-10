import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const modules = await prisma.module.findMany({ 
      where: { published: true },
      include: { videos: true }
    });
    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const body = await request.json();
    const { title, subject, grade, price, durationSec, previewUrl, published } = body;
    const instructorId = userAuth.id;

    const newModule = await prisma.module.create({
      data: {
        title,
        subject,
        grade,
        price,
        durationSec,
        previewUrl,
        instructorId,
        published
      }
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'Failed to create module.' }, { status: 400 });
  }
}
