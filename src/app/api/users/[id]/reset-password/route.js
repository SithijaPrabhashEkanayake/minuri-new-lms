import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request, { params }) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: user.email
    });

    if (error) {
      return NextResponse.json({ message: 'Failed to generate password reset link.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password reset link has been sent to the user\'s email.' });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
