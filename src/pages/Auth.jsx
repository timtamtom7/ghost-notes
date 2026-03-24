import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FIREBASE_UNCONFIGURED } from '../firebase';
import './Auth.css';

export default function Auth() {
  const { user, sendMagicLink, confirmMagicLink, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('email'); // 'email' | 'sent' | 'confirming'
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/app');
      return;
    }

    // Check if this is a magic link callback
    if (window.location.href.includes('apiKey')) {
      setMode('confirming');
      const stored = sessionStorage.getItem('gn-email-for-signin');
      if (stored) {
        confirmLink(stored);
      } else {
        setError('Email not found. Please sign in again.');
        setMode('email');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setSubmitting(true);

    try {
      await sendMagicLink(email.trim());
      sessionStorage.setItem('gn-email-for-signin', email.trim());
      setMode('sent');
    } catch (err) {
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmLink = async (emailToConfirm) => {
    setSubmitting(true);
    setError('');
    try {
      await confirmMagicLink(emailToConfirm);
      sessionStorage.removeItem('gn-email-for-signin');
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.');
      setMode('email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.3"/>
            <path d="M9 8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S11.33 10 10.5 10 9 9.33 9 8.5zM14 15.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" fill="currentColor"/>
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16z" fill="currentColor" opacity="0.15"/>
          </svg>
          <span>Ghost Notes</span>
        </div>

        {FIREBASE_UNCONFIGURED && (
          <div className="auth-notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>
              <strong>Firebase not configured yet.</strong> See <code>TO-DO.md</code> for setup instructions. Auth will not work until Firebase is configured.
            </span>
          </div>
        )}

        {mode === 'email' && (
          <>
            <h1>Welcome back.</h1>
            <p className="auth-subtitle">Sign in with your email. We'll send you a magic link — no password needed.</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={FIREBASE_UNCONFIGURED}
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button
                type="submit"
                className={`btn btn-primary btn-full${submitting ? ' btn-loading' : ''}`}
                disabled={submitting || FIREBASE_UNCONFIGURED}
              >
                {submitting ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          </>
        )}

        {mode === 'sent' && (
          <>
            <div className="auth-sent-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </div>
            <h1>Check your inbox.</h1>
            <p className="auth-subtitle">
              We sent a magic link to <strong>{email}</strong>. Click it to sign in. The link expires in an hour.
            </p>
            <button
              className="btn btn-ghost btn-full"
              onClick={() => setMode('email')}
            >
              Use a different email
            </button>
          </>
        )}

        {mode === 'confirming' && (
          <>
            <div className="auth-sent-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <h1>Signing you in…</h1>
            <p className="auth-subtitle">Please wait while we confirm your magic link.</p>
            {error && <p className="auth-error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
