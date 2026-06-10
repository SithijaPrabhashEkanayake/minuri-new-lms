import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/users`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        console.error('Error fetching users:', data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchUsers();
  }, [user?.token]);

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('Generate a password reset link for this user?')) return;
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/users/${id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Password reset link generated:\n\n${data.link}\n\nPlease copy and share this link with the user.`);
      } else {
        alert(data.message || 'Failed to generate link');
      }
    } catch (err) {
      alert('Error generating reset link');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <LoadingSpinner text="Loading users..." />;

  return (
    <div className="glass card-pad" style={{ padding: '24px' }}>
      <div className="row between mb16">
        <h3>All users ({filteredUsers.length})</h3>
        <input 
          className="input" 
          style={{ maxWidth: '240px' }} 
          placeholder="Search users…" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Grade</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td><b>{u.name}</b></td>
              <td className="tiny">{u.email}</td>
              <td>{u.grade || '-'}</td>
              <td><span className={`chip ${u.role?.name === 'Teacher' ? 'chip-peach' : 'chip-blue'}`}>{u.role?.name || 'Unknown'}</span></td>
              <td><span className={`chip ${u.status === 'active' ? 'chip-mint' : 'chip-warn'}`}>{u.status}</span></td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-glass btn-sm" 
                    onClick={() => handleStatusToggle(u.id, u.status)}
                  >
                    {u.status === 'locked' ? 'Unlock' : 'Lock'}
                  </button>
                  <button 
                    className="btn btn-glass btn-sm" 
                    onClick={() => handleResetPassword(u.id)}
                  >
                    Reset
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center muted p24">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
