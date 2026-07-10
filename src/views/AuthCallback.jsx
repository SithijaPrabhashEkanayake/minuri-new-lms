import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../config/supabaseClient';

const PasswordInput = ({ value, onChange, placeholder, onKeyDown, autoFocus }) => {
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
        autoFocus={autoFocus}
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

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Track whether Supabase has processed the recovery token and established a session
  const [sessionReady, setSessionReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Verifying your reset link…');

  const type = searchParams.get('type');

  useEffect(() => {
    // Supabase processes the #access_token from the URL hash automatically.
    // We listen for the resulting auth event to know when it's ready.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Session is now active from the recovery token — safe to call updateUser
        setSessionReady(true);
        setStatusMessage('');
      } else if (event === 'SIGNED_IN' && type !== 'recovery') {
        // Magic link or OAuth login redirect — send to gateway to auto-route
        router.replace('/lms');
      }
    });

    // Also check if there's already an active session (e.g. page reload)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && type === 'recovery') {
        setSessionReady(true);
        setStatusMessage('');
      } else if (!session && type === 'recovery') {
        // Give Supabase a moment to parse the hash before giving up
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!s) {
              setStatusMessage('');
              setError('Reset link is invalid or has expired. Please request a new one.');
            }
          });
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, type]);

  const handlePasswordReset = async () => {
    setError('');

    if (!newPassword) return setError('Please enter a new password.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      await supabase.auth.signOut(); // Clear the recovery session
      alert('✅ Password updated successfully! You can now log in with your new password.');
      router.replace('/lms');
    }
  };

  // ── Password Recovery UI ──
  if (type === 'recovery') {
    return (
      <div className="auth-wrap">
        <div className="glass auth-card fade-up">
          {/* Header */}
          <div className="center mb24">
            <div className="brand" style={{ justifyContent: 'center' }}>
              <span className="dot"></span>ICT Academy LMS
            </div>
            <p className="muted tiny mt8">
              {sessionReady ? 'Choose a new password' : 'Update your password'}
            </p>
          </div>

          {/* Error */}
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

          {/* Loading state while waiting for Supabase to parse the token */}
          {statusMessage && !error && (
            <div style={{
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '20px 0',
              fontSize: '14px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
              {statusMessage}
            </div>
          )}

          {/* The form — only shown once the recovery session is active */}
          {sessionReady && (
            <>
              <div className="field">
                <label>New Password</label>
                <PasswordInput
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Confirm New Password</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  onKeyDown={e => e.key === 'Enter' && handlePasswordReset()}
                />
              </div>
              <button
                className="btn btn-primary btn-block"
                onClick={handlePasswordReset}
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? '⏳ Saving…' : 'Save New Password'}
              </button>
            </>
          )}

          {/* If expired/invalid, show a link back */}
          {error && (
            <p className="center tiny mt16">
              <a
                style={{ color: 'var(--blue-d)', cursor: 'pointer' }}
                onClick={() => router.replace('/lms')}
              >
                Back to Login
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Generic callback (magic links, OAuth, etc.) ──
  return (
    <div className="auth-wrap">
      <div className="glass auth-card fade-up">
        <div className="center">
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔄</div>
          <p className="muted">Verifying authentication…</p>
        </div>
      </div>
    </div>
  );
}
