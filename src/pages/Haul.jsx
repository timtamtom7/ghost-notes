import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import ArticleCard from '../components/ArticleCard';
import SaveInput from '../components/SaveInput';
import Toast from '../components/Toast';
import './Haul.css';

export default function Haul() {
  const { articles, loading, archiveArticle } = useArticles();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

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

  const count = articles.length;

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

      <div className="haul-save">
        <SaveInput onSave={() => showToast('Article saved.')} />
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

      {!loading && count === 0 && (
        <div className="haul-empty">
          <div className="haul-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="12" y2="17"/>
            </svg>
          </div>
          <h3>No ghosts yet.</h3>
          <p>Save your first article above. Paste a URL and press Enter — we'll fetch the title and details for you.</p>
        </div>
      )}

      {!loading && count > 0 && (
        <div className="haul-list animate-in">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onRead={() => handleRead(article)}
              onCull={() => handleCull(article.id)}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
