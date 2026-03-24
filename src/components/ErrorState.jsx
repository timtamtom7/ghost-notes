import './ErrorState.css';

/* ── Network Error ─────────────────────────── */
export function NetworkError({ onRetry }) {
  return (
    <div className="error-state">
      <div className="error-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M1 1l22 22"/>
          <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/>
          <path d="M5 12.55a10.94 10.94 0 015.17-2.39"/>
          <path d="M10.71 5.05A16 16 0 0122.58 9"/>
          <path d="M1.42 9a15.91 15.91 0 014.7-2.88"/>
          <path d="M8.53 16.11a6 6 0 016.95 0"/>
          <line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
      </div>
      <h3 className="error-title">Connection lost.</h3>
      <p className="error-desc">
        Couldn't reach the server. Check your connection and try again.
      </p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Retry
        </button>
      )}
    </div>
  );
}

/* ── Empty Haul ───────────────────────────── */
export function EmptyHaul({ onSave }) {
  return (
    <div className="error-state empty-haul">
      <div className="error-icon ghost-icon">
        <svg width="56" height="64" viewBox="0 0 120 140" fill="none">
          <path
            d="M60 18 C30 18 18 48 18 80 L18 115 L30 105 L42 115 L60 105 L78 115 L90 105 L102 115 L102 80 C102 48 90 18 60 18Z"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.3"
          />
          <circle cx="45" cy="62" r="5" fill="var(--color-accent)" opacity="0.4"/>
          <circle cx="75" cy="62" r="5" fill="var(--color-accent)" opacity="0.4"/>
          <path d="M48 78 Q60 86 72 78" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" opacity="0.3"/>
        </svg>
      </div>
      <h3 className="error-title">No ghosts yet.</h3>
      <p className="error-desc">
        Paste any URL above to save your first article. Ghost Notes will fetch the title and details automatically.
      </p>
      {onSave && (
        <button className="btn btn-primary" onClick={onSave}>
          Save your first article
        </button>
      )}
    </div>
  );
}

/* ── Failed Image Upload ──────────────────── */
export function ImageUploadError({ onRetry }) {
  return (
    <div className="error-state inline-error">
      <div className="error-icon small">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      </div>
      <div>
        <p className="error-title small">Image failed to load.</p>
        <p className="error-desc tiny">The source might be blocked or unavailable.</p>
      </div>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

/* ── Session Expired ──────────────────────── */
export function SessionExpired({ onSignIn }) {
  return (
    <div className="error-state session-expired">
      <div className="error-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
          <circle cx="12" cy="16" r="1" fill="currentColor" opacity="0.4"/>
        </svg>
      </div>
      <h3 className="error-title">Session expired.</h3>
      <p className="error-desc">
        Your sign-in link has expired or the session was reset. Sign in again to continue.
      </p>
      {onSignIn && (
        <button className="btn btn-primary" onClick={onSignIn}>
          Sign in again
        </button>
      )}
    </div>
  );
}

/* ── Article Load Error ───────────────────── */
export function ArticleLoadError({ onRetry }) {
  return (
    <div className="error-state">
      <div className="error-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="12" y2="17"/>
        </svg>
      </div>
      <h3 className="error-title">Couldn't load article.</h3>
      <p className="error-desc">
        The article couldn't be retrieved. The page may be down or the URL may be invalid.
      </p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
