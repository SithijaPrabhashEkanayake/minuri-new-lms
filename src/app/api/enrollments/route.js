import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect } from '@/lib/authMiddleware';

import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const userAuth = await protect(request);
    const studentId = userAuth.id;

    const formData = await request.formData();
    const moduleId = formData.get('moduleId');
    const paymentRef = formData.get('paymentRef');
    const receiptFile = formData.get('receipt');

    if (!moduleId) {
      return NextResponse.json({ message: 'Module ID is required' }, { status: 400 });
    }

    let receiptUrl = null;
    if (receiptFile && receiptFile.name && receiptFile.size > 0) {
      const bytes = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }
      const filename = `${Date.now()}-${receiptFile.name.replace(/\s+/g, '_')}`;
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      receiptUrl = `/uploads/${filename}`;
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { grade: true, classType: true, medium: true, institution: true }
    });

    if (!student) {
      return NextResponse.json({ message: 'Student profile not found' }, { status: 404 });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_moduleId: {
          studentId,
          moduleId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ message: `You already have a ${existing.status} request for this module.` }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        moduleId,
        paymentRef,
        receiptUrl: receiptUrl || null,
        classType: student.classType,
        grade: student.grade,
        medium: student.medium,
        institution: student.institution,
        status: 'pending',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
      }
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
