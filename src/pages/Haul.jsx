import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useSubscription, PLANS } from '../hooks/useSubscription';
import { FIREBASE_UNCONFIGURED } from '../firebase';
import ArticleCard from '../components/ArticleCard';
import SaveInput from '../components/SaveInput';
import MoveToListModal from '../components/MoveToListModal';
import ShareModal from '../components/ShareModal';
import Toast from '../components/Toast';
import { EmptyHaul, NetworkError } from '../components/ErrorState';
import './Haul.css';

// Sample articles for demo — replace with real data from Firebase
const SAMPLE_ARTICLES = [
  {
    id: 'sample-1',
    url: 'https://medium.com/@joanna/what-i-learned-from-reading-500-articles',
    title: 'What I Learned From Reading 500 Articles',
    description: 'After a year of saving every interesting article I found, here\'s what the data revealed about how I actually consume information — and what I wish I\'d done differently.',
    readingTime: 8,
    savedAt: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) },
    favicon: 'https://www.google.com/s2/favicons?domain=medium.com&sz=32',
  },
  {
    id: 'sample-2',
    url: 'https://www.notfun.net/essays/slow-readers',
    title: 'The Case for Reading Slowly',
    description: 'We\'ve optimized everything for speed — food, travel, communication. But deep reading is making a quiet comeback, and the people who practice it say it\'s changed how they think.',
    readingTime: 12,
    savedAt: { toDate: () => new Date(Date.now() - 18 * 60 * 60 * 1000) },
    favicon: 'https://www.google.com/s2/favicons?domain=notfun.net&sz=32',
  },
  {
    id: 'sample-3',
    url: 'https://www.technologyreview.com/2024/the-uncomfortable-state-of-llm-reasoning',
    title: 'The Uncomfortable State of LLM Reasoning',
    description: 'Large language models can pass bar exams and write poetry, but they still fail on basic logic puzzles that a child could solve. Researchers are divided on why — and what to do about it.',
    readingTime: 15,
    savedAt: { toDate: () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    favicon: 'https://www.google.com/s2/favicons?domain=technologyreview.com&sz=32',
  },
  {
    id: 'sample-4',
    url: 'https://www.currentaffairs.com/2024/in-defense-of-boring',
    title: 'In Defense of Boring',
    description: 'Everywhere you look, people are optimizing for novelty, excitement, and disruption. But the boring stuff — routine, consistency, patience — is what actually builds things that last.',
    readingTime: 6,
    savedAt: { toDate: () => new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    favicon: 'https://www.google.com/s2/favicons?domain=currentaffairs.com&sz=32',
  },
];

const LAST_VISIT_KEY = 'gn-last-visit';

function UpgradeBanner() {
  return (
    <div className="upgrade-banner">
      <div className="upgrade-banner-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <div className="upgrade-banner-text">
        <p className="upgrade-banner-title">You're on the Free plan</p>
        <p className="upgrade-banner-desc">Upgrade to Pro for unlimited hauls, cloud backup, and data export.</p>
      </div>
      <Link to="/pricing" className="btn btn-primary btn-sm">
        Upgrade
      </Link>
    </div>
  );
}

function RetentionBanner({ articles }) {
  const [lastVisit, setLastVisit] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LAST_VISIT_KEY);
    if (saved) setLastVisit(parseInt(saved, 10));
    localStorage.setItem(LAST_VISIT_KEY, Date.now().toString());
  }, []);

  if (!lastVisit || dismissed) return null;

  const daysAway = Math.floor((Date.now() - lastVisit) / (1000 * 60 * 60 * 24));
  if (daysAway < 3) return null;

  // Find stale articles (not opened in 30+ days)
  const staleArticles = articles.filter((a) => {
    if (!a.savedAt) return false;
    const savedDate = a.savedAt?.toDate ? a.savedAt.toDate() : new Date(a.savedAt);
    return (Date.now() - savedDate.getTime()) > 30 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="retention-banner">
      <div className="retention-banner-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      </div>
      <div className="retention-banner-text">
        <p className="retention-banner-title">
          {daysAway === 1
            ? "You were last here yesterday."
            : `You haven't visited in ${daysAway} days.`}
        </p>
        <p className="retention-banner-desc">
          {staleArticles.length > 0
            ? `${staleArticles.length} article${staleArticles.length !== 1 ? 's' : ''} in your Haul are over 30 days old — consider culling them.`
            : 'Your Haul is waiting.'}
        </p>
      </div>
      <button
        className="retention-banner-dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

function StaleArticleCard({ article, onRead, onCull }) {
  const [expanded, setExpanded] = useState(false);

  const savedDate = article.savedAt?.toDate ? article.savedAt.toDate() : new Date(article.savedAt);
  const daysOld = Math.floor((Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="stale-article-card">
      <div className="stale-article-body">
        <div className="stale-article-favicon">
          <img
            src={article.favicon || `https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(article.url).hostname; } catch { return ''; } })()}&sz=32`}
            alt=""
            width="14"
            height="14"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
        <div className="stale-article-info">
          <p className="stale-article-title">{article.title || article.url}</p>
          <p className="stale-article-meta">
            {daysOld} days old
            {article.readingTime && <> · {article.readingTime} min</>}
          </p>
        </div>
      </div>
      <div className="stale-article-actions">
        <button className="btn btn-ghost btn-xs" onClick={() => onRead(article)}>
          Read
        </button>
        <button className="btn btn-ghost btn-xs stale-cull-btn" onClick={() => onCull(article.id)}>
          Cull
        </button>
      </div>
    </div>
  );
}

function StaleArticlesSection({ articles, onRead, onCull }) {
  const [expanded, setExpanded] = useState(true);

  const staleArticles = articles.filter((a) => {
    if (!a.savedAt) return false;
    const savedDate = a.savedAt?.toDate ? a.savedAt.toDate() : new Date(a.savedAt);
    return (Date.now() - savedDate.getTime()) > 30 * 24 * 60 * 60 * 1000;
  });

  if (staleArticles.length === 0) return null;

  return (
    <div className="stale-section">
      <button
        className="stale-section-header"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="stale-section-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="stale-section-title">
            {staleArticles.length} article{staleArticles.length !== 1 ? 's' : ''} you haven't opened in 30+ days
          </span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>
      {expanded && (
        <div className="stale-section-list">
          {staleArticles.map((article) => (
            <StaleArticleCard
              key={article.id}
              article={article}
              onRead={onRead}
              onCull={onCull}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Haul() {
  const { articles, loading, archiveArticle, error, moveToList } = useArticles();
  const { plan } = useSubscription();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [moveModal, setMoveModal] = useState(null);
  const [shareArticle, setShareArticle] = useState(null);

  // Use sample articles when no real articles are loaded (for demo)
  const displayArticles = articles.length > 0 ? articles : SAMPLE_ARTICLES;
  const showEmpty = !loading && displayArticles.length === 0 && !error;
  const showNetworkError = error && !loading;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleRead = (article) => {
    navigate(`/read/${article.id}`, { state: { article } });
  };

  const handleCull = async (articleId) => {
    try {
      await archiveArticle(articleId, 'culled');
      showToast('Ghost released.');
    } catch (e) {
      // handled in useArticles
    }
  };

  const handleMoveArticle = async (articleId, listId, listName) => {
    try {
      await moveToList(articleId, listId, listName);
      showToast(listName ? `Moved to "${listName}".` : 'Removed from list.');
    } catch {
      showToast('Failed to move article.');
    }
  };

  const count = displayArticles.length;
  const isFreeUser = plan === PLANS.FREE;
  const atLimit = isFreeUser && count >= 5;

  return (
    <div className="haul-page">
      <div className="haul-header">
        <div>
          <h1 className="haul-title">Your Haul</h1>
          <p className="haul-subtitle">
            {count === 0
              ? 'Nothing here yet.'
              : count === 1
              ? '1 article waiting.'
              : `${count} articles waiting.`}
          </p>
        </div>
      </div>

      {isFreeUser && <UpgradeBanner />}

      <RetentionBanner articles={displayArticles} />

      {FIREBASE_UNCONFIGURED && (
        <div className="haul-notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>
            <strong>Demo mode.</strong> Firebase is not configured — see <code>TO-DO.md</code>. Saving articles won't work until Firebase is set up.
          </span>
        </div>
      )}

      <div className="haul-save">
        <SaveInput onSave={() => showToast('Article saved.')} disabled={atLimit} />
        {atLimit && (
          <p className="haul-limit-note">
            Free plan limit reached.{' '}
            <Link to="/pricing" style={{ color: 'var(--color-accent)' }}>
              Upgrade to save more →
            </Link>
          </p>
        )}
      </div>

      {loading && (
        <div className="haul-loading animate-in">
          {[1, 2, 3].map((i) => (
            <div key={i} className="article-card-skeleton">
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 16, width: '70%' }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showNetworkError && (
        <NetworkError onRetry={() => window.location.reload()} />
      )}

      {showEmpty && (
        <EmptyHaul />
      )}

      {/* Stale articles section (only show if there are real articles, not samples) */}
      {articles.length > 0 && !loading && (
        <StaleArticlesSection
          articles={articles}
          onRead={handleRead}
          onCull={handleCull}
        />
      )}

      {count > 0 && !loading && (
        <div className="haul-list animate-in">
          {displayArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onRead={() => handleRead(article)}
              onCull={() => handleCull(article.id)}
              onMoveToList={() => setMoveModal(article)}
              onShare={() => setShareArticle(article)}
            />
          ))}
        </div>
      )}

      {moveModal && (
        <MoveToListModal
          isOpen={!!moveModal}
          onClose={() => setMoveModal(null)}
          article={moveModal}
          onMoved={(listId, listName) => handleMoveArticle(moveModal.id, listId, listName)}
        />
      )}

      {shareArticle && (
        <ShareModal
          article={shareArticle}
          onClose={() => setShareArticle(null)}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
