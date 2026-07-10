import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function Stream() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [topic, setTopic] = useState('');
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modRes, sessRes] = await Promise.all([
        fetch(`/api/modules`),
        fetch(`/api/live/teacher`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        })
      ]);
      const modData = await modRes.json();
      const sessData = await sessRes.json();
      if (Array.isArray(modData)) setModules(modData);
      if (Array.isArray(sessData)) setActiveSessions(sessData);
      else console.error('sessData is not an array', sessData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleStartStream = async (e) => {
    e.preventDefault();
    if (!topic || selectedModuleIds.length === 0) {
      alert('Please provide a Topic and select at least one Catalog.');
      return;
    }

    setIsStarting(true);
    try {
      const res = await fetch(`/api/live`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ topic, moduleIds: selectedModuleIds })
      });
      if (res.ok) {
        alert('Live Class Started! The Jitsi meeting room has been automatically generated.');
        setTopic('');
        setSelectedModuleIds([]);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to start live class');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsStarting(false);
    }
  };

  const stopSession = async (id) => {
    if (!window.confirm('Are you sure you want to stop this live class?')) return;
    try {
      const res = await fetch(`/api/live/${id}/stop`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        alert('Live class ended.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to stop session');
    }
  };

  const toggleModuleSelection = (id) => {
    if (selectedModuleIds.includes(id)) {
      setSelectedModuleIds(selectedModuleIds.filter(mId => mId !== id));
    } else {
      setSelectedModuleIds([...selectedModuleIds, id]);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '22px' }}>
      <div>
        <div className="glass card-pad mb24">
          <h3 className="mb16">Start a Live Class</h3>
          <form onSubmit={handleStartStream}>
            <div className="field mb16">
              <label>Class Topic</label>
              <input 
                className="input" 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                placeholder="e.g., Grade 11 - Loops & Iteration" 
              />
            </div>

            <div className="field mb24">
              <label>Select Target Catalogs</label>
              <p className="tiny muted mb8">Only enrolled students in the selected catalogs can join.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {modules.map(mod => (
                  <label key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedModuleIds.includes(mod.id)}
                      onChange={() => toggleModuleSelection(mod.id)}
                    />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{mod.title}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isStarting}>
              {isStarting ? 'Starting...' : 'Start Live Class & Generate Room'}
            </button>
          </form>
        </div>
      </div>

      <div className="glass card-pad" style={{ padding: '22px', height: 'fit-content' }}>
        <h3 className="mb16">Live & Recent Classes</h3>
        {activeSessions.length === 0 && <p className="muted tiny">No recent classes found.</p>}
        {activeSessions.map(sess => (
          <div key={sess.id} style={{ padding: '16px 0', borderBottom: '1px solid rgba(120,130,170,.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <b style={{ fontSize: '15px' }}>{sess.topic}</b>
                <div className="tiny mt8" style={{ color: sess.status === 'live' ? '#E2607A' : '#7882AA' }}>
                  {sess.status === 'live' ? '● LIVE NOW' : '○ Ended'}
                </div>
                <div className="tiny muted mt4">
                  {sess.modules.map(m => m.title).join(', ')}
                </div>
              </div>
            </div>
            {sess.status === 'live' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <a href={sess.zoomLink} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ flex: 1, textAlign: 'center', background: '#e0f2fe', color: '#0369a1', textDecoration: 'none' }}>
                  Join as Teacher
                </a>
                <button className="btn btn-danger btn-sm" onClick={() => stopSession(sess.id)}>
                  Stop
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
