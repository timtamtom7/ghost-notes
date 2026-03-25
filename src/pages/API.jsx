import { Link } from 'react-router-dom';
import './API.css';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/v1/saves',
    desc: 'List all saved articles for the authenticated user',
    params: ['limit (int)', 'offset (int)', 'status (active|archived)'],
  },
  {
    method: 'POST',
    path: '/v1/saves',
    desc: 'Save a new article URL to the Haul',
    params: ['url (string)', 'title (string, optional)', 'listId (string, optional)'],
  },
  {
    method: 'GET',
    path: '/v1/saves/:id',
    desc: 'Get a specific saved article by ID',
    params: ['id (string)'],
  },
  {
    method: 'PATCH',
    path: '/v1/saves/:id',
    desc: 'Update article metadata or status',
    params: ['status (read|cull|active)', 'listId (string)'],
  },
  {
    method: 'DELETE',
    path: '/v1/saves/:id',
    desc: 'Permanently delete a saved article',
    params: ['id (string)'],
  },
  {
    method: 'GET',
    path: '/v1/lists',
    desc: 'List all reading lists',
    params: [],
  },
  {
    method: 'POST',
    path: '/v1/lists',
    desc: 'Create a new reading list',
    params: ['name (string)'],
  },
  {
    method: 'GET',
    path: '/v1/export',
    desc: 'Export all user data as JSON',
    params: [],
  },
];

const INTEGRATIONS = [
  {
    name: 'Zapier',
    desc: 'Connect Ghost Notes to 5,000+ apps. Save articles from Twitter, newsletters, Slack, and more.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 10H3M13 14H3M17 6H7M17 18H7"/>
        <circle cx="19" cy="10" r="2"/>
        <circle cx="5" cy="14" r="2"/>
        <circle cx="19" cy="18" r="2"/>
      </svg>
    ),
  },
  {
    name: 'Buffer',
    desc: 'Save interesting articles from social media to read later in your Haul.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    name: 'Readwise',
    desc: 'Export your highlights and notes from Ghost Notes directly to Readwise for spaced repetition.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
  },
  {
    name: 'IFTTT',
    desc: 'Automate saving with custom applets. New email attachment? Save it. New RSS item? Save it.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="8" height="8" rx="1"/>
        <rect x="14" y="2" width="8" height="8" rx="1"/>
        <rect x="2" y="14" width="8" height="8" rx="1"/>
        <rect x="14" y="14" width="8" height="8" rx="1"/>
        <circle cx="6" cy="6" r="1" fill="currentColor"/>
        <circle cx="18" cy="6" r="1" fill="currentColor"/>
        <circle cx="6" cy="18" r="1" fill="currentColor"/>
        <circle cx="18" cy="18" r="1" fill="currentColor"/>
      </svg>
    ),
  },
];

const EXAMPLE_CODE = `# Save a URL to your Haul
curl -X POST https://api.ghostnotes.app/v1/saves \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/worth-reading",
    "title": "Why Reading Is the Best Habit"
  }'

# Response
{
  "id": "art_01HX...",
  "url": "https://example.com/worth-reading",
  "title": "Why Reading Is the Best Habit",
  "status": "active",
  "savedAt": "2025-01-15T09:23:41Z"
}

# List your saves
curl https://api.ghostnotes.app/v1/saves?limit=20 \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Mark as read
curl -X PATCH https://api.ghostnotes.app/v1/saves/art_01HX... \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "read"}'`;

export default function API() {
  return (
    <div className="api-page">
      <div className="api-topband">
        <span className="api-eyebrow">For developers & automators</span>
        <h1 className="api-title">Build on Ghost Notes.</h1>
        <p className="api-subtitle">
          A clean REST API with predictable patterns. Save articles programmatically,
          integrate with your tools, and export your reading data.
        </p>
        <div className="api-cta-row">
          <Link to="/pricing" className="btn btn-primary">
            Get API access
          </Link>
          <a
            href="#"
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText('https://api.ghostnotes.app/v1');
              alert('Base URL copied!');
            }}
          >
            Copy base URL
          </a>
        </div>
      </div>

      {/* Auth */}
      <section className="api-section">
        <h2 className="api-section-title">Authentication</h2>
        <p className="api-section-desc">
          All API requests require a Bearer token. Generate your API key in{' '}
          <Link to="/app/settings">Settings → API Access</Link>.
        </p>
        <div className="api-code-block">
          <div className="api-code-header">
            <span className="api-code-lang">http</span>
            <button
              className="api-code-copy"
              onClick={() => navigator.clipboard.writeText('Authorization: Bearer YOUR_API_KEY')}
            >
              Copy
            </button>
          </div>
          <pre className="api-code">
            <code>Authorization: Bearer YOUR_API_KEY</code>
          </pre>
        </div>
      </section>

      {/* Endpoints */}
      <section className="api-section">
        <h2 className="api-section-title">Endpoints</h2>
        <div className="api-endpoints">
          {ENDPOINTS.map((ep, i) => (
            <div key={i} className="api-endpoint-row">
              <span className={`api-method api-method-${ep.method.toLowerCase()}`}>
                {ep.method}
              </span>
              <code className="api-path">{ep.path}</code>
              <span className="api-endpoint-desc">{ep.desc}</span>
              {ep.params.length > 0 && (
                <div className="api-params">
                  {ep.params.map((p) => (
                    <span key={p} className="api-param">{p}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Example */}
      <section className="api-section">
        <h2 className="api-section-title">Example Usage</h2>
        <p className="api-section-desc">
          Here's how you'd save an article and manage it via the API.
        </p>
        <div className="api-code-block">
          <div className="api-code-header">
            <span className="api-code-lang">bash</span>
            <button
              className="api-code-copy"
              onClick={() => navigator.clipboard.writeText(EXAMPLE_CODE)}
            >
              Copy
            </button>
          </div>
          <pre className="api-code">
            <code>{EXAMPLE_CODE}</code>
          </pre>
        </div>
      </section>

      {/* Integrations */}
      <section className="api-section">
        <h2 className="api-section-title">Integrations</h2>
        <p className="api-section-desc">
          No code required — connect Ghost Notes to your favorite tools directly.
        </p>
        <div className="api-integrations-grid">
          {INTEGRATIONS.map((ig, i) => (
            <div key={i} className="api-integration-card">
              <div className="api-integration-icon">{ig.icon}</div>
              <div>
                <h3 className="api-integration-name">{ig.name}</h3>
                <p className="api-integration-desc">{ig.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rate Limits */}
      <section className="api-section">
        <h2 className="api-section-title">Rate Limits</h2>
        <div className="api-limits-grid">
          <div className="api-limit-card">
            <p className="api-limit-number">1,000</p>
            <p className="api-limit-label">requests / day</p>
          </div>
          <div className="api-limit-card">
            <p className="api-limit-number">60</p>
            <p className="api-limit-label">requests / minute</p>
          </div>
          <div className="api-limit-card">
            <p className="api-limit-number">10</p>
            <p className="api-limit-label">articles / minute (POST)</p>
          </div>
        </div>
        <p className="api-limits-note">
          Pro members get 10x rate limits. Enterprise plans have custom limits.
        </p>
      </section>

      <div className="api-cta-band">
        <div>
          <p className="api-cta-title">Ready to build?</p>
          <p className="api-cta-desc">API access is included with Pro. Get your key in Settings.</p>
        </div>
        <Link to="/pricing" className="btn btn-primary">
          Get Pro for API access
        </Link>
      </div>
    </div>
  );
}
