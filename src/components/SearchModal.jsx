import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchModal.css';

export default function SearchModal({ isOpen, onClose, articles, archivedArticles }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Combine all articles for search
  const allArticles = [...(articles || []), ...(archivedArticles || [])];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = allArticles.filter((a) => {
      return (
        a.title?.toLowerCase().includes(q) ||
        a.url?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.listName?.toLowerCase().includes(q) ||
        (() => { try { return new URL(a.url).hostname.replace('www.', '').toLowerCase().includes(q); } catch { return false; } })()
      );
    }).slice(0, 8);
    setResults(filtered);
  }, [query, allArticles]);

  const handleSelect = (article) => {
    onClose();
    navigate(`/read/${article.id}`, { state: { article } });
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search articles, domains, lists…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="search-kbd">Esc</kbd>
        </div>

        {query && results.length === 0 && (
          <div className="search-empty">
            <div className="search-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>
            <p className="search-empty-title">No results for &ldquo;{query}&rdquo;</p>
            <p className="search-empty-hint">Try searching by title, URL, or description.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="search-results">
            {results.map((article) => (
              <button
                key={article.id}
                className="search-result-item"
                onClick={() => handleSelect(article)}
              >
                <div className="search-result-favicon">
                  <img
                    src={article.favicon || (() => {
                      try { return `https://www.google.com/s2/favicons?domain=${new URL(article.url).hostname}&sz=32`; } catch { return ''; }
                    })()}
                    alt=""
                    width="16"
                    height="16"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
                <div className="search-result-body">
                  <span className="search-result-title">{article.title || article.url}</span>
                  <span className="search-result-meta">
                    {(() => {
                      try { return new URL(article.url).hostname.replace('www.', ''); } catch { return article.url; }
                    })()}
                    {article.listName && <> · {article.listName}</>}
                    {article.readingTime && <> · {article.readingTime} min</>}
                  </span>
                </div>
                <svg className="search-result-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>
        )}

        {!query && (
          <div className="search-hint">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Search by title, URL, domain, or list name
          </div>
        )}
      </div>
    </div>
  );
}
