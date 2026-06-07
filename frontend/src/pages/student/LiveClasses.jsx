import React from 'react';
import { DB } from '../../data/mockDB';

export function LiveClasses() {
  return (
    <div>
      <div className="grid g2">
        {DB.live.map(l => (
          <div key={l.id} className="glass card-pad fade-up" style={{ padding: '24px' }}>
            <div className="row between mb16">
              <span className="chip chip-rose">● LIVE soon</span>
              <span className="chip chip-blue">Grade {l.grade}</span>
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{l.topic}</h3>
            <p className="muted tiny mb16">🕐 {l.when} · taught by Minuri A.</p>
            <div className="row between">
              <span className="tiny muted">Chat · Polls · Q&A · Screen share</span>
              <button className="btn btn-primary btn-sm" onClick={() => alert('Verifying subscription & single-device rule… joining secure room.')}>Join →</button>
            </div>
          </div>
        ))}
      </div>
      <div className="glass card-pad mt24" style={{ padding: '24px', background: 'var(--grad-mint)' }}>
        <h3 style={{ color: '#0c4a40' }}>Subscription active</h3>
        <p style={{ color: '#0c4a40', opacity: .85, marginTop: '6px' }}>Your monthly live-class subscription is approved. Sessions are auto-recorded and added to your library after the teacher uploads them.</p>
      </div>
    </div>
  );
}
