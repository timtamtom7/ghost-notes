import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

const ONBOARDING_KEY = 'gn-onboarding-complete';
const ONBOARDING_VERSION = '1';

const SCREENS = [
  {
    id: 'intro',
    eyebrow: 'Welcome to Ghost Notes',
    headline: 'Face your reading pile.',
    body: "Every week, Ghost Notes surfaces the articles you've saved — the ones you meant to read, bookmarked, and forgot about. No guilt. Just clarity.",
    cta: "Let's go",
    graphic: <IntroGraphic />,
  },
  {
    id: 'categories',
    eyebrow: 'Step 1',
    headline: 'Track your hauls.',
    body: "Save articles from anywhere — paste a URL, use the bookmarklet, or share from your phone. Ghost Notes keeps them in one place until you're ready.",
    cta: 'Got it',
    graphic: <HaulGraphic />,
  },
  {
    id: 'decision',
    eyebrow: 'Step 2',
    headline: 'Read or let go.',
    body: "When your Haul surfaces, every article gets a verdict. Read it now, or consciously cull it. Either way — you've decided. That's the point.",
    cta: 'Makes sense',
    graphic: <CullGraphic />,
  },
  {
    id: 'ready',
    eyebrow: "You're all set",
    headline: 'Your first haul awaits.',
    body: 'Start saving articles and build your reading practice. Free forever, no card required.',
    cta: 'Start saving',
    graphic: <ReadyGraphic />,
    isLast: true,
  },
];

function IntroGraphic() {
  return (
    <div className="onboard-graphic">
      <div className="onboard-ghost">
        <svg width="120" height="140" viewBox="0 0 120 140" fill="none">
          <path
            d="M60 10 C25 10 10 45 10 80 L10 120 L25 108 L40 120 L60 108 L80 120 L95 108 L110 120 L110 80 C110 45 95 10 60 10Z"
            fill="var(--color-accent)"
            opacity="0.15"
          />
          <path
            d="M60 18 C30 18 18 48 18 80 L18 115 L30 105 L42 115 L60 105 L78 115 L90 105 L102 115 L102 80 C102 48 90 18 60 18Z"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 3"
          />
          {/* Eyes */}
          <circle cx="45" cy="65" r="5" fill="var(--color-accent)" opacity="0.7"/>
          <circle cx="75" cy="65" r="5" fill="var(--color-accent)" opacity="0.7"/>
          {/* Mouth */}
          <path d="M48 82 Q60 90 72 82" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" opacity="0.5"/>
          {/* Floating papers */}
          <rect x="12" y="30" width="18" height="22" rx="2" fill="var(--surface-3)" stroke="var(--border-subtle)" strokeWidth="1"/>
          <line x1="15" y1="36" x2="27" y2="36" stroke="var(--text-disabled)" strokeWidth="1"/>
          <line x1="15" y1="40" x2="25" y2="40" stroke="var(--text-disabled)" strokeWidth="1"/>
          <line x1="15" y1="44" x2="23" y2="44" stroke="var(--text-disabled)" strokeWidth="1"/>
          <rect x="88" y="45" width="18" height="22" rx="2" fill="var(--surface-3)" stroke="var(--border-subtle)" strokeWidth="1"/>
          <line x1="91" y1="51" x2="103" y2="51" stroke="var(--text-disabled)" strokeWidth="1"/>
          <line x1="91" y1="55" x2="100" y2="55" stroke="var(--text-disabled)" strokeWidth="1"/>
          <line x1="91" y1="59" x2="98" y2="59" stroke="var(--text-disabled)" strokeWidth="1"/>
          <rect x="82" y="10" width="18" height="22" rx="2" fill="var(--surface-3)" stroke="var(--border-subtle)" strokeWidth="1"/>
          <line x1="85" y1="16" x2="97" y2="16" stroke="var(--text-disabled)" strokeWidth="1"/>
          <line x1="85" y1="20" x2="94" y2="20" stroke="var(--text-disabled)" strokeWidth="1"/>
        </svg>
      </div>
    </div>
  );
}

function HaulGraphic() {
  return (
    <div className="onboard-graphic">
      <div className="onboard-haul-icons">
        {/* Bookmark icon */}
        <div className="onboard-icon-card" style={{'--delay': '0ms'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
          <span>Bookmarklet</span>
        </div>
        {/* Share icon */}
        <div className="onboard-icon-card" style={{'--delay': '80ms'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>Share Sheet</span>
        </div>
        {/* Paste icon */}
        <div className="onboard-icon-card" style={{'--delay': '160ms'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1"/>
          </svg>
          <span>Paste URL</span>
        </div>
      </div>
      <div className="onboard-plus-signs">
        <span>+</span><span>+</span><span>+</span>
      </div>
    </div>
  );
}

function CullGraphic() {
  return (
    <div className="onboard-graphic">
      <div className="onboard-decision">
        <div className="onboard-decision-card read">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="1.5">
            <path d="M9 12l2 2 4-4"/>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          </svg>
          <span>Read</span>
        </div>
        <div className="onboard-decision-or">or</div>
        <div className="onboard-decision-card cull">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="1.5">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
          <span>Cull</span>
        </div>
      </div>
      <p className="onboard-decision-note">Every article gets a verdict. No indefinite backlog.</p>
    </div>
  );
}

function ReadyGraphic() {
  return (
    <div className="onboard-graphic">
      <div className="onboard-ready-stack">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="onboard-ready-paper"
            style={{'--paper-delay': `${i * 60}ms`}}
          />
        ))}
        <div className="onboard-ready-glow" />
      </div>
    </div>
  );
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const screen = SCREENS[step];

  const handleNext = () => {
    if (step < SCREENS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, ONBOARDING_VERSION);
      onComplete?.();
      navigate('/app');
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, ONBOARDING_VERSION);
    onComplete?.();
    navigate('/app');
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-backdrop" />

      <div className="onboarding-sheet">
        {/* Skip button */}
        <button className="onboarding-skip" onClick={handleSkip}>
          Skip intro
        </button>

        {/* Graphic area */}
        <div className="onboarding-graphic-area">
          {screen.graphic}
        </div>

        {/* Text area */}
        <div className="onboarding-text-area">
          <span className="onboarding-eyebrow">{screen.eyebrow}</span>
          <h2 className="onboarding-headline">{screen.headline}</h2>
          <p className="onboarding-body">{screen.body}</p>
        </div>

        {/* Progress + CTA */}
        <div className="onboarding-footer">
          <div className="onboarding-progress">
            {SCREENS.map((_, i) => (
              <div
                key={i}
                className={`onboarding-dot${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
              />
            ))}
          </div>

          <button className="btn btn-primary btn-lg onboarding-cta" onClick={handleNext}>
            {screen.cta}
            {step < SCREENS.length - 1 && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export { ONBOARDING_KEY, ONBOARDING_VERSION };
