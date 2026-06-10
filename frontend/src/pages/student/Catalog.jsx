import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function Catalog() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/modules`) // Assuming this gets all published modules
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setModules(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const [selectedModule, setSelectedModule] = useState(null);
  const [enrollForm, setEnrollForm] = useState({
    paymentRef: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);

  const handleEnrollClick = (mod) => {
    setSelectedModule(mod);
    setEnrollForm({ paymentRef: '' });
  };

  const submitEnrollment = async () => {
    if (!receiptFile) {
      return alert('Please upload a receipt photo.');
    }

    const formData = new FormData();
    formData.append('moduleId', selectedModule.id);
    formData.append('paymentRef', enrollForm.paymentRef);
    formData.append('receipt', receiptFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/enrollments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Enrollment request submitted successfully! Please wait for admin approval.");
        setSelectedModule(null);
        setReceiptFile(null);
      } else {
        alert(data.message || "Failed to submit request");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  };

  if (loading) return <LoadingSpinner text="Loading catalog..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Module Catalog</h2>
          <p className="muted">Discover and enroll in new ICT modules.</p>
        </div>
      </div>
      
      {modules.length === 0 ? (
        <div className="center p24 muted">
          No modules available for your grade at the moment.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
          {modules.map(mod => (
            <GlassCard key={mod.id} style={{ padding: 0 }}>
              <div style={{ height: '140px', background: 'var(--grad-mint)' }}></div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="caption">Grade {mod.grade}</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink-900)' }}>LKR {mod.price}</span>
                </div>
                <h3 style={{ marginBottom: '24px' }}>{mod.title}</h3>
                <Button variant="primary" style={{ width: '100%' }} onClick={() => handleEnrollClick(mod)}>
                  Enroll Now
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {selectedModule && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <GlassCard style={{ width: '400px', maxWidth: '90%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>Enroll in {selectedModule.title}</h3>

            <div className="field">
              <label>Payment Reference (Optional)</label>
              <input className="input" type="text" placeholder="Slip number or note" value={enrollForm.paymentRef} onChange={e => setEnrollForm({...enrollForm, paymentRef: e.target.value})} />
            </div>

            <div className="field">
              <label>Upload Receipt Photo *</label>
              <input type="file" accept="image/*" className="input" style={{ padding: '8px' }} onChange={e => setReceiptFile(e.target.files[0])} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Button variant="outline" style={{ flex: 1 }} onClick={() => setSelectedModule(null)}>Cancel</Button>
              <Button variant="primary" style={{ flex: 1 }} onClick={submitEnrollment}>Submit Request</Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
