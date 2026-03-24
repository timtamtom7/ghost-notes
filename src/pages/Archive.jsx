import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useSubscription, PLANS } from '../hooks/useSubscription';
import ArticleCard from '../components/ArticleCard';
import MoveToListModal from '../components/MoveToListModal';
import Toast from '../components/Toast';
import { NetworkError } from '../components/ErrorState';
import './Archive.css';

function UpgradeNote() {
  const { plan } = useSubscription();
  if (plan !== PLANS.FREE) return null;
  return (
    <div className="archive-upgrade-note">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <span>Advanced stats, export, and cloud backup are Pro features.{' '}
        <Link to="/pricing" style={{ color: 'var(--color-accent)' }}>Upgrade →</Link>
      </span>
    </div>
  );
}

function StatsHeader({ archivedArticles, articles }) {
  const readCount = archivedArticles.filter((a) => a.archiveAction === 'read').length;
  const culledCount = archivedArticles.filter((a) => a.archiveAction === 'culled').length;
  const totalSaved = archivedArticles.length;
  const cullRate = totalSaved > 0 ? Math.round((culledCount / totalSaved) * 100) : 0;

  // Sum reading times from ALL articles (both active and archived)
  const allArticles = [...articles, ...archivedArticles];
  const totalReadingTime = allArticles.reduce((sum, a) => sum + (a.readingTime || 0), 0);

  const totalHours = Math.floor(totalReadingTime / 60);
  const totalMins = totalReadingTime % 60;

  const readPct = totalSaved > 0 ? Math.round((readCount / totalSaved) * 100) : 0;
  const culledPct = totalSaved > 0 ? Math.round((culledCount / totalSaved) * 100) : 0;

  if (totalSaved === 0) return null;

  return (
    <div className="stats-header">
      <div className="stats-summary">
        <div className="stats-stat">
          <span className="stats-stat-value">{totalSaved}</span>
          <span className="stats-stat-label">saved</span>
        </div>
        <div className="stats-sep" />
        <div className="stats-stat">
          <span className="stats-stat-value">{readCount}</span>
          <span className="stats-stat-label">read</span>
        </div>
        <div className="stats-sep" />
        <div className="stats-stat">
          <span className="stats-stat-value">{culledCount}</span>
          <span className="stats-stat-label">culled</span>
        </div>
        <div className="stats-sep" />
        <div className="stats-stat">
          <span className="stats-stat-value">{cullRate}%</span>
          <span className="stats-stat-label">cull rate</span>
        </div>
        {totalReadingTime > 0 && (
          <>
            <div className="stats-sep" />
            <div className="stats-stat">
              <span className="stats-stat-value">
                {totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`}
              </span>
              <span className="stats-stat-label">read time</span>
            </div>
          </>
        )}
      </div>

      {/* Mini bar chart */}
      <div className="stats-bar-chart" aria-hidden="true">
        {readPct > 0 && (
          <div className="stats-bar-segment read" style={{ width: `${readPct}%` }} title={`${readPct}% read`} />
        )}
        {culledPct > 0 && (
          <div className="stats-bar-segment culled" style={{ width: `${culledPct}%` }} title={`${culledPct}% culled`} />
        )}
      </div>
    </div>
  );
}

export default function Archive() {
  const { archivedArticles, reSaveArticle, error, moveToList, articles } = useArticles();
  const [filter, setFilter] = useState('all'); // 'all' | 'read' | 'culled'
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [moveModal, setMoveModal] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = archivedArticles.filter((a) => {
    const matchesFilter = filter === 'all' || a.archiveAction === filter;
    const matchesSearch =
      !search ||
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.url?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const readCount = archivedArticles.filter((a) => a.archiveAction === 'read').length;
  const culledCount = archivedArticles.filter((a) => a.archiveAction === 'culled').length;

  const handleReSave = async (articleId) => {
    await reSaveArticle(articleId);
    showToast('Moved back to your Haul.');
  };

  const handleMoveArticle = async (articleId, listId, listName) => {
    try {
      await moveToList(articleId, listId, listName);
      showToast(listName ? `Moved to "${listName}".` : 'Removed from list.');
    } catch {
      showToast('Failed to move article.');
    }
  };

  return (
    <div className="archive-page">
      <div className="archive-header">
        <div>
          <h1 className="archive-title">Archive</h1>
          <p className="archive-subtitle">
            {archivedArticles.length === 0
              ? 'Nothing archived yet.'
              : `${readCount} read · ${culledCount} culled`}
          </p>
        </div>
      </div>

      <StatsHeader archivedArticles={archivedArticles} articles={articles} />
      <UpgradeNote />

      {error && !archivedArticles.length && (
        <NetworkError onRetry={() => window.location.reload()} />
      )}

      {archivedArticles.length > 0 && (
        <div className="archive-controls">
          <div className="archive-search-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="archive-search"
              placeholder="Search archive…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="archive-filters">
            {['all', 'read', 'culled'].map((f) => (
              <button
                key={f}
                className={`archive-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'read' ? 'Read' : 'Culled'}
              </button>
            ))}
          </div>
        </div>
      )}

      {archivedArticles.length === 0 && !error && (
        <div className="archive-empty">
          <div className="archive-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <polyline points="21,8 21,21 3,21 3,8"/>
              <rect x="1" y="3" width="22" height="5" rx="1"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
          </div>
          <h3>Archive is empty.</h3>
          <p>Articles you've read or consciously culled will appear here — a record of your decisions.</p>
        </div>
      )}

      {archivedArticles.length > 0 && filtered.length === 0 && (
        <div className="archive-empty">
          <h3>No matches.</h3>
          <p>Try a different search or filter.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="archive-list animate-in">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onReSave={() => handleReSave(article.id)}
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
