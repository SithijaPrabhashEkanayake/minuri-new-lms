import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function PUT(request, { params }) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const { id } = await params;
    const body = await request.json();
    const { title, category, body: blogBody } = body;
    
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title: title || blog.title,
        category: category || blog.category,
        body: blogBody || blog.body
      }
    });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'Failed to update blog post.' }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const { id } = await params;
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ message: 'Blog removed' });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
