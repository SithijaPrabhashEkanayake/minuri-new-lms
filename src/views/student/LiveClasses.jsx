import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function LiveClasses() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIframeUrl, setActiveIframeUrl] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/live/student`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const joinSession = async (id) => {
    try {
      const res = await fetch(`/api/live/join/${id}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.zoomLink) {
        // Embed the zoom link directly in the dashboard
        setActiveIframeUrl(data.zoomLink);
      } else {
        alert(data.message || 'Failed to join live class. Please make sure you are enrolled.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while joining the class.');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (activeIframeUrl) {
    return (
      <div className="fade-up">
        <div className="row between mb16">
          <h2 style={{ color: '#0c4a40' }}>Live Class Room</h2>
          <button className="btn btn-secondary" onClick={() => setActiveIframeUrl(null)}>Leave Room</button>
        </div>
        <div className="glass" style={{ padding: '0', borderRadius: '12px', overflow: 'hidden', height: '75vh', border: '1px solid rgba(0,0,0,0.1)' }}>
          <iframe 
            src={activeIframeUrl} 
            allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-read; clipboard-write"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Live Class"
          />
        </div>
        <p className="tiny muted mt16 text-center">If the meeting fails to connect, your browser may be blocking 3rd party cookies or Zoom might prevent embedding on this device.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="row between align-end mb24">
        <div>
          <h2 className="mb8">Live Classes</h2>
          <p className="muted">Join ongoing live sessions for your enrolled catalogs</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="glass card-pad center" style={{ padding: '60px' }}>
          <h3><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Television.webp" alt="Television" width="30" height="30" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> No Active Classes</h3>
          <p className="muted mt8">There are no live classes happening right now for your enrolled catalogs.</p>
        </div>
      ) : (
        <div className="grid g2">
          {sessions.map(l => (
            <div key={l.id} className="glass card-pad fade-up" style={{ padding: '24px' }}>
              <div className="row between mb16">
                <span className="chip chip-rose">● LIVE NOW</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {l.modules.map(m => (
                    <span key={m.title} className="chip chip-blue">Grade {m.grade}</span>
                  ))}
                </div>
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{l.topic}</h3>
              <p className="muted tiny mb16">Started {new Date(l.createdAt).toLocaleTimeString()} · taught by {l.teacher?.name}</p>
              <div className="row between">
                <span className="tiny muted">Zoom Meeting</span>
                <button className="btn btn-primary btn-sm" onClick={() => joinSession(l.id)}>Join Class</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="glass card-pad mt24" style={{ padding: '24px', background: 'var(--grad-mint)' }}>
        <h3 style={{ color: '#0c4a40' }}>How it works</h3>
        <p style={{ color: '#0c4a40', opacity: .85, marginTop: '6px' }}>When a teacher starts a live session for a catalog you are enrolled in, it will appear here. Click 'Join Class' to enter the live room directly within your dashboard!</p>
      </div>
    </div>
  );
}
