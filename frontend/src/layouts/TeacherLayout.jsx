import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function TeacherLayout() {
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
          <span className="dot" style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#f8d49a,#f5c98a)', boxShadow: '0 4px 10px rgba(200,160,80,.4)' }}></span>
          <span style={{ fontSize: '28px' }}>Teacher</span>
        </div>
        <nav className="side-nav">
          <NavLink to="/teach/stream" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Television.webp" alt="Television" width="40" height="40" /></span> Live Stream
          </NavLink>
          <NavLink to="/teach/quizzes" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Hourglass%20Done.webp" alt="Hourglass Done" width="40" height="40" /></span> Quiz Builder
          </NavLink>
          <NavLink to="/teach/reports" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Bar%20Chart.webp" alt="Bar Chart" width="40" height="40" /></span> Reports
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
          <h2 style={{ flex: 1 }}>Teacher</h2>
          <div className="avatar" style={{ background: 'linear-gradient(135deg,#f8d49a,#f5c98a)' }}>{user?.name?.charAt(0) || 'T'}</div>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>{user?.name || 'Teacher'}</span>
        </div>
        <main style={{ marginTop: '20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
