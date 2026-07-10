import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Only authenticated Admins can create staff accounts
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const body = await request.json();
    const { name, email, password, role: roleName } = body;

    if (!name || !email || !password || !roleName) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    if (!['Admin', 'Teacher'].includes(roleName)) {
      return NextResponse.json({ message: 'Role must be Admin or Teacher.' }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ message: 'Server configuration error: service role key missing.' }, { status: 500 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      console.error('Supabase staff creation error:', authError);
      return NextResponse.json({ message: authError.message }, { status: 400 });
    }

    const supabaseUserId = authData.user.id;

    let dbRole = await prisma.role.findUnique({ where: { name: roleName } });
    if (!dbRole) {
      const permMap = {
        Admin: ['manage_users', 'approve_payments', 'manage_content'],
        Teacher: ['stream_class', 'create_quiz', 'view_reports']
      };
      dbRole = await prisma.role.create({
        data: { name: roleName, permissions: permMap[roleName] }
      });
    }

    const user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        name,
        email,
        password: 'MANAGED_BY_SUPABASE',
        phoneHash: crypto.createHash('sha256').update('').digest('hex'),
        roleId: dbRole.id,
        consentGiven: true,
        consentTs: new Date()
      }
    });

    return NextResponse.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: roleName,
      message: `${roleName} account created successfully.`
    }, { status: 201 });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    console.error('Staff Registration Error:', error);
    return NextResponse.json({ message: 'An error occurred during staff registration.' }, { status: 500 });
  }
}
