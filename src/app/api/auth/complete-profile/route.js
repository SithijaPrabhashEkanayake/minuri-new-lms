import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { protect } from '@/lib/authMiddleware';

export async function POST(request) {
  try {
    const userAuth = await protect(request);
    const id = userAuth.id;

    if (!id) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, grade, consentGiven, classType, medium, institution } = body;

    if (!consentGiven) {
      return NextResponse.json({ message: 'Parental consent is required (PDPA compliance)' }, { status: 400 });
    }

    const userExistsById = await prisma.user.findUnique({ where: { id } });
    if (userExistsById) {
      return NextResponse.json({ message: 'User profile already exists' }, { status: 400 });
    }

    const userExistsByEmail = await prisma.user.findUnique({ where: { email } });
    if (userExistsByEmail) {
      return NextResponse.json({ message: 'An account with this email already exists. Please use a different email.' }, { status: 400 });
    }

    const phoneHash = crypto.createHash('sha256').update(phone || '').digest('hex');

    let studentRole = await prisma.role.findUnique({ where: { name: 'Student' } });
    if (!studentRole) {
      studentRole = await prisma.role.create({
        data: { name: 'Student', permissions: ['view_library', 'take_quiz'] }
      });
    }

    const user = await prisma.user.create({
      data: {
        id,
        name,
        email,
        password: 'MANAGED_BY_SUPABASE',
        phoneHash,
        grade,
        classType,
        medium,
        institution,
        roleId: studentRole.id,
        consentGiven: true,
        consentTs: new Date()
      }
    });

    return NextResponse.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: 'Student',
      message: 'Profile completed successfully.'
    }, { status: 201 });
  } catch (error) {
    console.error('Profile Creation Error:', error);
    if (error.message === 'Not authorized, no token' || error.message === 'Not authorized, token failed') {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'An error occurred while creating your profile.' }, { status: 500 });
  }
}
