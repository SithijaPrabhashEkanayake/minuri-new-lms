import { NextResponse } from 'next/server';
import axios from 'axios';
import { protect, restrictTo } from '@/lib/authMiddleware';

export async function POST(request) {
  try {
    const userAuth = await protect(request);
    restrictTo(userAuth, 'Admin');

    const body = await request.json();
    const { title } = body;
    
    if (!title) {
      return NextResponse.json({ message: 'Video title is required' }, { status: 400 });
    }

    if (!process.env.VDOCIPHER_API_SECRET || process.env.VDOCIPHER_API_SECRET === 'YOUR_VDOCIPHER_API_SECRET_HERE') {
      return NextResponse.json({ message: 'VdoCipher API Secret is missing in .env' }, { status: 500 });
    }

    const response = await axios.put(
      `https://dev.vdocipher.com/api/videos?title=${encodeURIComponent(title)}`,
      {},
      {
        headers: {
          'Authorization': `Apisecret ${process.env.VDOCIPHER_API_SECRET}`
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching VdoCipher Upload Credentials:', error.response?.data || error.message);
    if (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    const vdoErrorMsg = error.response?.data?.message;
    return NextResponse.json({ message: vdoErrorMsg || 'Failed to generate VdoCipher upload credentials' }, { status: 500 });
  }
}
