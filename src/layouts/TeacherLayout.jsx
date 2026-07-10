"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function TeacherLayout({ children }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (loading) return;
    if (!user && !window.location.pathname.includes('/auth')) {
      router.push('/');
    } else if (user && user.role !== 'Teacher') {
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
          <span className="dot" style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#f8d49a,#f5c98a)', boxShadow: '0 4px 10px rgba(200,160,80,.4)' }}></span>
          <span style={{ fontSize: '28px' }}>Teacher</span>
        </div>
        <nav className="side-nav">
          <Link href="/teach/stream" onClick={() => setIsSidebarOpen(false)} className={pathname === '/teach/stream' ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Television.webp" alt="Television" width="40" height="40" /></span> Live Stream
          </Link>
          <Link href="/teach/quizzes" onClick={() => setIsSidebarOpen(false)} className={pathname === '/teach/quizzes' ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Hourglass%20Done.webp" alt="Hourglass Done" width="40" height="40" /></span> Quiz Builder
          </Link>
          <Link href="/teach/reports" onClick={() => setIsSidebarOpen(false)} className={pathname === '/teach/reports' ? 'active' : ''}>
            <span className="ico"><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Bar%20Chart.webp" alt="Bar Chart" width="40" height="40" /></span> Reports
          </Link>
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

        </div>
        <main style={{ marginTop: '20px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
