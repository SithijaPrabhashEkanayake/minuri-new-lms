import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const PasswordInput = ({ value, onChange, placeholder, onKeyDown }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        className="input"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        style={{ paddingRight: '40px' }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          color: 'var(--ink-500)',
          padding: 0
        }}
        title={show ? "Hide password" : "Show password"}
      >
        {show ? '👁️‍🗨️' : '👁️'}
      </button>
    </div>
  );
};

export function Gateway() {
  const [method, setMethod] = useState('student');
  // view: 'login' | 'register' | 'forgot_password'
  const [view, setView] = useState('login');

  // Student Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Staff Login
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPass, setStaffPass] = useState('');

  // Student Registration
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGrade, setRegGrade] = useState('11');
  const [regConsent, setRegConsent] = useState(false);
  const [regClassType, setRegClassType] = useState('Theory');
  const [regMedium, setRegMedium] = useState('Physical');
  const [regInstitution, setRegInstitution] = useState('Ziplin');

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login, register, forgotPassword } = useAuth();
  const router = useRouter();

  const isStudent = method === 'student';

  useEffect(() => {
    if (user) {
      if (user.role === 'Student') router.replace('/app/library');
      else if (user.role === 'Admin') router.replace('/admin/approvals');
      else if (user.role === 'Teacher') router.replace('/teach/stream');
    }
  }, [user, router]);

  const handleStudentLogin = async () => {
    setError('');
    setLoading(true);
    const res = await login(email, password, 'student');
    setLoading(false);
    if (!res.success) setError(res.message);
  };

  const handleStaffLogin = async () => {
    setError('');
    setLoading(true);
    const res = await login(staffEmail, staffPass, 'staff');
    setLoading(false);
    if (!res.success) setError(res.message);
  };

  const handleRegister = async () => {
    setError('');
    if (!regConsent) return setError('Parental consent is required.');
    setLoading(true);
    const res = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      grade: parseInt(regGrade),
      consentGiven: true,
      classType: regClassType,
      medium: regMedium,
      institution: regInstitution
    });
    setLoading(false);
    if (res.success) {
      setView('login');
      setMethod('student');
    } else {
      setError(res.message);
    }
  };



  const handleRequestOtp = async () => {
    setError('');
    setLoading(true);
    const res = await forgotPassword(forgotEmail);
    setLoading(false);
    if (res.success) {
      alert(res.message);
      setView('login');
    } else {
      setError(res.message);
    }
  };

  const switchView = (newView) => {
    setError('');
    setView(newView);
  };

  return (
    <div className="auth-wrap">
      <div className="glass auth-card fade-up">
        {/* Header */}
        <div className="center mb24">
          <div className="brand" style={{ justifyContent: 'center' }}>
            <span className="dot"></span>ICT Academy LMS
          </div>
          <p className="muted tiny mt8">
            {view === 'login' && 'Choose how you want to sign in'}
            {view === 'register' && 'Create a new student account'}
            {view === 'register_staff' && 'Create a staff account (invite required)'}
            {view === 'forgot_password' && 'Reset your password'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            color: 'var(--danger)',
            background: 'rgba(226,96,122,.1)',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '16px',
            fontWeight: 500
          }}>
            ⚠ {error}
          </div>
        )}

        {/* ── LOGIN VIEW ── */}
        {view === 'login' && (
          <>
            {/* Auth Tabs */}
            <div className="auth-tabs">
              <button
                className={isStudent ? 'active' : ''}
                onClick={() => { setMethod('student'); setError(''); }}
              >
                <span className="t">🎓 Student</span>
                <span className="s">Connect to your class</span>
              </button>
              <button
                className={`peach ${!isStudent ? 'active' : ''}`}
                onClick={() => { setMethod('staff'); setError(''); }}
              >
                <span className="t">🛠️ Admin / Teacher</span>
                <span className="s">Manage the LMS & website</span>
              </button>
            </div>

            {/* Student Login Form */}
            {isStudent ? (
              <>
                <div className="field">
                  <label>Email</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    onKeyDown={e => e.key === 'Enter' && handleStudentLogin()}
                  />
                </div>
                <div className="field">
                  <label>Password</label>
                  <PasswordInput
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    onKeyDown={e => e.key === 'Enter' && handleStudentLogin()}
                  />
                </div>
                <div className="row between mb16">
                  <div></div>
                  <a
                    className="tiny"
                    style={{ color: 'var(--blue-d)', cursor: 'pointer' }}
                    onClick={() => switchView('forgot_password')}
                  >
                    Forgot password?
                  </a>
                </div>
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleStudentLogin}
                  disabled={loading}
                >
                  {loading ? '⏳ Signing in…' : '🎓 Connect to Class'}
                </button>
                <p className="center tiny muted mt16">
                  New here?{' '}
                  <a
                    style={{ color: 'var(--blue-d)', cursor: 'pointer' }}
                    onClick={() => switchView('register')}
                  >
                    Register with parental consent
                  </a>
                </p>
              </>
            ) : (
              /* Staff Login Form */
              <>
                <div className="field">
                  <label>Staff Email</label>
                  <input
                    className="input"
                    type="email"
                    value={staffEmail}
                    onChange={e => setStaffEmail(e.target.value)}
                    placeholder="admin@ictacademy.lk"
                    onKeyDown={e => e.key === 'Enter' && handleStaffLogin()}
                  />
                </div>
                <div className="field">
                  <label>Password</label>
                  <PasswordInput
                    value={staffPass}
                    onChange={e => setStaffPass(e.target.value)}
                    placeholder="Enter your password"
                    onKeyDown={e => e.key === 'Enter' && handleStaffLogin()}
                  />
                </div>
                <button
                  className="btn btn-peach btn-block"
                  onClick={handleStaffLogin}
                  disabled={loading}
                >
                  {loading ? '⏳ Signing in…' : '🛠️ Manage LMS'}
                </button>

              </>
            )}
          </>
        )}

        {/* ── STUDENT REGISTRATION VIEW ── */}
        {view === 'register' && (
          <>
            <div className="field">
              <label>Full Name</label>
              <input className="input" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+94 77 123 4567" />
            </div>
            <div className="grid g2" style={{ gap: '16px' }}>
              <div className="field">
                <label>Password</label>
                <PasswordInput value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min. 6 characters" />
              </div>
              <div className="field">
                <label>Grade</label>
                <select className="input" value={regGrade} onChange={e => setRegGrade(e.target.value)}>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Class Type</label>
              <select className="input" value={regClassType} onChange={e => setRegClassType(e.target.value)}>
                <option value="Theory">Theory Class</option>
                <option value="Paper">Paper Class</option>
                <option value="Both">Both (Theory & Paper)</option>
              </select>
            </div>
            <div className="grid g2" style={{ gap: '16px' }}>
              <div className="field">
                <label>Medium</label>
                <select className="input" value={regMedium} onChange={e => setRegMedium(e.target.value)}>
                  <option value="Physical">Physical Class</option>
                  <option value="Online">Online Class</option>
                </select>
              </div>
              <div className="field">
                <label>Institution</label>
                <select className="input" value={regInstitution} onChange={e => setRegInstitution(e.target.value)}>
                  <option value="Ziplin">Ziplin</option>
                  <option value="Suzipka">Suzipka</option>
                  <option value="Zipzone">Zipzone</option>
                </select>
              </div>
            </div>
            <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
              <input type="checkbox" checked={regConsent} onChange={e => setRegConsent(e.target.checked)} id="consent" />
              <label htmlFor="consent" style={{ margin: 0, fontSize: '13px', cursor: 'pointer' }}>
                I confirm I have parental consent to register.
              </label>
            </div>
            <button className="btn btn-primary btn-block" onClick={handleRegister} disabled={loading}>
              {loading ? '⏳ Creating account…' : 'Register Account'}
            </button>
            <p className="center tiny mt16">
              <a style={{ color: 'var(--blue-d)', cursor: 'pointer' }} onClick={() => switchView('login')}>Back to Login</a>
            </p>
          </>
        )}



        {/* ── FORGOT PASSWORD VIEW ── */}
        {view === 'forgot_password' && (
          <>
            <div className="field">
              <label>Registered Email</label>
              <input
                className="input"
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <button className="btn btn-primary btn-block" onClick={handleRequestOtp} disabled={loading}>
              {loading ? '⏳ Sending…' : 'Send Reset Email'}
            </button>
            <p className="center tiny mt16">
              <a style={{ color: 'var(--blue-d)', cursor: 'pointer' }} onClick={() => switchView('login')}>Back to Login</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
