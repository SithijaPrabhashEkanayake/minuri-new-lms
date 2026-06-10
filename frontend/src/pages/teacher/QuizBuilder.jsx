import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export function QuizBuilder() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [modules, setModules] = useState([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState('15');
  const [moduleId, setModuleId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  
  // Manual question state
  const [qText, setQText] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correct, setCorrect] = useState('1');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modRes, quizRes] = await Promise.all([
        fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/modules`),
        fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/quizzes`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        })
      ]);
      if (modRes.ok) setModules(await modRes.json());
      if (quizRes.ok) setQuizzes(await quizRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddManualQuestion = () => {
    if (!qText || !opt1 || !opt2) return alert('Question text and at least 2 options are required');
    const options = [opt1, opt2, opt3, opt4].filter(Boolean);
    const newQ = {
      text: qText,
      options,
      correctAnswer: options[parseInt(correct) - 1]
    };
    if (!newQ.correctAnswer) return alert('Invalid correct answer selection');
    
    setQuestions([...questions, newQ]);
    // Reset manual form
    setQText('');
    setOpt1(''); setOpt2(''); setOpt3(''); setOpt4('');
    setCorrect('1');
  };

  const handleCsvImport = () => {
    if (!csvFile) return alert('Please select a CSV file first');
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const parsedQuestions = [];
      
      // Assume format: Question, Opt1, Opt2, Opt3, Opt4, CorrectAnswer
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Basic CSV parsing (doesn't handle quotes well, but sufficient for simple MVP)
        const cols = line.split(',').map(c => c.trim());
        if (cols.length >= 3) {
          const qText = cols[0];
          const correctAnswer = cols[cols.length - 1];
          const options = cols.slice(1, cols.length - 1).filter(Boolean);
          parsedQuestions.push({
            text: qText,
            options,
            correctAnswer
          });
        }
      }
      if (parsedQuestions.length > 0) {
        setQuestions([...questions, ...parsedQuestions]);
        alert(`Imported ${parsedQuestions.length} questions!`);
        setCsvFile(null);
      } else {
        alert('Could not parse any questions from CSV.');
      }
    };
    reader.readAsText(csvFile);
  };

  const handleCreateQuiz = async () => {
    if (!title) return setError('Quiz Title is required');
    if (questions.length === 0) return setError('Please add at least one question');
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          title,
          timeLimit,
          moduleId: moduleId || null,
          questions
        })
      });
      
      if (res.ok) {
        setTitle('');
        setQuestions([]);
        fetchData();
        alert('Quiz created successfully!');
      } else {
        const data = await res.json();
        setError(data.message || 'Error creating quiz');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/quizzes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid g2" style={{ alignItems: 'start' }}>
      <div className="glass card-pad" style={{ padding: '24px' }}>
        <h3 className="mb16">Create a Quiz</h3>
        {error && <div className="mb16" style={{ color: 'var(--danger)', fontSize: '13px' }}>⚠ {error}</div>}
        
        <div className="field">
          <label>Quiz Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. End of chapter 1 test" />
        </div>
        <div className="grid g2" style={{ gap: '16px' }}>
          <div className="field">
            <label>Time limit (mins)</label>
            <select className="input" value={timeLimit} onChange={e => setTimeLimit(e.target.value)}>
              <option value="10">10 mins</option>
              <option value="15">15 mins</option>
              <option value="30">30 mins</option>
              <option value="45">45 mins</option>
              <option value="60">60 mins</option>
            </select>
          </div>
          <div className="field">
            <label>Target Module (Optional)</label>
            <select className="input" value={moduleId} onChange={e => setModuleId(e.target.value)}>
              <option value="">-- None --</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '24px 0' }} />
        
        <h4 className="mb16">Questions ({questions.length})</h4>
        {questions.length > 0 && (
          <div className="mb16" style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
            {questions.map((q, idx) => (
              <div key={idx} style={{ fontSize: '13px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <strong>{idx+1}. {q.text}</strong><br/>
                <span style={{ color: 'var(--success)' }}>Ans: {q.correctAnswer}</span>
                <button className="btn btn-glass btn-sm ml8" style={{ padding: '2px 6px', fontSize: '11px' }} onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}>Remove</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex-col" style={{ gap: '16px' }}>
          {/* Manual Entry */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h5 className="mb16">Add Manually</h5>
            <div className="field">
              <textarea 
                className="input" 
                value={qText} 
                onChange={e => setQText(e.target.value)} 
                placeholder="Question text" 
                rows={2}
                style={{ resize: 'none', overflow: 'hidden' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
            </div>
            <div className="grid g2" style={{ gap: '8px' }}>
              <input className="input" value={opt1} onChange={e => setOpt1(e.target.value)} placeholder="Option 1" />
              <input className="input" value={opt2} onChange={e => setOpt2(e.target.value)} placeholder="Option 2" />
              <input className="input" value={opt3} onChange={e => setOpt3(e.target.value)} placeholder="Option 3 (opt)" />
              <input className="input" value={opt4} onChange={e => setOpt4(e.target.value)} placeholder="Option 4 (opt)" />
            </div>
            <div className="field mt8">
              <label style={{ fontSize: '11px' }}>Correct Option (1-4)</label>
              <select className="input" value={correct} onChange={e => setCorrect(e.target.value)}>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
                <option value="4">Option 4</option>
              </select>
            </div>
            <button className="btn btn-glass btn-block mt8" onClick={handleAddManualQuestion}>+ Add to Quiz</button>
          </div>

          {/* CSV Entry */}
          <div style={{ background: 'rgba(255,170,80,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,170,80,0.2)' }}>
            <h5 className="mb16" style={{ color: 'var(--peach)' }}>Import CSV</h5>
            <p className="tiny muted mb16">Format: Question, Opt1, Opt2, Opt3, Opt4, CorrectAnswer</p>
            <input type="file" accept=".csv" className="mb16" style={{ fontSize: '12px' }} onChange={e => setCsvFile(e.target.files[0])} />
            <button className="btn btn-peach btn-block" onClick={handleCsvImport}>Upload & Parse CSV</button>
          </div>
        </div>

        <button className="btn btn-primary btn-block mt24" onClick={handleCreateQuiz} disabled={loading || questions.length === 0}>
          {loading ? 'Saving...' : 'Save & Publish Quiz'}
        </button>
      </div>

      <div>
        <div className="glass card-pad mb16" style={{ padding: '24px' }}>
          <h3 className="mb16">Existing Quizzes</h3>
          {quizzes.length === 0 ? (
            <p className="tiny muted">No quizzes created yet.</p>
          ) : (
            <div className="flex-col" style={{ gap: '12px' }}>
              {quizzes.map(q => (
                <div key={q.id} className="p16" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '15px' }}>{q.title}</h4>
                    <p className="tiny muted mt4">
                      {q.timeLimit} mins • {q._count?.questions || 0} questions
                      {q.module && ` • Module: ${q.module.title}`}
                    </p>
                  </div>
                  <button className="btn btn-glass btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteQuiz(q.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
