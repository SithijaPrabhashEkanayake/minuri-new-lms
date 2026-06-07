import React from 'react';

export function Contact() {
  return (
    <div className="wrap">
      <section className="section">
        <div className="center mb24">
          <span className="eyebrow">Contact</span>
          <h1 className="mt8" style={{ fontSize: 'clamp(34px,4.5vw,50px)' }}>Talk to us</h1>
        </div>
        <div className="grid g2">
          <div className="glass card-pad" style={{ padding: '34px' }}>
            <h3 className="mb16">Send a message</h3>
            <div className="field">
              <label>Full name</label>
              <input className="input" placeholder="Your name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" placeholder="you@example.lk" />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea placeholder="How can we help?"></textarea>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => alert("Message sent! We'll reply within 24h.")}>Send message</button>
          </div>
          <div>
            <div className="glass card-pad mb16" style={{ padding: '28px' }}>
              <h3 className="mb16">Reach us directly</h3>
              <div className="row mb16" style={{ gap: '14px' }}>
                <div className="ico gc-blue" style={{ width: '42px', height: '42px', borderRadius: '13px', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '18px' }}>✉️</div>
                <div><b>Email</b><div className="tiny muted">hello@ictacademy.lk</div></div>
              </div>
              <div className="row mb16" style={{ gap: '14px' }}>
                <div className="ico gc-mint" style={{ width: '42px', height: '42px', borderRadius: '13px', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '18px' }}>💬</div>
                <div><b>WhatsApp</b><div className="tiny muted">+94 7X XXX XXXX</div></div>
              </div>
              <div className="row" style={{ gap: '14px' }}>
                <div className="ico gc-rose" style={{ width: '42px', height: '42px', borderRadius: '13px', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '18px' }}>🕐</div>
                <div><b>Support hours</b><div className="tiny muted">Mon–Sat · 9 AM – 7 PM</div></div>
              </div>
            </div>
            <div className="glass card-pad" style={{ padding: '28px', background: 'var(--grad-lav)' }}>
              <h3 style={{ color: '#fff' }}>For parents</h3>
              <p style={{ color: 'rgba(255,255,255,.88)', marginTop: '8px' }}>Questions about consent, safety or your child's progress? We're happy to walk you through how the platform protects minors.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
