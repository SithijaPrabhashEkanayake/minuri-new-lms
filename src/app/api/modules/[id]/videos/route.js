import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { protect, restrictTo } from '@/lib/authMiddleware';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request, { params }) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const { id } = await params; // module ID
    const formData = await request.formData();
    const title = formData.get('title');
    const videoId = formData.get('videoId');
    const thumbnailFile = formData.get('thumbnail');

    if (!title || !videoId) {
      return NextResponse.json({ message: 'Title and VdoCipher videoId are required' }, { status: 400 });
    }

    let thumbnailUrl = null;
    if (thumbnailFile && thumbnailFile.name && thumbnailFile.size > 0) {
      const bytes = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }
      const filename = `${Date.now()}-thumb-${thumbnailFile.name.replace(/\s+/g, '_')}`;
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      thumbnailUrl = `/uploads/${filename}`;
    }

    const newVideo = await prisma.video.create({
      data: {
        title,
        vdoCipherId: videoId,
        thumbnailUrl,
        moduleId: id
      }
    });

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'Failed to save video.' }, { status: 400 });
  }
}
