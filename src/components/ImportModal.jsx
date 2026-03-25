import { useState, useRef } from 'react';
import './ImportModal.css';

const TABS = [
  { key: 'pocket', label: 'Pocket' },
  { key: 'instapaper', label: 'Instapaper' },
  { key: 'csv', label: 'Browser Bookmarks' },
];

export default function ImportModal({ onClose, onImport }) {
  const [activeTab, setActiveTab] = useState('pocket');
  const [pocketApiKey, setPocketApiKey] = useState('');
  const [instapaperUser, setInstapaperUser] = useState('');
  const [instapaperPass, setInstapaperPass] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null); // { imported: number, skipped: number }
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleTab = (key) => {
    if (importing) return;
    setActiveTab(key);
    setResult(null);
  };

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setResult(null);
    try {
      let items = [];

      if (activeTab === 'pocket') {
        if (!pocketApiKey.trim()) return;
        items = await importFromPocket(pocketApiKey.trim(), (p) => setProgress(p));
      } else if (activeTab === 'instapaper') {
        if (!instapaperUser.trim() || !instapaperPass.trim()) return;
        items = await importFromInstapaper(instapaperUser.trim(), instapaperPass.trim(), (p) => setProgress(p));
      } else if (activeTab === 'csv') {
        if (!csvFile) return;
        items = await importFromCsv(csvFile, (p) => setProgress(p));
      }

      const result = await onImport(items);
      setProgress(100);
      setResult({ imported: items.length, skipped: 0 });
    } catch (err) {
      console.error('Import error:', err);
      setResult({ imported: 0, skipped: 0, error: err.message });
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.html'))) {
      setCsvFile(file);
    }
  };

  const canImport = importing
    || (activeTab === 'pocket' && !pocketApiKey.trim())
    || (activeTab === 'instapaper' && (!instapaperUser.trim() || !instapaperPass.trim()))
    || (activeTab === 'csv' && !csvFile);

  return (
    <div className="import-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="import-modal">
        <div className="import-modal-header">
          <h2 className="import-modal-title">Import Articles</h2>
          <button className="import-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="import-modal-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`import-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => handleTab(tab.key)}
              disabled={importing}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="import-modal-body">
          {result ? (
            <div className="import-success">
              <svg className="import-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <p className="import-success-text">
                {result.error ? 'Import failed' : `Imported ${result.imported} articles`}
              </p>
              <p className="import-success-sub">
                {result.error || 'Your articles are now in Ghost Notes.'}
              </p>
            </div>
          ) : importing ? (
            <div className="import-progress">
              <div className="import-progress-bar-wrap">
                <div className="import-progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <p className="import-progress-text">Importing… {progress}%</p>
            </div>
          ) : activeTab === 'pocket' && (
            <PocketForm
              apiKey={pocketApiKey}
              onApiKeyChange={setPocketApiKey}
            />
          ) || activeTab === 'instapaper' && (
            <InstapaperForm
              username={instapaperUser}
              onUsernameChange={setInstapaperUser}
              password={instapaperPass}
              onPasswordChange={setInstapaperPass}
            />
          ) || activeTab === 'csv' && (
            <CsvForm
              file={csvFile}
              onFileChange={setCsvFile}
              dragOver={dragOver}
              onDragOver={() => setDragOver(true)}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onFileSelect={(f) => setCsvFile(f)}
            />
          )}
        </div>

        {!result && (
          <div className="import-actions">
            <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={importing}>
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleImport}
              disabled={canImport}
            >
              {importing ? 'Importing…' : 'Start Import'}
            </button>
          </div>
        )}

        {result && (
          <div className="import-actions">
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pocket Import ──────────────────────────────────────────────────────────

function PocketForm({ apiKey, onApiKeyChange }) {
  return (
    <div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 20 }}>
        Connect your Pocket account to import your saved articles. You'll need a Pocket API key.
      </p>
      <div className="import-field">
        <label className="import-label">Pocket API Key</label>
        <input
          type="password"
          className="import-input"
          placeholder="Enter your Pocket consumer key"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          autoFocus
        />
        <p className="import-hint">
          Get your API key at{' '}
          <a href="https://getpocket.com/developer/apps" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>
            getpocket.com/developer
          </a>
        </p>
      </div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 16, padding: '12px', background: 'var(--surface-3)', borderRadius: 'var(--radius)', }}>
        Note: Pocket API requires OAuth. For full integration, a backend is needed to handle the OAuth flow. Enter your API key and we'll import your bookmarks via their REST API.
      </p>
    </div>
  );
}

// ─── Instapaper Import ───────────────────────────────────────────────────────

function InstapaperForm({ username, onUsernameChange, password, onPasswordChange }) {
  return (
    <div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 20 }}>
        Enter your Instapaper credentials to import your saved articles.
      </p>
      <div className="import-field">
        <label className="import-label">Email / Username</label>
        <input
          type="text"
          className="import-input"
          placeholder="your@email.com"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          autoFocus
        />
      </div>
      <div className="import-field">
        <label className="import-label">Password</label>
        <input
          type="password"
          className="import-input"
          placeholder="Your Instapaper password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
      </div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 16, padding: '12px', background: 'var(--surface-3)', borderRadius: 'var(--radius)' }}>
        Note: Instapaper Full API requires OAuth. This import uses their basic auth endpoint for demonstration.
      </p>
    </div>
  );
}

// ─── CSV / Browser Bookmarks Import ─────────────────────────────────────────

function CsvForm({ file, onFileChange, dragOver, onDragOver, onDragLeave, onDrop, onFileSelect }) {
  return (
    <div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 20 }}>
        Export your browser bookmarks as HTML or CSV, then import them here.
      </p>
      <div
        className={`import-dropzone${dragOver ? ' drag-over' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById('import-csv-input')?.click()}
      >
        <svg className="import-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17,8 12,3 7,8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p className="import-dropzone-text">
          {file ? `Selected: ${file.name}` : 'Drop your CSV or HTML export here'}
        </p>
        <p className="import-dropzone-hint">or click to browse · .csv, .html supported</p>
      </div>
      <input
        id="import-csv-input"
        type="file"
        accept=".csv,.html"
        ref={(el) => {
          if (el) el.addEventListener('change', (e) => onFileSelect(e.target.files[0]));
        }}
        style={{ display: 'none' }}
      />
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 12 }}>
        Chrome: Bookmarks → Organize → Export · Firefox: Library → Import → Backup
      </p>
    </div>
  );
}

// ─── Import Logic ─────────────────────────────────────────────────────────────

async function importFromPocket(apiKey, onProgress) {
  // In a real implementation, this would call a backend that handles Pocket OAuth
  // For now, we simulate the import with a mock delay
  onProgress(20);

  // Pocket's API requires OAuth. Without a backend, we provide a template.
  // The user would connect via a backend OAuth flow.
  throw new Error(
    'Pocket import requires OAuth authentication. Set VITE_POCKET_API_KEY in your backend environment and use the full OAuth flow.'
  );
}

async function importFromInstapaper(username, password, onProgress) {
  onProgress(20);

  // Instapaper basic API
  const credentials = btoa(`${username}:${password}`);
  try {
    const response = await fetch('https://www.instapaper.com/api/1/folders/list', {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      throw new Error('Invalid Instapaper credentials');
    }

    onProgress(50);

    // Get the reading list
    const listResponse = await fetch('https://www.instapaper.com/api/1/bookmarks/list', {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!listResponse.ok) {
      throw new Error('Could not fetch Instapaper bookmarks');
    }

    onProgress(80);
    const bookmarks = await listResponse.json();

    // Map to our format
    const items = bookmarks.map((bm) => ({
      url: bm.url,
      title: bm.title,
      description: bm.excerpt || '',
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(bm.url).hostname}&sz=32`,
    }));

    onProgress(100);
    return items;
  } catch (err) {
    throw new Error(`Instapaper import failed: ${err.message}`);
  }
}

async function importFromCsv(file, onProgress) {
  onProgress(20);
  const text = await file.text();
  onProgress(40);

  let items = [];

  if (file.name.endsWith('.html')) {
    // Browser bookmark HTML export
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const links = doc.querySelectorAll('a');
    items = Array.from(links).map((link) => ({
      url: link.href,
      title: link.textContent.trim(),
      description: '',
      favicon: `https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(link.href).hostname; } catch { return ''; } })()}&sz=32`,
    }));
  } else {
    // CSV — expects columns: url, title (optional)
    const lines = text.split('\n').filter(Boolean);
    const header = lines[0].toLowerCase();

    // Try to find URL and title columns
    let urlCol = -1;
    let titleCol = -1;
    const cols = header.split(',').map((c) => c.trim().replace(/"/g, ''));

    // Handle different CSV formats
    if (header.includes('url') || header.includes('href') || header.includes('address')) {
      urlCol = cols.findIndex((c) => /url|href|address/i.test(c));
    }
    if (header.includes('title') || header.includes('name')) {
      titleCol = cols.findIndex((c) => /title|name/i.test(c));
    }

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      if (urlCol < 0 || !values[urlCol]) continue;

      const url = values[urlCol].trim();
      if (!url.startsWith('http')) continue;

      items.push({
        url,
        title: titleCol >= 0 ? values[titleCol]?.trim() : url,
        description: '',
        favicon: `https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(url).hostname; } catch { return ''; } })()}&sz=32`,
      });
    }
  }

  onProgress(80);
  // Filter to max 200 items to avoid overwhelming Firestore
  const trimmed = items.slice(0, 200);
  onProgress(100);
  return trimmed;
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}
