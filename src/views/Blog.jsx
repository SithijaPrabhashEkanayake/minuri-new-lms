import React, { useState, useEffect } from 'react';

export function Blog() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`/api/blogs`);
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="wrap">
      {selectedArticle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setSelectedArticle(null)}>
          <div className="glass card-pad fade-up" style={{
            maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', position: 'relative',
            background: 'var(--bg)', borderRadius: '16px'
          }} onClick={e => e.stopPropagation()}>
            <button className="btn btn-glass btn-sm" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, padding: '4px 12px' }} onClick={() => setSelectedArticle(null)}>✕</button>
            <div className="thumb" style={{ background: selectedArticle.grad, marginBottom: '20px', height: '160px', borderRadius: '12px' }}></div>
            <span className="chip chip-rose mb8">{selectedArticle.category}</span>
            <h2 className="mt8 mb16">{selectedArticle.title}</h2>
            <div className="mb24" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>
              {selectedArticle.body}
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedArticle(null)}>Close Article</button>
          </div>
        </div>
      )}
      <section className="section">
        <div className="center mb24">
          <span className="eyebrow">Blog</span>
          <h1 className="mt8" style={{ fontSize: 'clamp(34px,4.5vw,50px)' }}>ICT learning, exam tips & news</h1>
        </div>
        {loading ? (
          <div className="p24 center">Loading latest news...</div>
        ) : (
          <div className="grid g3">
            {blogs.length === 0 ? (
              <div className="p24 center muted">No blog posts available.</div>
            ) : (
              blogs.map(b => (
                <div key={b.id || b.slug} className="glass card-pad fade-up">
                  <div className="thumb" style={{ background: b.grad }}></div>
                  <span className="chip chip-rose mb8">{b.category}</span>
                  <h3 style={{ fontSize: '18px', margin: '8px 0' }}>{b.title}</h3>
                  <p className="tiny muted mb16">{b.readTime || '3 min'} read</p>
                  <button className="btn btn-glass btn-sm" onClick={() => setSelectedArticle(b)}>Read article →</button>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
