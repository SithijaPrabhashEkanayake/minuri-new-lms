import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export function Progress() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/progress/my-progress', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch progress', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.token) fetchProgress();
  }, [user?.token]);

  const stat = (l, v, g) => (
    <div className="glass card-pad center" style={{ padding: '22px' }}>
      <div className={`ico ${g}`} style={{ margin: '0 auto 12px' }}>★</div>
      <div style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '28px', color: 'var(--ink-900)' }}>{v}</div>
      <div className="tiny muted">{l}</div>
    </div>
  );

  if (loading) return <div className="p30">Loading progress...</div>;
  if (!data) return <div className="p30">Failed to load progress.</div>;

  return (
    <div>
      <div className="grid g4 mb24">
        {stat('Overall', data.overallProgress + '%', 'gc-blue')}
        {stat('Modules', data.totalModules, 'gc-lav')}
        {stat('Badges', data.badges, 'gc-rose')}
        {stat('Time spent', data.timeSpent, 'gc-mint')}
      </div>
      <div className="grid g2">
        <div className="glass card-pad" style={{ padding: '28px' }}>
          <h3 className="mb24">Module completion</h3>
          {data.moduleProgress.length === 0 ? (
            <p className="tiny muted mb24">No modules available yet.</p>
          ) : (
            data.moduleProgress.map(m => (
              <div key={m.id} className="mb24">
                <div className="row between mb8">
                  <b style={{ fontSize: '14px' }}>{m.title}</b>
                  <span className="tiny muted">{m.progress}%</span>
                </div>
                <div className="pbar"><i style={{ width: `${m.progress}%` }}></i></div>
              </div>
            ))
          )}
          <button className="btn btn-glass btn-block" onClick={() => window.print()}>Export report (PDF)</button>
        </div>
        <div className="glass card-pad" style={{ padding: '28px' }}>
          <h3 className="mb24">Milestones</h3>
          <div className="grid g2" style={{ gap: '20px' }}>
            <div className="center" style={{ opacity: data.fullyCompletedModules > 0 ? 1 : 0.4 }}>
              <div className="medal gc-mint">🏅</div>
              <b className="tiny mt8" style={{ display: 'block' }}>First Module</b>
              <span className="tiny muted">{data.fullyCompletedModules > 0 ? '100% complete' : 'Finish 1 module'}</span>
            </div>
            <div className="center" style={{ opacity: data.overallProgress >= 50 ? 1 : 0.4 }}>
              <div className="medal gc-rose">🎯</div>
              <b className="tiny mt8" style={{ display: 'block' }}>Halfway There</b>
              <span className="tiny muted">{data.overallProgress >= 50 ? 'Unlocked!' : 'Reach 50% overall'}</span>
            </div>
            <div className="center" style={{ opacity: data.fullyCompletedModules >= 3 ? 1 : 0.4 }}>
              <div className="medal" style={{ background: data.fullyCompletedModules >= 3 ? 'linear-gradient(135deg, #f5c98a, #f8d49a)' : '#c4c8d8' }}>{data.fullyCompletedModules >= 3 ? '🏆' : '🔒'}</div>
              <b className="tiny mt8" style={{ display: 'block' }}>Module Master</b>
              <span className="tiny muted">{data.fullyCompletedModules >= 3 ? 'Unlocked!' : 'Finish 3 modules'}</span>
            </div>
            <div className="center" style={{ opacity: .4 }}>
              <div className="medal" style={{ background: '#c4c8d8' }}>🔥</div>
              <b className="tiny mt8" style={{ display: 'block' }}>7-day Streak</b>
              <span className="tiny muted">Keep learning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
