import { Link } from 'react-router-dom';
import './Platforms.css';

const IOSMockup = () => (
  <div className="platform-mockup platform-ios">
    <div className="ios-chrome">
      <div className="ios-notch" />
      <div className="ios-url-bar">
        <div className="ios-url-input">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span>medium.com/the-truth-about</span>
        </div>
      </div>
    </div>
    <div className="ios-article-preview">
      <div className="ios-article-img" />
      <div className="ios-article-content">
        <p className="ios-article-tag">Technology</p>
        <h3 className="ios-article-title">The Quiet Revolution in Browser Extensions</h3>
        <p className="ios-article-meta">8 min read</p>
      </div>
    </div>
    <div className="ios-share-sheet">
      <div className="ios-share-handle" />
      <p className="ios-share-label">Save to Ghost Notes</p>
      <div className="ios-share-grid">
        <div className="ios-share-app active">
          <div className="ios-share-icon gn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.3"/>
              <path d="M9 8.5C9 7.67 9.67 7 10.5 7s1.5.67 1.5 1.5S11.33 10 10.5 10 9 9.33 9 8.5zM14 15.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" fill="currentColor"/>
            </svg>
          </div>
          <span>Ghost Notes</span>
        </div>
        <div className="ios-share-app">
          <div className="ios-share-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
          </div>
          <span>Save to Files</span>
        </div>
        <div className="ios-share-app">
          <div className="ios-share-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <span>Mail</span>
        </div>
        <div className="ios-share-app">
          <div className="ios-share-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M8 12h8M12 8v8"/>
            </svg>
          </div>
          <span>More</span>
        </div>
      </div>
      <div className="ios-share-confirm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        Saved!
      </div>
    </div>
  </div>
);

const AndroidMockup = () => (
  <div className="platform-mockup platform-android">
    <div className="android-chrome">
      <div className="android-status-bar">
        <span>9:41</span>
        <div className="android-icons">
          <span>📶</span><span>🔋</span>
        </div>
      </div>
      <div className="android-url-bar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <span>github.com/blog/ghost-notes-launch</span>
      </div>
    </div>
    <div className="android-share-target">
      <div className="android-share-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.3"/>
          <path d="M9 8.5C9 7.67 9.67 7 10.5 7s1.5.67 1.5 1.5S11.33 10 10.5 10 9 9.33 9 8.5zM14 15.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" fill="currentColor"/>
        </svg>
        <div>
          <p className="android-share-appname">Ghost Notes</p>
          <p className="android-share-tagline">Read it later, guilt-free</p>
        </div>
      </div>
      <div className="android-share-preview">
        <div className="android-article-img" />
        <div>
          <p className="android-article-title">Building a Read-Later App That Actually Gets Used</p>
          <p className="android-article-domain">github.com</p>
        </div>
      </div>
      <button className="android-save-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        Save to Haul
      </button>
    </div>
  </div>
);

export default function Platforms() {
  return (
    <div className="platforms-page">
      <div className="platforms-topband">
        <span className="platforms-eyebrow">Ghost Notes on every screen</span>
        <h1 className="platforms-title">Save from anywhere.</h1>
        <p className="platforms-subtitle">
          iOS, Android, and beyond — Ghost Notes meets you wherever you find something worth reading.
        </p>
      </div>

      {/* iOS Section */}
      <section className="platforms-section">
        <div className="platforms-text">
          <div className="platforms-section-label">iOS Share Extension</div>
          <h2 className="platforms-section-title">Save from any app.</h2>
          <p className="platforms-section-desc">
            Found something in Safari, News, or any app with a share sheet? One tap and it's in your Haul.
            No context switching, no leaving what you're reading.
          </p>
          <ul className="platforms-feature-list">
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Background save — stay in your current app
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Auto-detects article title and favicon
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Works in Safari, News, Chrome, and beyond
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Saved to your Haul immediately
            </li>
          </ul>
          <p className="platforms-availability">Available on iOS 16+ · Pro members</p>
        </div>
        <div className="platforms-visual">
          <IOSMockup />
        </div>
      </section>

      <div className="platforms-divider" />

      {/* Android Section */}
      <section className="platforms-section platforms-section-reverse">
        <div className="platforms-text">
          <div className="platforms-section-label">Android App</div>
          <h2 className="platforms-section-title">Chrome share, native feel.</h2>
          <p className="platforms-section-desc">
            Our native Android app integrates with the Chrome share menu. Save articles without breaking your flow.
            Clean, fast, and always in your pocket.
          </p>
          <ul className="platforms-feature-list">
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Native Android app with Material Design
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Save from Chrome share menu in one tap
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Offline reading on the go
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Syncs in real time with your Haul
            </li>
          </ul>
          <p className="platforms-availability">Coming soon · Android 10+ · Pro members</p>
        </div>
        <div className="platforms-visual">
          <AndroidMockup />
        </div>
      </section>

      <div className="platforms-cta-band">
        <p>Mobile apps are available for Pro members.</p>
        <Link to="/pricing" className="btn btn-primary">
          Get Pro access
        </Link>
      </div>
    </div>
  );
}
