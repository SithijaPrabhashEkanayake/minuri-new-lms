import React, { useState, useEffect } from 'react';

export const VdoPlayer = ({ videoId, token, onViewCountUpdate }) => {
  const [otp, setOtp] = useState(null);
  const [playbackInfo, setPlaybackInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchOtp = async () => {
      try {
        const response = await fetch(`/api/video/otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ videoId })
        });

        const data = await response.json();

        if (response.ok) {
          if (mounted) {
            setOtp(data.otp);
            setPlaybackInfo(data.playbackInfo);
            if (onViewCountUpdate) onViewCountUpdate(data.viewCount, data.viewLimit);
          }
        } else {
          if (mounted) setError(data.message || 'Failed to load video token.');
        }
      } catch (err) {
        console.error('Error fetching VdoCipher OTP:', err);
        if (mounted) setError('Could not connect to DRM server.');
      }
    };

    if (videoId && token) {
      fetchOtp();
    }

    return () => {
      mounted = false;
    };
  }, [videoId, token]);

  if (error) {
    return (
      <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
        <p style={{ color: 'var(--danger)' }}>⚠️ {error}</p>
        <p className="tiny muted">
          (Note: If you haven't provided your VdoCipher API Secret in the backend .env yet, this is expected!)
        </p>
      </div>
    );
  }

  if (!otp || !playbackInfo) {
    return (
      <div className="glass" style={{ padding: '80px', textAlign: 'center', borderRadius: '16px' }}>
        <p className="muted">Encrypting secure playback token...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
      <iframe
        src={`https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`}
        style={{ border: 0, position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
        allowFullScreen
        allow="encrypted-media"
        title="Secure DRM Player"
      ></iframe>
    </div>
  );
};
