import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useSubscription, PLANS } from '../hooks/useSubscription';
import { FIREBASE_UNCONFIGURED } from '../firebase';
import ArticleCard from '../components/ArticleCard';
import SaveInput from '../components/SaveInput';
import MoveToListModal from '../components/MoveToListModal';
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

export default function Haul() {
  const { articles, loading, archiveArticle, error, moveToList } = useArticles();
  const { plan } = useSubscription();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [moveModal, setMoveModal] = useState(null);

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

      {count > 0 && !loading && (
        <div className="haul-list animate-in">
          {displayArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onRead={() => handleRead(article)}
              onCull={() => handleCull(article.id)}
              onMoveToList={() => setMoveModal(article)}
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

      {toast && <Toast message={toast} />}
    </div>
  );
}
