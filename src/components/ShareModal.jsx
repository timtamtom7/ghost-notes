import { useState } from 'react';
import './ShareModal.css';

export default function ShareModal({ article, onClose }) {
  const [activeTab, setActiveTab] = useState('link');
  const [ghostNote, setGhostNote] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl = article?.url || '';
  const shareTitle = encodeURIComponent(article?.title || shareUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: ghostNote || undefined,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyGhostNote = async () => {
    const text = ghostNote
      ? `"${ghostNote}" — ${article?.title}\n${shareUrl}`
      : `${article?.title} — ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      handleCopyLink();
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${ghostNote ? encodeURIComponent(`"${ghostNote}" `) : ''}${shareTitle}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="share-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="share-modal">
        <div className="share-modal-header">
          <h2 className="share-modal-title">Share Article</h2>
          <button className="share-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="share-preview">
          <p className="share-preview-title">{article?.title || 'Untitled'}</p>
          <p className="share-preview-url">{shareUrl}</p>
        </div>

        <div className="share-tabs">
          <button
            className={`share-tab${activeTab === 'link' ? ' active' : ''}`}
            onClick={() => setActiveTab('link')}
          >
            Share Link
          </button>
          <button
            className={`share-tab${activeTab === 'ghostnote' ? ' active' : ''}`}
            onClick={() => setActiveTab('ghostnote')}
          >
            Ghost Note
          </button>
        </div>

        {activeTab === 'link' && (
          <div>
            <div className="share-url-row">
              <input
                className="share-url-input"
                type="text"
                value={shareUrl}
                readOnly
                onClick={(e) => e.target.select()}
              />
              <button
                className="btn btn-secondary btn-sm share-copy-btn"
                onClick={handleCopyLink}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {copied && (
              <div className="share-success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Link copied to clipboard
              </div>
            )}

            <div className="share-divider">or share via</div>

            <div className="share-social-row">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-social-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X / Twitter
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-social-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              <button className="share-social-btn" onClick={handleShareNative}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
                </svg>
                More
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ghostnote' && (
          <div className="share-ghost-note-section">
            <label className="share-ghost-note-label">
              Share a highlight or note
            </label>
            <textarea
              className="share-ghost-note-textarea"
              placeholder={`"The best quote or insight from this article..."`}
              value={ghostNote}
              onChange={(e) => setGhostNote(e.target.value)}
              maxLength={280}
            />
            <p className="share-ghost-note-hint">
              {ghostNote.length}/280 — adds context to the link
            </p>

            <div style={{ marginTop: 16 }}>
              <div className="share-url-row">
                <input
                  className="share-url-input"
                  type="text"
                  readOnly
                  value={ghostNote
                    ? `"${ghostNote}" — ${article?.title}\n${shareUrl}`
                    : `${article?.title} — ${shareUrl}`
                  }
                  onClick={(e) => e.target.select()}
                />
                <button
                  className="btn btn-secondary btn-sm share-copy-btn"
                  onClick={handleCopyGhostNote}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="share-divider">share as</div>

              <div className="share-social-row">
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-social-btn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Post to X
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
