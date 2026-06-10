import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout() {
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
          <span className="dot" style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--grad-hero)', boxShadow: '0 4px 10px rgba(120,100,200,.4)' }}></span>
          ICT WITH MINU
        </div>
        <nav className="side-nav">
          <NavLink to="/app/catalog" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Key.webp" alt="Key" width="40" height="40" /></span> Course Catalog
          </NavLink>
          <NavLink to="/app/library" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Books.webp" alt="Books" width="40" height="40" /></span> My Library
          </NavLink>
          <NavLink to="/app/live" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Television.webp" alt="Television" width="40" height="40" /></span> Live Classes
          </NavLink>
          <NavLink to="/app/quizzes" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Hourglass%20Not%20Done.webp" alt="Hourglass Not Done" width="40" height="40" /></span> Quizzes
          </NavLink>
          <NavLink to="/app/progress" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Bar%20Chart.webp" alt="Bar Chart" width="40" height="40" /></span> Progress
          </NavLink>
          <NavLink to="/app/ai" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Robot.webp" alt="Robot" width="40" height="40" /></span> AI Tutor
          </NavLink>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(120,130,170,.12)' }}>
          <a className="logout-btn" onClick={handleLogout}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/People/Waving%20Hand.webp" alt="Waving Hand" width="40" height="40" /></span> Log out
          </a>
        </div>
      </aside>

      <div>
        <div className="topbar glass" style={{ borderRadius: 'var(--r-card)', padding: '14px 20px' }}>
          <h2 style={{ flex: 1 }}>Dashboard</h2>
          <div className="bell"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Megaphone.webp" alt="Megaphone" width="25" height="25" /></div>
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>{user?.name || 'Student'}</span>
        </div>
        <main style={{ marginTop: '20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
