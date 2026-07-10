import React from 'react';

export function About() {
  return (
    <div className="wrap">
      <section className="section">
        <div className="center" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <span className="eyebrow">About Us</span>
          <h1 className="mt8" style={{ fontSize: 'clamp(34px,4.5vw,52px)' }}>Education that respects students, parents and data.</h1>
          <p className="lead muted" style={{ margin: '20px auto' }}>ICT Academy is an independent online academy delivering structured, exam-aligned ICT teaching to Grade 10–11 students across Sri Lanka.</p>
        </div>
        <div className="grid g3 mt24">
          <div className="glass feat">
            <div className="ico gc-lav">🎯</div>
            <h3>Our mission</h3>
            <p>Make high-quality ICT education affordable and accessible while keeping minors safe online.</p>
          </div>
          <div className="glass feat">
            <div className="ico gc-mint">🧑‍🏫</div>
            <h3>One dedicated teacher</h3>
            <p>Every live class is taught by Minuri Alaharuwan, with consistent pedagogy and personal attention.</p>
          </div>
          <div className="glass feat">
            <div className="ico gc-rose">🔒</div>
            <h3>PDPA by design</h3>
            <p>Parental consent, data minimisation and anonymised analytics are built into every flow.</p>
          </div>
        </div>
        <div className="glass card-pad mt24" style={{ padding: '38px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'center' }}>
          <div className="avatar" style={{ width: '96px', height: '96px', fontSize: '32px', borderRadius: '28px' }}>M</div>
          <div>
            <span className="eyebrow">The instructor</span>
            <h2 className="mt8" style={{ fontSize: '26px' }}>Minuri Alaharuwan</h2>
            <p className="muted mt8">Founder and lead instructor of ICT Academy. Designs the curriculum, streams every live class, and oversees the platform that keeps content protected and learning measurable.</p>
            <div className="row mt16 wrap-flex" style={{ gap: '8px' }}>
              <span className="chip chip-blue">Programming</span>
              <span className="chip chip-mint">Networking</span>
              <span className="chip chip-rose">Databases</span>
              <span className="chip chip-peach">Web</span>
            </div>
          </div>
        </div>
        <div className="glass card-pad mt24" style={{ padding: '34px', background: 'var(--grad-mint)' }}>
          <h3 style={{ color: '#0c4a40' }}>Child-safety commitment</h3>
          <p style={{ color: '#0c4a40', opacity: .85, maxWidth: '680px', marginTop: '8px' }}>We never collect more data than necessary, we require verified parental consent for every minor at registration, and all reporting is anonymised. Single-device login and DRM protect both students and content.</p>
        </div>
      </section>
    </div>
  );
}
