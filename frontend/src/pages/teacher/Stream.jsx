import React, { useState } from 'react';
import { DB } from '../../data/mockDB';

export function Stream() {
  const [streaming, setStreaming] = useState(false);

  const toggleStream = () => {
    setStreaming(!streaming);
    alert(!streaming ? 'You are now LIVE — students admitted, attendance tracking on.' : 'Stream stopped — recording uploaded for admin approval.');
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '22px' }}>
      <div>
        <div className="player">
          <span className="vc">
            <span className="chip" style={{ background: streaming ? 'rgba(226,96,122,.9)' : 'rgba(0,0,0,.4)', color: '#fff', border: 'none' }}>
              {streaming ? '● LIVE' : '○ Offline'}
            </span>
          </span>
          <div className="center-ico">🎥</div>
        </div>
        <div className="row mt16" style={{ gap: '10px' }}>
          <button className={`btn ${streaming ? 'btn-danger' : 'btn-primary'}`} onClick={toggleStream}>
            {streaming ? 'Stop stream' : 'Start stream'}
          </button>
          <button className="btn btn-glass" onClick={() => alert('Screen sharing enabled.')}>Share screen</button>
          <button className="btn btn-glass" onClick={() => alert('Poll launched to students.')}>Launch poll</button>
        </div>
        <p className="muted tiny mt16">
          {streaming ? 'Recording is on. The session will auto-upload for admin approval when you stop.' : 'Select a scheduled session and start streaming. Only subscribed, approved students can join.'}
        </p>
      </div>
      <div className="glass card-pad" style={{ padding: '22px', height: 'fit-content' }}>
        <h3 className="mb16">Scheduled today</h3>
        {DB.live.map(l => (
          <div key={l.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(120,130,170,.12)' }}>
            <b style={{ fontSize: '14px' }}>{l.topic}</b>
            <div className="tiny muted mt8">{l.when} · Grade {l.grade}</div>
          </div>
        ))}
        <div className="row between mt16">
          <span className="tiny muted">Attendance tracking</span>
          <div className="toggle on"></div>
        </div>
      </div>
    </div>
  );
}
