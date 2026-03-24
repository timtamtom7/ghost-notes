import { useState } from 'react';
import { useArticles } from '../hooks/useArticles';
import './SaveInput.css';

function extractDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

export default function SaveInput({ onSave }) {
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pulse, setPulse] = useState(false);
  const { saveArticle } = useArticles();

  const isValidUrl = (string) => {
    try { new URL(string); return true; } catch { return false; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    let finalUrl = url.trim();
    if (!finalUrl.match(/^https?:\/\//)) {
      finalUrl = 'https://' + finalUrl;
    }

    if (!isValidUrl(finalUrl)) {
      setError('That doesn\'t look like a valid URL. Try pasting the full address.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      // Fetch page metadata via a proxy (allorigins to avoid CORS)
      let title = finalUrl;
      let description = '';
      let readingTime = null;

      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(finalUrl)}`;
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');

          const getMeta = (name) =>
            doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.content;

          title = getMeta('og:title') || doc.title || finalUrl;
          description = getMeta('description') || getMeta('og:description') || '';
        }
      } catch {
        // Metadata fetch failed — use URL as title
        title = finalUrl;
      }

      // Simple reading time estimate: 200 words per minute, avg 4 chars/word
      if (description) {
        readingTime = Math.max(1, Math.round(description.split(' ').length / 200));
      }

      await saveArticle({
        url: finalUrl,
        title,
        description,
        readingTime,
        favicon: `https://www.google.com/s2/favicons?domain=${extractDomain(finalUrl)}&sz=32`,
      });

      setUrl('');
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
      onSave?.();
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`save-input-form${pulse ? ' pulse' : ''}`}>
      <div className="save-input-wrapper">
        <svg className="save-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
        <input
          type="text"
          className="save-input"
          placeholder="Paste a URL to save it for later…"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          disabled={saving}
          autoComplete="off"
          spellCheck="false"
        />
        <button
          type="submit"
          className={`btn btn-primary btn-sm save-btn${saving ? ' btn-loading' : ''}`}
          disabled={saving || !url.trim()}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {error && <p className="save-input-error">{error}</p>}
    </form>
  );
}
