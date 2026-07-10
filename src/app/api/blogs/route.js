import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const body = await request.json();
    const { title, category, body: blogBody } = body;

    if (!title || !category || !blogBody) {
      return NextResponse.json({ message: 'Title, category, and body are required' }, { status: 400 });
    }

    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const grads = ['var(--grad-lav)', 'var(--grad-mint)', 'var(--grad-rose)', 'var(--grad-peach)', 'linear-gradient(135deg,var(--blue),var(--blue-d))'];
    const blogCount = await prisma.blog.count();

    const newBlog = await prisma.blog.create({
      data: {
        title,
        slug,
        category,
        body: blogBody,
        grad: grads[blogCount % grads.length]
      }
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'Failed to create blog post.' }, { status: 400 });
  }
}
