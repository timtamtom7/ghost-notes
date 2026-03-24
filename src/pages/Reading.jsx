import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useSubscription, PLANS } from '../hooks/useSubscription';
import { ArticleLoadError, SessionExpired } from '../components/ErrorState';
import './Reading.css';

const FONT_SIZES = {
  small: { body: '15px', title: '26px', desc: '16px' },
  medium: { body: '17px', title: '32px', desc: '19px' },
  large: { body: '20px', title: '38px', desc: '22px' },
};

const READING_THEMES = {
  light: {
    '--reading-bg': '#fafaf8',
    '--reading-text': '#1a1a1a',
    '--reading-muted': '#6b6b6b',
    '--reading-border': 'rgba(0,0,0,0.08)',
    '--reading-card': '#f3f3f1',
  },
  sepia: {
    '--reading-bg': '#f5efe0',
    '--reading-text': '#3d3020',
    '--reading-muted': '#7a6650',
    '--reading-border': 'rgba(61,48,32,0.1)',
    '--reading-card': '#ede5d0',
  },
  dark: {
    '--reading-bg': 'var(--surface-1)',
    '--reading-text': 'var(--text-primary)',
    '--reading-muted': 'var(--text-secondary)',
    '--reading-border': 'var(--border-subtle)',
    '--reading-card': 'var(--surface-2)',
  },
};

export default function Reading() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { archiveArticle } = useArticles();
  const { plan } = useSubscription();

  const article = location.state?.article;
  const [readStatus, setReadStatus] = useState('reading'); // 'reading' | 'done'
  const [progress, setProgress] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('gn-reading-fontsize') || 'medium');
  const [readingTheme, setReadingTheme] = useState(() => localStorage.getItem('gn-reading-theme') || 'dark');
  const [showControls, setShowControls] = useState(false);

  // Apply reading theme
  useEffect(() => {
    const theme = READING_THEMES[readingTheme];
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, val]) => root.style.setProperty(key, val));
    localStorage.setItem('gn-reading-theme', readingTheme);
    return () => {
      // Reset to dark defaults when leaving
      root.style.setProperty('--reading-bg', 'var(--surface-1)');
      root.style.setProperty('--reading-text', 'var(--text-primary)');
      root.style.setProperty('--reading-muted', 'var(--text-secondary)');
      root.style.setProperty('--reading-border', 'var(--border-subtle)');
      root.style.setProperty('--reading-card', 'var(--surface-2)');
    };
  }, [readingTheme]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      if (total > 0) {
        setProgress(Math.min(100, Math.round((scrolled / total) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!article) {
      setLoadError(true);
    }
  }, [article]);

  const handleFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('gn-reading-fontsize', size);
  };

  const handleDone = async () => {
    try {
      await archiveArticle(id, 'read');
      setReadStatus('done');
      setTimeout(() => navigate('/app'), 800);
    } catch (err) {
      if (err.message?.includes('auth') || err.message?.includes('permission')) {
        setSessionExpired(true);
      }
      navigate('/app');
    }
  };

  const handleCull = async () => {
    try {
      await archiveArticle(id, 'culled');
      navigate('/app');
    } catch (err) {
      if (err.message?.includes('auth') || err.message?.includes('permission')) {
        setSessionExpired(true);
      }
      navigate('/app');
    }
  };

  if (loadError || sessionExpired) {
    return (
      <div className="reading-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        {sessionExpired ? (
          <SessionExpired onSignIn={() => navigate('/auth')} />
        ) : (
          <ArticleLoadError onRetry={() => window.location.reload()} />
        )}
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const isFreeUser = plan === PLANS.FREE;
  const sizes = FONT_SIZES[fontSize];

  return (
    <div className="reading-page" data-reading-theme={readingTheme}>
      {/* Progress bar */}
      <div className="reading-progress">
        <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Header */}
      <header className="reading-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div className="reading-progress-label">
          <span className="badge">{progress}%</span>
        </div>
        <div className="reading-header-actions">
          {/* Reading controls toggle */}
          <button
            className={`btn btn-ghost btn-sm${showControls ? ' active' : ''}`}
            onClick={() => setShowControls((p) => !p)}
            title="Display settings"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleCull}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Cull
          </button>
          <button
            className={`btn btn-sm${readStatus === 'done' ? ' btn-secondary' : ' btn-primary'}`}
            onClick={handleDone}
          >
            {readStatus === 'done' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Done
              </>
            ) : (
              'Mark as read'
            )}
          </button>
        </div>
      </header>

      {/* Reading Controls Panel */}
      {showControls && (
        <div className="reading-controls-panel">
          <div className="reading-controls-section">
            <span className="reading-controls-label">Text size</span>
            <div className="reading-controls-row">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  className={`reading-size-btn${fontSize === size ? ' active' : ''}`}
                  onClick={() => handleFontSize(size)}
                >
                  {size === 'small' && <span style={{ fontSize: '12px' }}>Aa</span>}
                  {size === 'medium' && <span style={{ fontSize: '14px' }}>Aa</span>}
                  {size === 'large' && <span style={{ fontSize: '17px' }}>Aa</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="reading-controls-divider" />
          <div className="reading-controls-section">
            <span className="reading-controls-label">Theme</span>
            <div className="reading-controls-row">
              {[
                { key: 'light', label: 'Light', color: '#fafaf8', textColor: '#1a1a1a' },
                { key: 'sepia', label: 'Sepia', color: '#f5efe0', textColor: '#3d3020' },
                { key: 'dark', label: 'Dark', color: '#141410', textColor: '#fafaf8' },
              ].map((t) => (
                <button
                  key={t.key}
                  className={`reading-theme-btn${readingTheme === t.key ? ' active' : ''}`}
                  onClick={() => setReadingTheme(t.key)}
                  title={t.label}
                >
                  <div
                    className="reading-theme-swatch"
                    style={{ background: t.color, borderColor: readingTheme === t.key ? 'var(--color-accent)' : 'var(--border-default)' }}
                  >
                    <span style={{ color: t.textColor, fontSize: '10px', fontFamily: 'var(--font-serif)' }}>A</span>
                  </div>
                  <span className="reading-theme-label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Article metadata */}
      <div className="reading-meta-bar">
        <div className="reading-source">
          <img
            src={article.favicon || (() => {
              try { return `https://www.google.com/s2/favicons?domain=${new URL(article.url).hostname}&sz=32`; } catch { return ''; }
            })()}
            alt=""
            width="16"
            height="16"
            style={{ borderRadius: 3 }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="reading-source-link">
            {(() => {
              try { return new URL(article.url).hostname.replace('www.', ''); } catch { return article.url; }
            })()}
          </a>
        </div>
        {article.readingTime && (
          <span className="reading-time">{article.readingTime} min read</span>
        )}
        {isFreeUser && (
          <span className="reading-pro-tag">
            Pro feature — open in browser
          </span>
        )}
      </div>

      {/* Article content */}
      <div className="reading-content">
        <div className="reading-article" style={{ '--reading-font-body': sizes.body, '--reading-font-title': sizes.title, '--reading-font-desc': sizes.desc }}>
          <h1 className="reading-title">{article.title || article.url}</h1>
          {article.description && (
            <p className="reading-description">{article.description}</p>
          )}
          <div className="reading-cta">
            <p className="reading-cta-text">
              Ghost Notes opens articles in your browser's reading view for the cleanest experience.
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15,3 21,3 21,9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open in browser
            </a>
          </div>
          <div className="reading-divider" />
          <p className="reading-tip">
            <em>Tip: Use your browser's Reader Mode (View → Enter Reader Mode, or press </em>
            <kbd>Shift + R</kbd>
            <em>) for a beautifully formatted version without ads or distractions.</em>
          </p>
        </div>
      </div>
    </div>
  );
}
