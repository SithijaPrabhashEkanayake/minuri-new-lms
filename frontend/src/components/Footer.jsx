import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="footer wrap">
      <div className="glass card-pad" style={{ padding: '34px' }}>
        <div className="footer-grid">
          <div>
            <div className="brand mb16"><span className="dot"></span>ICT Academy</div>
            <p className="muted" style={{ fontSize: '14px', maxWidth: '300px' }}>
              Curriculum-aligned ICT education for Grade 10–11 students in Sri Lanka. Secure, affordable, PDPA-compliant.
            </p>
          </div>
          <div>
            <b style={{ fontSize: '13px' }}>Platform</b>
            <Link to="/lms">Enter LMS</Link>
            <Link to="/">Modules</Link>
            <Link to="/">Live Classes</Link>
          </div>
          <div>
            <b style={{ fontSize: '13px' }}>Company</b>
            <Link to="/about">About Us</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <b style={{ fontSize: '13px' }}>Legal</b>
            <a href="#">PDPA & Privacy</a>
            <a href="#">Parental Consent</a>
            <a href="#">Terms</a>
          </div>
        </div>
        <p className="muted tiny mt24" style={{ borderTop: '1px solid rgba(120,130,170,.15)', paddingTop: '18px' }}>
          © 2026 ICT Academy · Built by Minuri Alaharuwan · Liquid Glass theme
        </p>
      </div>
    </footer>
  );
}
