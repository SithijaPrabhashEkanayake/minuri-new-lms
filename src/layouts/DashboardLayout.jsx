"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (loading) return;
    if (!user && !window.location.pathname.includes('/auth')) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="lms-shell" style={{ position: 'relative', zIndex: 1 }}>
      <div className={`side-backdrop ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`glass side ${isSidebarOpen ? 'open' : ''}`}>
        <div className="side-brand">
          <span className="dot" style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--grad-hero)', boxShadow: '0 4px 10px rgba(120,100,200,.4)' }}></span>
          ICT WITH MINU
        </div>
        <nav className="side-nav">
          <Link href="/app/catalog" onClick={() => setIsSidebarOpen(false)} className={pathname === '/app/catalog' ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Key.webp" alt="Key" width="40" height="40" /></span> Course Catalog
          </Link>
          <Link href="/app/library" onClick={() => setIsSidebarOpen(false)} className={pathname === '/app/library' ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Books.webp" alt="Books" width="40" height="40" /></span> My Library
          </Link>
          <Link href="/app/live" onClick={() => setIsSidebarOpen(false)} className={pathname === '/app/live' ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Television.webp" alt="Television" width="40" height="40" /></span> Live Classes
          </Link>
          <Link href="/app/quizzes" onClick={() => setIsSidebarOpen(false)} className={pathname === '/app/quizzes' ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Hourglass%20Not%20Done.webp" alt="Hourglass Not Done" width="40" height="40" /></span> Quizzes
          </Link>
          <Link href="/app/progress" onClick={() => setIsSidebarOpen(false)} className={pathname === '/app/progress' ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Bar%20Chart.webp" alt="Bar Chart" width="40" height="40" /></span> Progress
          </Link>
          <Link href="/app/ai" onClick={() => setIsSidebarOpen(false)} className={pathname === '/app/ai' ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Robot.webp" alt="Robot" width="40" height="40" /></span> AI Tutor
          </Link>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(120,130,170,.12)' }}>
          <a className="logout-btn" onClick={handleLogout}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/People/Waving%20Hand.webp" alt="Waving Hand" width="40" height="40" /></span> Log out
          </a>
        </div>
      </aside>

      <div className="lms-content">
        <div className="topbar glass" style={{ borderRadius: 'var(--r-card)', padding: '14px 20px' }}>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <h2 style={{ flex: 1 }}>Dashboard</h2>
          <div className="bell"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Megaphone.webp" alt="Megaphone" width="25" height="25" /></div>
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>

        </div>
        <main style={{ marginTop: '20px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
