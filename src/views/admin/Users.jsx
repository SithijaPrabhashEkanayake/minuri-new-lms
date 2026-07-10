import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Staff Modal State
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('Teacher');
  const [staffCreating, setStaffCreating] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/users`, {
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
      const res = await fetch(`/api/users/${id}/status`, {
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
      const res = await fetch(`/api/users/${id}/reset-password`, {
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

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) {
      alert('Please fill in all fields.');
      return;
    }
    if (staffPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setStaffCreating(true);
    try {
      const res = await fetch('/api/auth/register-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          name: staffName,
          email: staffEmail,
          password: staffPassword,
          role: staffRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.role} account for "${data.name}" created successfully!`);
        setShowAddStaff(false);
        setStaffName('');
        setStaffEmail('');
        setStaffPassword('');
        setStaffRole('Teacher');
        setShowStaffPassword(false);
        fetchUsers();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      alert('Error creating staff account. Please try again.');
    } finally {
      setStaffCreating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const staffUsers = filteredUsers.filter(u => u.role?.name === 'Admin' || u.role?.name === 'Teacher');
  const studentUsers = filteredUsers.filter(u => u.role?.name === 'Student');

  const renderUserTable = (usersList) => (
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
        {usersList.map((u) => (
          <tr key={u.id}>
            <td><b>{u.name}</b></td>
            <td className="tiny">{u.email}</td>
            <td>{u.grade || '-'}</td>
            <td><span className={`chip ${u.role?.name === 'Teacher' ? 'chip-peach' : u.role?.name === 'Admin' ? 'chip-blue' : 'chip-blue'}`}>{u.role?.name || 'Unknown'}</span></td>
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
        {usersList.length === 0 && (
          <tr>
            <td colSpan="6" className="text-center muted p24">No users found</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  if (loading) return <LoadingSpinner text="Loading users..." />;

  return (
    <>
      {/* Add Staff Modal */}
      {showAddStaff && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowAddStaff(false)}
        >
          <div
            className="glass"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '4px' }}>➕ Add Staff Member</h3>
            <p className="tiny muted" style={{ marginBottom: '20px' }}>
              Create a new Teacher or Admin account. They can log in immediately after creation.
            </p>

            <form onSubmit={handleCreateStaff}>
              <div className="field">
                <label>Full Name</label>
                <input
                  className="input"
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  placeholder="e.g. Kamal Perera"
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  value={staffEmail}
                  onChange={e => setStaffEmail(e.target.value)}
                  placeholder="staff@ictacademy.lk"
                />
              </div>
              <div className="field">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showStaffPassword ? 'text' : 'password'}
                    value={staffPassword}
                    onChange={e => setStaffPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: 'var(--ink-500)',
                      padding: 0
                    }}
                    title={showStaffPassword ? "Hide password" : "Show password"}
                  >
                    {showStaffPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="field">
                <label>Role</label>
                <select
                  className="input"
                  value={staffRole}
                  onChange={e => setStaffRole(e.target.value)}
                >
                  <option value="Teacher">🧑‍🏫 Teacher</option>
                  <option value="Admin">🛡️ Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-glass"
                  style={{ flex: 1 }}
                  onClick={() => setShowAddStaff(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={staffCreating}
                >
                  {staffCreating ? '⏳ Creating…' : '✅ Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass card-pad" style={{ padding: '24px', marginBottom: '24px' }}>
        <div className="row between mb16">
          <h3>Staff Users ({staffUsers.length})</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              className="input" 
              style={{ maxWidth: '240px' }} 
              placeholder="Search users…" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddStaff(true)}
              style={{ whiteSpace: 'nowrap' }}
            >
              ➕ Add Staff
            </button>
          </div>
        </div>
        {renderUserTable(staffUsers)}
      </div>

      <div className="glass card-pad" style={{ padding: '24px' }}>
        <div className="row between mb16">
          <h3>Students ({studentUsers.length})</h3>
        </div>
        {renderUserTable(studentUsers)}
      </div>
    </>
  );
}
