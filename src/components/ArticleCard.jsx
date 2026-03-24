import { useState } from 'react';
import './ArticleCard.css';

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export default function ArticleCard({ article, onRead, onCull, onReSave }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className={`article-card${hovered ? ' hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="article-card-favicon">
        <img
          src={article.favicon || `https://www.google.com/s2/favicons?domain=${getDomain(article.url)}&sz=32`}
          alt=""
          width="20"
          height="20"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="favicon-fallback" style={{ display: 'none' }}>
          {article.title?.[0]?.toUpperCase() || '?'}
        </div>
      </div>

      <div className="article-card-body">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="article-card-title"
          onClick={(e) => { if (onRead) { e.preventDefault(); onRead(); } }}
        >
          {article.title || article.url}
        </a>
        <div className="article-card-meta">
          <span className="article-card-domain">{getDomain(article.url)}</span>
          {article.readingTime && (
            <>
              <span className="meta-dot">·</span>
              <span className="article-card-readtime">{article.readingTime} min read</span>
            </>
          )}
          <span className="meta-dot">·</span>
          <span className="article-card-time">{timeAgo(article.savedAt)}</span>
          {article.listName && (
            <>
              <span className="meta-dot">·</span>
              <span className="article-card-list">{article.listName}</span>
            </>
          )}
        </div>
        {article.description && (
          <p className="article-card-desc">{article.description}</p>
        )}
      </div>

      <div className="article-card-actions">
        {onRead && (
          <button className="btn btn-secondary btn-sm article-action-read" onClick={onRead}>
            Read
          </button>
        )}
        {onCull && (
          <button className="btn btn-ghost btn-sm article-action-cull" onClick={onCull} title="Cull">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        )}
        {onReSave && (
          <button className="btn btn-ghost btn-sm" onClick={onReSave} title="Re-save">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        )}
      </div>
    </article>
  );
}
