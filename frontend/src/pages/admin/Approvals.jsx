import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function Approvals() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, [user]);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/enrollments/pending`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setApprovals(data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const decide = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/enrollments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setApprovals(prev => prev.filter(a => a.id !== id));
        alert(status === 'approved' ? 'Approved — access granted & student notified.' : 'Denied — student notified.');
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  };

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div>
      {approvals.length > 0 ? (
        <div className="grid g3">
          {approvals.map(a => (
            <div key={a.id} className="glass card-pad fade-up" style={{ padding: '22px' }}>
              <div className="row between mb8">
                <b>{a.student.name}</b>
                {a.paymentRef ? <span className="chip chip-rose">Ref: {a.paymentRef}</span> : null}
              </div>
              <p className="tiny muted mb8">
                <strong>Module:</strong> {a.module.title} (Rs {a.module.price?.toLocaleString()})
              </p>
              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                <div><strong>Grade:</strong> {a.grade || a.student?.grade || 'N/A'}</div>
                <div><strong>Class:</strong> {a.classType || a.student?.classType || 'N/A'}</div>
                <div><strong>Medium:</strong> {a.medium || a.student?.medium || 'N/A'}</div>
                {(a.institution || a.student?.institution) && <div><strong>Inst:</strong> {a.institution || a.student?.institution}</div>}
              </div>
              {a.receiptUrl && (
                <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${a.receiptUrl}`} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: '16px' }}>
                  <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${a.receiptUrl}`} alt="Receipt" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />
                </a>
              )}
              <div className="row" style={{ gap: '8px' }}>
                <button className="btn btn-ok btn-sm" onClick={() => decide(a.id, 'approved')}>Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => decide(a.id, 'rejected')}>Deny</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass card-pad center" style={{ padding: '60px' }}>
          <h3><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Check%20Mark%20Button.webp" alt="Check Mark Button" width="30" height="30" style={{ verticalAlign: 'middle', marginRight: '8px' }} />All caught up</h3>
          <p className="muted mt8">No pending approvals. New requests will appear here.</p>
        </div>
      )}
    </div>
  );
}
