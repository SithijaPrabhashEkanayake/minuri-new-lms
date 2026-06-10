import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function Limits() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/modules')
      .then(res => res.json())
      .then(data => {
        setModules(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching modules:', err);
        setLoading(false);
      });
  }, []);

  const handleLimitChange = (id, delta) => {
    setModules(modules.map(m => {
      if (m.id === id) {
        const newLimit = Math.max(1, (m.viewLimit || 8) + delta);
        return { ...m, viewLimit: newLimit };
      }
      return m;
    }));
  };

  const handleSave = async (id, newLimit) => {
    setSaving(id);
    try {
      const res = await fetch(`http://localhost:5000/api/modules/${id}/limit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ viewLimit: newLimit })
      });

      if (res.ok) {
        setMessage('Limit saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Failed to save limit:', errData);
        setMessage(`Failed to save limit: ${errData.message || res.statusText}`);
      }
    } catch (err) {
      setMessage('Error saving limit.');
    }
    setSaving(null);
  };

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="glass card-pad" style={{ padding: '24px' }}>
      <h3 className="mb8">Recording view limits</h3>
      <p className="muted tiny mb24">Set the maximum number of times students can view recordings in each module.</p>
      {message && <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>{message}</div>}
      
      <table className="tbl">
        <thead>
          <tr>
            <th>Module</th>
            <th>Scope</th>
            <th>Max views</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m) => (
            <tr key={m.id}>
              <td>{m.title}</td>
              <td><span className="chip">Per Module</span></td>
              <td>
                <div className="row" style={{ gap: '8px' }}>
                  <button className="btn btn-glass btn-sm" onClick={() => handleLimitChange(m.id, -1)}>−</button>
                  <b>{m.viewLimit || 8}</b>
                  <button className="btn btn-glass btn-sm" onClick={() => handleLimitChange(m.id, 1)}>+</button>
                </div>
              </td>
              <td>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => handleSave(m.id, m.viewLimit)}
                  disabled={saving === m.id}
                >
                  {saving === m.id ? 'Saving...' : 'Save'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

