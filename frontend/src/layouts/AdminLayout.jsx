import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="lms-shell" style={{ position: 'relative', zIndex: 1 }}>
      <aside className="glass side">
        <div className="side-brand">
          <span className="dot" style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'linear-gradient(135deg,#e2607a,#c14d7c)', boxShadow: '0 4px 10px rgba(200,80,100,.4)' }}></span>
          Admin Panel
        </div>
        <nav className="side-nav">
          <NavLink to="/admin/approvals" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico">✅</span> Approvals
          </NavLink>
          <NavLink to="/admin/content" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico">🎬</span> Content
          </NavLink>
          <NavLink to="/admin/limits" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico">🔒</span> View Limits
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico">👥</span> Users
          </NavLink>
          <NavLink to="/admin/ai" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico">🤖</span> AI Sources
          </NavLink>
          <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico">📊</span> Reports
          </NavLink>
          <NavLink to="/admin/cms" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico">✍️</span> Blog CMS
          </NavLink>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(120,130,170,.12)' }}>
          <a style={{ cursor: 'pointer' }} onClick={handleLogout}>
            <span className="ico">🚪</span> Log out
          </a>
        </div>
      </aside>

      <div>
        <div className="topbar glass" style={{ borderRadius: 'var(--r-card)', padding: '14px 20px' }}>
          <h2 style={{ flex: 1 }}>Admin</h2>
          <div className="avatar" style={{ background: 'linear-gradient(135deg,#e2607a,#c14d7c)' }}>{user?.name?.charAt(0) || 'A'}</div>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>{user?.name || 'Admin'}</span>
        </div>
        <main style={{ marginTop: '20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
