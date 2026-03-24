import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchModal.css';

const DATE_FILTERS = [
  { label: 'Any time', value: 'any' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
  { label: 'Older', value: 'older' },
];

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'active' },
  { label: 'Archived', value: 'archived' },
];

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function articleDate(article) {
  if (!article.savedAt) return new Date(0);
  return article.savedAt?.toDate ? article.savedAt.toDate() : new Date(article.savedAt);
}

function matchesDateFilter(article, filter) {
  if (filter === 'any') return true;
  const d = articleDate(article);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  switch (filter) {
    case 'today':   return d >= startOfToday;
    case 'week':    return d >= startOfWeek;
    case 'month':   return d >= startOfMonth;
    case 'older':   return d < startOfMonth;
    default:        return true;
  }
}

export default function SearchModal({ isOpen, onClose, articles, archivedArticles, lists }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('any');
  const [domainFilter, setDomainFilter] = useState('');
  const [listFilter, setListFilter] = useState('');
  const [results, setResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const allArticles = useMemo(
    () => [...(articles || []), ...(archivedArticles || [])],
    [articles, archivedArticles]
  );

  // Derive unique domains from all articles
  const domains = useMemo(() => {
    const map = {};
    allArticles.forEach((a) => {
      const d = getDomain(a.url);
      if (d) map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([d]) => d);
  }, [allArticles]);

  // Combine lists from props and local list names from articles
  const allLists = useMemo(() => {
    const names = new Set();
    allArticles.forEach((a) => { if (a.listName) names.add(a.listName); });
    (lists || []).forEach((l) => names.add(l.name));
    return [...names].sort();
  }, [allArticles, lists]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setStatusFilter('all');
      setDateFilter('any');
      setDomainFilter('');
      setListFilter('');
      setResults([]);
      setShowFilters(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    let filtered = allArticles;

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((a) => a.status === 'active');
    } else if (statusFilter === 'archived') {
      filtered = filtered.filter((a) => a.status === 'archived');
    }

    // Date filter
    filtered = filtered.filter((a) => matchesDateFilter(a, dateFilter));

    // Domain filter
    if (domainFilter) {
      filtered = filtered.filter((a) => getDomain(a.url) === domainFilter);
    }

    // List filter
    if (listFilter) {
      filtered = filtered.filter((a) => a.listName === listFilter);
    }

    // Text query
    if (q) {
      filtered = filtered.filter((a) =>
        a.title?.toLowerCase().includes(q) ||
        a.url?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.listName?.toLowerCase().includes(q) ||
        getDomain(a.url).includes(q)
      );
    }

    setResults(filtered.slice(0, 10));
  }, [query, statusFilter, dateFilter, domainFilter, listFilter, allArticles]);

  const activeFiltersCount = [
    statusFilter !== 'all',
    dateFilter !== 'any',
    !!domainFilter,
    !!listFilter,
  ].filter(Boolean).length;

  const handleSelect = (article) => {
    onClose();
    navigate(`/read/${article.id}`, { state: { article } });
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFilter('any');
    setDomainFilter('');
    setListFilter('');
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Input */}
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
          <button
            className={`search-filter-toggle${showFilters ? ' active' : ''}${activeFiltersCount > 0 ? ' has-filters' : ''}`}
            onClick={() => setShowFilters((p) => !p)}
            title="Toggle filters"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            {activeFiltersCount > 0 && (
              <span className="search-filter-count">{activeFiltersCount}</span>
            )}
          </button>
          <kbd className="search-kbd">Esc</kbd>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="search-filters">
            {/* Status */}
            <div className="search-filter-group">
              <span className="search-filter-label">Status</span>
              <div className="search-filter-chips">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    className={`search-chip${statusFilter === f.value ? ' active' : ''}`}
                    onClick={() => setStatusFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="search-filter-group">
              <span className="search-filter-label">Date</span>
              <div className="search-filter-chips">
                {DATE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    className={`search-chip${dateFilter === f.value ? ' active' : ''}`}
                    onClick={() => setDateFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain */}
            {domains.length > 0 && (
              <div className="search-filter-group">
                <span className="search-filter-label">Domain</span>
                <div className="search-filter-chips">
                  <button
                    className={`search-chip${!domainFilter ? ' active' : ''}`}
                    onClick={() => setDomainFilter('')}
                  >
                    All
                  </button>
                  {domains.map((d) => (
                    <button
                      key={d}
                      className={`search-chip${domainFilter === d ? ' active' : ''}`}
                      onClick={() => setDomainFilter(domainFilter === d ? '' : d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* List */}
            {allLists.length > 0 && (
              <div className="search-filter-group">
                <span className="search-filter-label">List</span>
                <div className="search-filter-chips">
                  <button
                    className={`search-chip${!listFilter ? ' active' : ''}`}
                    onClick={() => setListFilter('')}
                  >
                    All
                  </button>
                  {allLists.map((l) => (
                    <button
                      key={l}
                      className={`search-chip${listFilter === l ? ' active' : ''}`}
                      onClick={() => setListFilter(listFilter === l ? '' : l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeFiltersCount > 0 && (
              <button className="search-filters-clear" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Results */}
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
            <p className="search-empty-hint">
              Try a different query
              {activeFiltersCount > 0 ? ' or clear your filters' : ''}.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="search-results">
            {!query && <div className="search-results-label">{results.length} article{results.length !== 1 ? 's' : ''}</div>}
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
                    {getDomain(article.url)}
                    {article.listName && <> · {article.listName}</>}
                    {article.readingTime && <> · {article.readingTime} min</>}
                    {article.status === 'archived' && <> · archived</>}
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
            Search by title, URL, domain, or list name — use the filter bar to narrow results
          </div>
        )}
      </div>
    </div>
  );
}
