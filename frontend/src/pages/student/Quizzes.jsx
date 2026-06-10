import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function Quizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/quizzes`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch (err) {
      console.error('Failed to load quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuiz = async (quizId) => {
    setLoading(true);
    try {
      const res = await fetch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const quiz = await res.json();
        setSelectedQuiz(quiz);
        setAnswers({});
        setSubmitted(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pickAns = (qIndex, option) => {
    if (!submitted) {
      setAnswers(prev => ({ ...prev, [qIndex]: option }));
    }
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < selectedQuiz.questions.length) {
      alert('Please answer all questions first.');
      return;
    }
    setSubmitted(true);
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
  };

  if (loading) return <LoadingSpinner text="Loading quizzes..." />;

  if (!selectedQuiz) {
    return (
      <div className="glass card-pad" style={{ padding: '30px', maxWidth: '760px' }}>
        <h2 className="mb24">Available Quizzes</h2>
        {quizzes.length === 0 ? (
          <p className="muted tiny">No quizzes available at the moment.</p>
        ) : (
          <div className="grid g2">
            {quizzes.map(q => (
              <div key={q.id} className="glass card-pad" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                <h3 className="mb8">{q.title}</h3>
                <p className="tiny muted mb16">
                  {q.timeLimit} mins • {q._count?.questions || q.questions?.length || 0} questions
                  {q.module && <><br />Module: {q.module.title}</>}
                </p>
                <button className="btn btn-primary btn-block btn-sm" onClick={() => loadQuiz(q.id)}>Start Quiz</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  let score = 0;
  if (submitted) {
    selectedQuiz.questions.forEach((qq, i) => {
      if (answers[i] === qq.correctAnswer) score++;
    });
  }

  const passScore = Math.ceil(selectedQuiz.questions.length / 2);
  const passed = score >= passScore;

  return (
    <div className="glass card-pad" style={{ padding: '30px', maxWidth: '760px' }}>
      <button className="btn btn-glass btn-sm mb24" onClick={() => setSelectedQuiz(null)}>← Back to Quizzes</button>
      <div className="row between mb24">
        <div>
          {selectedQuiz.module && <span className="eyebrow">Module: {selectedQuiz.module.title}</span>}
          <h2 className="mt8">{selectedQuiz.title}</h2>
        </div>
        <span className="chip chip-warn">⏱ {submitted ? 'Submitted' : `${selectedQuiz.timeLimit} mins`}</span>
      </div>
      
      {selectedQuiz.questions.map((qq, i) => (
        <div key={qq.id} className="mb24">
          <b style={{ fontSize: '15px' }}>{i + 1}. {qq.text}</b>
          <div className="mt16">
            {qq.options.map((opt, j) => {
              let cls = 'q-opt';
              const chosen = answers[i] === opt;
              if (submitted) {
                if (opt === qq.correctAnswer) cls += ' correct';
                else if (chosen) cls += ' wrong';
              } else if (chosen) {
                cls += ' sel';
              }
              return (
                <div key={j} className={cls} onClick={() => pickAns(i, opt)}>
                  {opt}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {submitted ? (
        <div className="glass card-pad" style={{ padding: '24px', background: passed ? 'var(--grad-mint)' : 'var(--grad-rose)', textAlign: 'center' }}>
          <h2 style={{ color: '#1c1c2b' }}>You scored {score}/{selectedQuiz.questions.length}</h2>
          <p style={{ marginTop: '6px' }}>{passed ? 'Great work! You passed this quiz. 🏅' : 'Keep going — review your mistakes and try again.'}</p>
          <button className="btn btn-glass mt16" onClick={resetQuiz}>Retake quiz</button>
        </div>
      ) : (
        <button className="btn btn-primary btn-block" onClick={submitQuiz} disabled={Object.keys(answers).length < selectedQuiz.questions.length}>
          Submit quiz (auto-grade)
        </button>
      )}
    </div>
  );
}
