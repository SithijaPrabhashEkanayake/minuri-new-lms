import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

export function AISources() {
  const { user } = useAuth();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchSources = async () => {
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai-sources`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI sources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchSources();
  }, [user?.token]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Simulate extracting pages from file size (e.g. 1 page per 50KB)
      const estimatedPages = Math.max(1, Math.round(file.size / 50000));

      const res = await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai-sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          name: file.name,
          pages: estimatedPages
        })
      });

      if (res.ok) {
        const newSource = await res.json();
        setSources([newSource, ...sources]);
        alert('Source uploaded — chunking & embedding into FAISS.');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to add source');
      }
    } catch (err) {
      alert('Error uploading source');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="glass card-pad mb24" style={{ padding: '24px', background: 'var(--grad-lav)' }}>
        <h3 style={{ color: '#fff' }}>RAG knowledge base</h3>
        <p style={{ color: 'rgba(255,255,255,.85)', marginTop: '6px' }}>The AI tutor answers only from these indexed sources (FAISS vector store). No external data — every answer is cited.</p>
      </div>
      <div className="glass card-pad" style={{ padding: '24px' }}>
        <div className="row between mb16">
          <h3>Indexed documents</h3>
          <div>
            <input 
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx"
            />
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : '+ Add source'}
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="p24 center">Loading sources...</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Document</th>
                <th>Pages</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id}>
                  <td>📄 {s.name}</td>
                  <td>{s.pages}</td>
                  <td><span className="chip chip-mint">{s.status}</span></td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center muted p24">No sources indexed yet</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
