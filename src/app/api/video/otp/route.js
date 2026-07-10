import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import axios from 'axios';
import { protect } from '@/lib/authMiddleware';

export async function POST(request) {
  try {
    const userAuth = await protect(request);
    const userId = userAuth.id;

    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ message: 'Video ID is required' }, { status: 400 });
    }

    if (!process.env.VDOCIPHER_API_SECRET || process.env.VDOCIPHER_API_SECRET === 'YOUR_VDOCIPHER_API_SECRET_HERE') {
      return NextResponse.json({ message: 'VdoCipher API Secret is missing in .env' }, { status: 500 });
    }

    const video = await prisma.video.findUnique({
      where: { vdoCipherId: videoId },
      include: { module: true }
    });

    if (!video) {
      return NextResponse.json({ message: 'Video not found in LMS database' }, { status: 404 });
    }

    let videoView = await prisma.videoView.findUnique({
      where: { 
        userId_videoId: { userId, videoId: video.id } 
      }
    });

    if (!videoView) {
      videoView = await prisma.videoView.create({
        data: { userId, videoId: video.id, viewCount: 0 }
      });
    }

    if (userAuth.role === 'Student' && videoView.viewCount >= video.module.viewLimit) {
      return NextResponse.json({ message: `View limit reached. You have already viewed this recording ${videoView.viewCount} times.` }, { status: 403 });
    }

    const response = await axios.post(
      `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
      { ttl: 300 },
      {
        headers: {
          'Authorization': `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (userAuth.role === 'Student') {
      await prisma.videoView.update({
        where: { id: videoView.id },
        data: { viewCount: videoView.viewCount + 1 }
      });
    }

    return NextResponse.json({
      ...response.data,
      viewCount: videoView.viewCount + 1,
      viewLimit: video.module.viewLimit
    });
  } catch (error) {
    console.error('Error fetching VdoCipher OTP:', error.response?.data || error.message);
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    return NextResponse.json({ message: 'Failed to generate DRM playback token' }, { status: 500 });
  }
}
