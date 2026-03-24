import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import ArticleCard from '../components/ArticleCard';
import SaveInput from '../components/SaveInput';
import Toast from '../components/Toast';
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

export default function Haul() {
  const { articles, loading, archiveArticle } = useArticles();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  // Use sample articles when no real articles are loaded (for demo)
  const displayArticles = articles.length > 0 ? articles : SAMPLE_ARTICLES;
  const showEmpty = !loading && displayArticles.length === 0;

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

  const count = displayArticles.length;

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

      {showEmpty && (
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

      {count > 0 && (
        <div className="haul-list animate-in">
          {displayArticles.map((article) => (
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
