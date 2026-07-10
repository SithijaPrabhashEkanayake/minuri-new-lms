import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Teacher', 'Admin');

    const quizzes = await prisma.quiz.findMany({
      include: { _count: { select: { questions: true } }, module: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(quizzes);
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
    restrictTo(userAuth, 'Teacher', 'Admin');

    const body = await request.json();
    const { title, timeLimit, moduleId, questions } = body;

    if (!title || !timeLimit) {
      return NextResponse.json({ message: 'Title and time limit are required' }, { status: 400 });
    }

    const questionsData = questions && questions.length > 0 ? { create: questions } : undefined;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        timeLimit: parseInt(timeLimit),
        moduleId: moduleId || null,
        questions: questionsData
      },
      include: { questions: true }
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
