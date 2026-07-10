import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const sources = await prisma.aiSource.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(sources);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const body = await request.json();
    const { name, pages, content } = body;

    if (!name) {
      return NextResponse.json({ message: 'Source name is required' }, { status: 400 });
    }

    const newSource = await prisma.aiSource.create({
      data: {
        name,
        pages: pages || 1,
        content: content || '',
        status: 'Indexed'
      }
    });

    return NextResponse.json(newSource, { status: 201 });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'Failed to add AI source.' }, { status: 400 });
  }
}
