import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { VdoPlayer } from '../../components/VdoPlayer';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function Library() {
  const { user, logout } = useAuth();
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [playingVideoTitle, setPlayingVideoTitle] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/modules/enrolled`, {
      headers: { 'Authorization': `Bearer ${user?.token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            // Stale or invalid token — sign out via AuthContext and redirect
            logout();
            window.location.href = '/lms';
            return;
          }
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to fetch library');
        }
        return res.json();
      })
      .then(data => {
        if (!data) return; // If redirected
        if (Array.isArray(data)) {
          setModules(data);
        } else {
          setModules([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching library:', err);
        setModules([]);
        setLoading(false);
      });
  }, [user?.token]);

  if (playingVideoId) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <Button variant="ghost" onClick={() => setPlayingVideoId(null)}>← Back to Library</Button>
        </div>

        <VdoPlayer 
          videoId={playingVideoId} 
          token={user?.token}
          onViewCountUpdate={(count, limit) => {
            // Update the views in the local state so it reflects when going back to the library
            setModules(modules.map(m => ({
              ...m,
              videos: m.videos?.map(v => 
                v.vdoCipherId === playingVideoId 
                  ? { ...v, views: [{ viewCount: count }] } 
                  : v
              )
            })));
          }}
        />

        <div style={{ marginTop: '24px' }}>
          <h2>{playingVideoTitle}</h2>
          <p className="muted">Opening this recording counts as 1 view. Do not close or refresh this page unnecessarily.</p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Loading library..." />;
  if (error) return <div className="p24 center text-danger">{error}</div>;

  return (
    <div className="fade-in">
      <div className="row between align-end mb24">
        <div>
          <h2 className="mb8">My Library</h2>
          <p className="muted">Your enrolled subjects and modules</p>
        </div>
      </div>

      {modules.length === 0 ? (
        <GlassCard>
          <p className="muted text-center" style={{ margin: '24px 0' }}>You have no enrolled modules yet.</p>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {modules.map(mod => (
            <GlassCard key={mod.id}>
              <div style={{ marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>{mod.title}</h3>
                <span className="caption muted">{mod.subject} - Grade {mod.grade}</span>
              </div>

              {(!mod.videos || mod.videos.length === 0) ? (
                <p className="muted tiny">No recordings available for this module yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mod.videos.map(video => (
                    <div key={video.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{video.title}</div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
                          <span className="tiny muted">
                            Views: {video.views?.[0]?.viewCount || 0} / {mod.viewLimit || 8}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        onClick={() => {
                          setPlayingVideoTitle(video.title);
                          setPlayingVideoId(video.vdoCipherId);
                        }}
                      >
                        Watch Recording
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
