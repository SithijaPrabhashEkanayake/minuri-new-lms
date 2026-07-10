"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="nav">
      <Link href="/" className="brand" style={{ cursor: 'pointer', textDecoration: 'none' }}>
        <span className="dot"></span>ICT WITH MINU
      </Link>
      <div className="nav-links">
        <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
        <Link href="/about" className={pathname === '/about' ? 'active' : ''}>About Us</Link>
        <Link href="/blog" className={pathname === '/blog' ? 'active' : ''}>Blog</Link>
        <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>Contact</Link>
      </div>
      <Link href="/lms" className="nav-cta" style={{ textDecoration: 'none' }}>
        <button className="btn btn-hero">Enter LMS</button>
      </Link>
      <button className="menu-btn">☰</button>
    </nav>
  );
}
