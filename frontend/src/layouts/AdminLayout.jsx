import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="lms-shell" style={{ position: 'relative', zIndex: 1 }}>
      <div className={`side-backdrop ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`glass side ${isSidebarOpen ? 'open' : ''}`}>
        <div className="side-brand">
          <span className="dot" style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'linear-gradient(135deg,#e2607a,#c14d7c)', boxShadow: '0 4px 10px rgba(200,80,100,.4)' }}></span>
          Admin Panel
        </div>
        <nav className="side-nav">
          <NavLink to="/admin/approvals" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Check%20Mark%20Button.webp" alt="Check Mark Button" width="40" height="40" /></span> Approvals
          </NavLink>
          <NavLink to="/admin/content" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Clapper%20Board.webp" alt="Clapper Board" width="40" height="40" /></span> Content
          </NavLink>
          <NavLink to="/admin/limits" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Locked%20With%20Key.webp" alt="Locked With Key" width="40" height="40" /></span> View Limits
          </NavLink>
          <NavLink to="/admin/users" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/People/Busts%20In%20Silhouette.webp" alt="Busts In Silhouette" width="40" height="40" /></span> Users
          </NavLink>
          <NavLink to="/admin/ai" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Robot.webp" alt="Robot" width="40" height="40" /></span> AI Sources
          </NavLink>
          <NavLink to="/admin/reports" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Bar%20Chart.webp" alt="Bar Chart" width="40" height="40" /></span> Reports
          </NavLink>
          <NavLink to="/admin/cms" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/People/Writing%20Hand.webp" alt="Writing Hand" width="40" height="40" /></span> Blog CMS
          </NavLink>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(120,130,170,.12)' }}>
          <a className="logout-btn" onClick={handleLogout}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/People/Backhand%20Index%20Pointing%20Left.webp" alt="Backhand Index Pointing Left" width="40" height="40" /></span> Log out
          </a>
        </div>
      </aside>

      <div className="lms-content">
        <div className="topbar glass" style={{ borderRadius: 'var(--r-card)', padding: '14px 20px' }}>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <h2 style={{ flex: 1 }}>Admin</h2>
          <div className="avatar" style={{ background: 'linear-gradient(135deg,#e2607a,#c14d7c)' }}>{user?.name?.charAt(0) || 'A'}</div>

        </div>
        <main style={{ marginTop: '20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
