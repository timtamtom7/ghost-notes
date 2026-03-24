import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import './Reading.css';

export default function Reading() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { archiveArticle } = useArticles();

  const article = location.state?.article;
  const [readStatus, setReadStatus] = useState('reading'); // 'reading' | 'done'
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Track scroll progress
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

  const handleDone = async () => {
    try {
      await archiveArticle(id, 'read');
      setReadStatus('done');
      setTimeout(() => navigate('/app'), 800);
    } catch (e) {
      navigate('/app');
    }
  };

  const handleCull = async () => {
    try {
      await archiveArticle(id, 'culled');
      navigate('/app');
    } catch (e) {
      navigate('/app');
    }
  };

  if (!article) {
    return (
      <div className="reading-loading">
        <p>Loading article…</p>
      </div>
    );
  }

  return (
    <div className="reading-page">
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

      {/* Article metadata */}
      <div className="reading-meta-bar">
        <div className="reading-source">
          <img
            src={article.favicon || `https://www.google.com/s2/favicons?domain=${new URL(article.url).hostname}&sz=32`}
            alt=""
            width="16"
            height="16"
            style={{ borderRadius: 3 }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="reading-source-link">
            {new URL(article.url).hostname.replace('www.', '')}
          </a>
        </div>
        {article.readingTime && (
          <span className="reading-time">{article.readingTime} min read</span>
        )}
      </div>

      {/* Article content — opens in native browser */}
      <div className="reading-content">
        <div className="reading-article">
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
