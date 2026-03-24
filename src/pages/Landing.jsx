import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.3"/>
            <path d="M9 8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S11.33 10 10.5 10 9 9.33 9 8.5zM14 15.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" fill="currentColor"/>
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16z" fill="currentColor" opacity="0.15"/>
          </svg>
          <span>Ghost Notes</span>
        </div>
        <nav className="landing-nav">
          <Link to="/auth" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/auth" className="btn btn-primary btn-sm">Get started</Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <p className="landing-eyebrow">Read-later, reimagined</p>
          <h1 className="landing-headline">
            The things<br />you meant to read.
          </h1>
          <p className="landing-subhead">
            Save articles with one tap. Every week, Ghost Notes surfaces what's accumulated — 
            clean, honest, a little uncomfortable. Read or cull. No guilt.
          </p>
          <div className="landing-cta">
            <Link to="/auth" className="btn btn-primary btn-lg">
              Start saving for free
            </Link>
            <span className="landing-cta-note">No account needed to start.</span>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <h3>One tap to save</h3>
            <p>Bookmarklet, share sheet, or keyboard shortcut — save anything from anywhere in seconds.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </div>
            <h3>Weekly reckoning</h3>
            <p>Once a week, your accumulated reading pile surfaces. Time to face the ghosts.</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4"/>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              </svg>
            </div>
            <h3>Read or let go</h3>
            <p>Read it now, or consciously cull it. Every item gets a verdict — no more endless backlog.</p>
          </div>
        </section>

        <section className="landing-manifesto">
          <blockquote>
            "The ghost in the name is the version of you that keeps meaning to read things but doesn't."
          </blockquote>
        </section>
      </main>

      <footer className="landing-footer">
        <p>Ghost Notes — The things you meant to read.</p>
      </footer>
    </div>
  );
}
