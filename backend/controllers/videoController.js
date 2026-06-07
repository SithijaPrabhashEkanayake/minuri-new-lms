const { prisma } = require('../config/db');
const axios = require('axios');

// Request an OTP (One-Time Playback Token) from VdoCipher
const getVdoCipherOtp = async (req, res) => {
  try {
    const { videoId } = req.body;
    const userId = req.user?.id;

    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User must be logged in' });
    }

    if (!process.env.VDOCIPHER_API_SECRET || process.env.VDOCIPHER_API_SECRET === 'YOUR_VDOCIPHER_API_SECRET_HERE') {
      return res.status(500).json({ message: 'VdoCipher API Secret is missing in .env' });
    }

    // Look up the video in our DB to find the module's view limit
    const video = await prisma.video.findUnique({
      where: { vdoCipherId: videoId },
      include: { module: true }
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found in LMS database' });
    }

    // Get or create VideoView tracking record
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

    // Check limits (if user is Student)
    if (req.user.role === 'Student' && videoView.viewCount >= video.module.viewLimit) {
      return res.status(403).json({ message: `View limit reached. You have already viewed this recording ${videoView.viewCount} times.` });
    }

    const response = await axios.post(
      `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
      // Optional: Add custom dynamic watermarking here
      {
        ttl: 300, // Token valid for 300 seconds
      },
      {
        headers: {
          'Authorization': `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Increment view count if generating OTP was successful
    if (req.user.role === 'Student') {
      await prisma.videoView.update({
        where: { id: videoView.id },
        data: { viewCount: videoView.viewCount + 1 }
      });
    }

    // Send the OTP and PlaybackInfo back to the React frontend
    res.json({
      ...response.data,
      viewCount: videoView.viewCount + 1,
      viewLimit: video.module.viewLimit
    });
  } catch (error) {
    console.error('Error fetching VdoCipher OTP:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate DRM playback token' });
  }
};

// Request AWS S3 upload credentials from VdoCipher
const getUploadCredentials = async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Video title is required' });
    }

    if (!process.env.VDOCIPHER_API_SECRET || process.env.VDOCIPHER_API_SECRET === 'YOUR_VDOCIPHER_API_SECRET_HERE') {
      return res.status(500).json({ message: 'VdoCipher API Secret is missing in .env' });
    }

    // Pass the title in the query string as required by VdoCipher
    const response = await axios.put(
      `https://dev.vdocipher.com/api/videos?title=${encodeURIComponent(title)}`,
      {},
      {
        headers: {
          'Authorization': `Apisecret ${process.env.VDOCIPHER_API_SECRET}`
        }
      }
    );

    // Send the uploadLink, credentials, and videoId back to the React frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching VdoCipher Upload Credentials:', error.response?.data || error.message);
    
    // Check if VdoCipher returned a specific error message (e.g., trial limit reached)
    const vdoErrorMsg = error.response?.data?.message;
    
    res.status(500).json({ 
      message: vdoErrorMsg || 'Failed to generate VdoCipher upload credentials' 
    });
  }
};

module.exports = {
  getVdoCipherOtp,
  getUploadCredentials
};
