import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../data/mockDB';
import { FeatureCarousel } from '../components/FeatureCarousel';
import { InteractiveAccordion } from '../components/ui/InteractiveAccordion';

const newFeatureItems = [
  {
    id: 1,
    title: 'The "All-in-One" Student Dashboard1',
    description: 'Experience a premium, app like interface! Browse courses, watch videos, join live classes, and chat with AI without ever leaving the platform..',
    imageUrl: '/images/1.png'
  },
  {
    id: 2,
    title: 'Embedded Live Classrooms',
    description: 'No need to download Zoom! Join high quality, interactive live classes directly from your dashboard with one click..',
    imageUrl: '/images/2.png'
  },
  {
    id: 3,
    title: 'High Security Video Player',
    description: 'Watch lessons safely. Our advanced system blocks video downloads, screen recordings, and account sharing to protect the content.',
    imageUrl: '/images/3.png'
  },
  {
    id: 4,
    title: 'The "Minu AI" Syllabus Tutor',
    description: 'Stuck on a past paper at 2 AM? Get instant, accurate answers from our AI tutor, strictly trained on the Grade 10 & 11 ICT syllabus.e.',
    imageUrl: '/images/4.png'
  },
  {
    id: 5,
    title: 'Easy Enrollment',
    description: 'Simply choose your class, upload your bank deposit slip, and get instant access to your lessons as soon as the admin approves!.',
    imageUrl: '/images/5.png'
  }
];

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = () => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    const q = query.toLowerCase();
    const results = DB.modules.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.subj.toLowerCase().includes(q)
    );
    setSearchResults(results);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ModuleCard = ({ m, action = 'Enter LMS' }) => (
    <div className="glass card-pad fade-up">
      <div className="thumb" style={{ background: m.grad }}></div>
      <div className="row wrap-flex mb8" style={{ gap: '6px' }}>
        <span className="chip chip-blue">Grade {m.grade}</span>
        <span className="chip">{m.subj}</span>
      </div>
      <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>{m.title}</h3>
      <p className="tiny muted mb16">{m.dur} · {m.inst}</p>
      <div className="row between">
        <span className="price">Rs {m.price.toLocaleString()}</span>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/lms')}>{action}</button>
      </div>
    </div>
  );

  return (
    <div className="wrap">
      <section className="hero">
        <div className="fade-up">
          <span className="eyebrow">ICT WITH MINU · Grade 10–11</span>
          <h1 className="mt8">Master ICT.<br />Learn the Apple way  calm, clear, beautiful.</h1>
          <p className="lead">Recorded modules, live classes, smart quizzes and an AI tutor restricted to your official syllabus. Built for Sri Lankan students, secured for minors.</p>
          <div className="cta-row" style={{ marginTop: '32px' }}>
            <button className="btn btn-primary" onClick={() => navigate('/lms')}>Start Learning</button>
            <button className="btn btn-glass" onClick={() => navigate('/blog')}>Read the blog</button>
          </div>
          <div className="stat-row">
            <div className="stat"><b>1,000+</b><span>Students</span></div>
            <div className="stat"><b>6</b><span>Core modules</span></div>
            <div className="stat"><b>PDPA</b><span>Compliant</span></div>
          </div>
        </div>
        <div className="fade-up" style={{ width: '100%', overflow: 'hidden' }}>
          <InteractiveAccordion />
        </div>
      </section>

      <section className="section-sm">
        <div className="center mb24">
          <span className="eyebrow">How it works</span>
          <h2 className="mt8">Three steps to results</h2>
        </div>
        <div className="grid g3">
          <div className="glass feat fade-up">
            <div className="ico gc-lav">📚</div>
            <h3>Buy a module</h3>
            <p>Browse the catalog, purchase per module or subscribe for live classes. Access unlocks after admin approval.</p>
          </div>
          <div className="glass feat fade-up">
            <div className="ico gc-mint">🎥</div>
            <h3>Watch & attend</h3>
            <p>Stream protected recordings with view limits, join live sessions, and track every minute of progress.</p>
          </div>
          <div className="glass feat fade-up">
            <div className="ico gc-rose">🤖</div>
            <h3>Quiz & ask AI</h3>
            <p>Take auto graded quizzes from past papers and ask the AI tutor  answered only from official sources, with citations.</p>
          </div>
        </div>
      </section>

      <section className="section-sm fade-up" style={{ width: '100%', overflow: 'hidden' }}>
        <InteractiveAccordion items={newFeatureItems} />
      </section>

      <section className="section-sm">
        <div className="center mb24">
          <h2 className="mt8">Experience the ICT Mela</h2>
          <p className="lead muted" style={{ maxWidth: '600px', margin: '0 auto' }}>Join Minuri Alaharuwan for an immersive seminar experience.</p>
        </div>
        <div className="fade-up" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
          <img src="/images/mela-banner.png" alt="ICT Mela Banner" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </section>

      <section className="section-sm">
        <div className="glass card-pad fade-up" style={{ padding: '46px', textAlign: 'center', background: 'var(--glass-strong)' }}>
          <span style={{ fontSize: '40px' }}>"</span>
          <p className="quote" style={{ maxWidth: '640px', margin: '0 auto' }}>The recordings and AI tutor made revision so much easier. I finally understand subnetting  and my mock marks jumped.</p>
          <div className="row mt24" style={{ justifyContent: 'center', gap: '12px' }}>
            <div className="avatar">N</div>
            <div style={{ textAlign: 'left' }}>
              <b>Nethmi S.</b>
              <div className="tiny muted">Grade 11 student</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="glass card-pad fade-up" style={{ padding: '46px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap', background: 'var(--grad-hero)' }}>
          <div>
            <h2 style={{ color: '#fff' }}>Ready to start?</h2>
            <p style={{ color: 'rgba(255,255,255,.85)', maxWidth: '380px' }}>Create your account, get parental consent, and enter the classroom in minutes.</p>
          </div>
          <button className="btn" style={{ background: '#fff', color: 'var(--blue-d)' }} onClick={() => navigate('/lms')}>Enter the LMS →</button>
        </div>
      </section>
    </div>
  );
}
