import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Teacher', 'Admin');

    const body = await request.json();
    const { topic, moduleIds } = body;
    
    if (!topic || !moduleIds || moduleIds.length === 0) {
      return NextResponse.json({ message: 'Topic and at least one Module are required.' }, { status: 400 });
    }

    const uniqueRoomId = 'ICT-Academy-' + crypto.randomUUID();
    const jitsiLink = `https://meet.jit.si/${uniqueRoomId}`;

    const session = await prisma.liveSession.create({
      data: {
        topic,
        zoomLink: jitsiLink,
        status: 'live',
        teacherId: userAuth.id,
        modules: {
          connect: moduleIds.map(id => ({ id }))
        }
      },
      include: {
        modules: true
      }
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
