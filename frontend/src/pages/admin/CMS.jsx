import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function CMS() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [uniqueCategories, setUniqueCategories] = useState([]);

  useEffect(() => {
    fetchBlogs();
  }, [user?.token]);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/blogs', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
        // extract unique categories
        const cats = [...new Set(data.map(b => b.category))].filter(Boolean);
        setUniqueCategories(cats.length > 0 ? cats : ['Study Tips', 'Networking', 'Announcements']);
      }
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
  };

  const savePost = async () => {
    if (!title.trim() || !cat.trim() || !body.trim()) {
      alert('Title, Category, and Body are required.');
      return;
    }

    const payload = { title, category: cat, body };
    const url = editingId ? `http://localhost:5000/api/blogs/${editingId}` : 'http://localhost:5000/api/blogs';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchBlogs();
        resetForm();
        alert(editingId ? 'Blog updated successfully!' : "Published! It's now live on the public Blog page.");
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save blog');
      }
    } catch (err) {
      alert('Error saving blog');
    }
  };

  const editPost = (blog) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setCat(blog.category);
    setBody(blog.body);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (res.ok) {
        setBlogs(blogs.filter(b => b.id !== id));
      } else {
        alert('Failed to delete blog');
      }
    } catch (err) {
      alert('Error deleting blog');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCat('');
    setBody('');
  };

  if (loading) return <LoadingSpinner text="Loading blogs..." />;

  return (
    <div className="grid g2">
      <div className="glass card-pad" style={{ padding: '24px' }}>
        <h3 className="mb16">{editingId ? 'Edit blog post' : 'Write a blog post'}</h3>
        <div className="field">
          <label>Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" />
        </div>
        <div className="field">
          <label>Category</label>
          <input 
            className="input"
            list="categories"
            value={cat}
            onChange={e => setCat(e.target.value)}
            placeholder="Select or type a new category"
          />
          <datalist id="categories">
            {uniqueCategories.map((c, i) => <option key={i} value={c} />)}
          </datalist>
        </div>
        <div className="field">
          <label>Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your article…" style={{ minHeight: '150px' }}></textarea>
        </div>
        <div className="row" style={{ gap: '12px' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={savePost}>
            {editingId ? 'Update Post' : 'Publish to public website'}
          </button>
          {editingId && (
            <button className="btn btn-glass" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </div>
      
      <div className="glass card-pad" style={{ padding: '24px' }}>
        <h3 className="mb16">Published posts ({blogs.length})</h3>
        {blogs.map((b) => (
          <div key={b.id} className="row between" style={{ padding: '12px 0', borderBottom: '1px solid rgba(120,130,170,.12)' }}>
            <div>
              <b style={{ fontSize: '14px' }}>{b.title}</b>
              <div className="tiny muted">{b.category} · {b.readTime || '3 min'}</div>
            </div>
            <div className="row" style={{ gap: '8px' }}>
              <button className="btn btn-glass btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => editPost(b)}>Edit</button>
              <button className="btn btn-sm" style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--grad-rose)', color: 'white', border: 'none' }} onClick={() => deletePost(b.id)}>Delete</button>
            </div>
          </div>
        ))}
        {blogs.length === 0 && <p className="muted tiny">No blog posts found.</p>}
        <p className="muted tiny mt16">Posts appear instantly on the public Blog page.</p>
      </div>
    </div>
  );
}
