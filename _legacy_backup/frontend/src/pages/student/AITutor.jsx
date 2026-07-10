import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export function AITutor() {
  const { user } = useAuth();
  const [chat, setChat] = useState([
    { role: 'a', text: "Hi! I'm your ICT tutor. Ask me anything from your Grade 10–11 syllabus. I only answer from official textbooks and guides.", cite: null }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const askBackend = async (q) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ query: q })
      });
      if (res.ok) {
        const data = await res.json();
        setChat(prev => [...prev, { role: 'a', text: data.text, cite: data.cite }]);
      } else {
        setChat(prev => [...prev, { role: 'a', text: 'Sorry, I am having trouble connecting to the backend right now.' }]);
      }
    } catch (err) {
      setChat(prev => [...prev, { role: 'a', text: 'Network error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = () => {
    const q = input.trim();
    if (!q || loading) return;
    setChat(prev => [...prev, { role: 'u', text: q }]);
    setInput('');
    askBackend(q);
  };

  const quickAsk = (q) => {
    if (loading) return;
    setChat(prev => [...prev, { role: 'u', text: q }]);
    askBackend(q);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  return (
    <div className="glass card-pad" style={{ padding: '24px', maxWidth: '760px' }}>
      <div className="row between mb16">
        <div className="row" style={{ gap: '10px' }}>
          <div className="ico gc-blue" style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#fff' }}><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Robot.webp" alt="Robot" width="25" height="25" /></div>
          <div>
            <b>ICT Tutor</b>
            <div className="tiny muted">Source-restricted · cites textbooks</div>
          </div>
        </div>
        <span className="chip chip-mint">7/10 queries today</span>
      </div>
      
      <div className="chat" style={{ maxHeight: '420px', overflowY: 'auto', padding: '6px' }}>
        {chat.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
            {m.cite && <div className="cite">📑 {m.cite}</div>}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      
      <div className="row mt16" style={{ gap: '10px' }}>
        <input 
          className="input" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="e.g. Explain binary search" 
          onKeyDown={e => e.key === 'Enter' && handleAsk()} 
        />
        <button id="ai-ask-btn" className="btn btn-primary" onClick={handleAsk}>Ask</button>
      </div>
      
      <div className="row wrap-flex mt16" style={{ gap: '8px' }}>
        {['What is an IP address?', 'Explain binary search', 'What is a primary key?', 'Difference: RAM vs ROM'].map(s => (
          <span key={s} className="chip" style={{ cursor: 'pointer' }} onClick={() => quickAsk(s)}>{s}</span>
        ))}
      </div>
    </div>
  );
}
