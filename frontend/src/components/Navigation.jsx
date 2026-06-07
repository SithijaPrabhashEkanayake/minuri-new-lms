import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export function Navigation() {
  return (
    <nav className="nav">
      <Link to="/" className="brand" style={{ cursor: 'pointer', textDecoration: 'none' }}>
        <span className="dot"></span>ICT Academy
      </Link>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About Us</NavLink>
        <NavLink to="/blog" className={({ isActive }) => isActive ? 'active' : ''}>Blog</NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
      </div>
      <Link to="/lms" className="nav-cta" style={{ textDecoration: 'none' }}>
        <button className="btn btn-hero">Enter LMS</button>
      </Link>
      <button className="menu-btn">☰</button>
    </nav>
  );
}
