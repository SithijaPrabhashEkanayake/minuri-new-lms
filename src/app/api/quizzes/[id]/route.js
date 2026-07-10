import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function GET(request, { params }) {
  try {
    const userAuth = await protect(request);
    
    const { id } = await params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true, module: true }
    });
    
    if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    return NextResponse.json(quiz);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Teacher', 'Admin');

    const { id } = await params;
    const body = await request.json();
    const { title, timeLimit, moduleId } = body;

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
        moduleId: moduleId || null
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Teacher', 'Admin');

    const { id } = await params;
    await prisma.quiz.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Quiz removed' });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
