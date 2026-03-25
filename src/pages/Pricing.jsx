import { Link } from 'react-router-dom';
import './Pricing.css';

const CheckIcon = () => (
  <svg className="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const LockIcon = () => (
  <svg className="feature-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const FREE_FEATURES = [
  { text: '5 saved articles', locked: false },
  { text: 'Basic reading stats', locked: false },
  { text: 'One-tap save via URL paste', locked: false },
  { text: 'Weekly haul surfacing', locked: false },
  { text: 'Unlimited hauls', locked: true },
  { text: 'Cloud backup', locked: true },
  { text: 'Advanced stats & insights', locked: true },
  { text: 'Export your data', locked: true },
];

const PRO_FEATURES = [
  { text: 'Unlimited saved articles', locked: false },
  { text: 'Advanced stats & insights', locked: false },
  { text: 'Cloud backup', locked: false },
  { text: 'Export your data (JSON)', locked: false },
  { text: 'Priority support', locked: false },
  { text: 'iOS Share Extension', locked: false },
  { text: 'Android app', locked: false },
  { text: 'Offline reading', locked: false },
  { text: 'Readwise integration', locked: false },
  { text: 'API access (1,000 req/day)', locked: false },
  { text: 'Everything in Free', locked: false },
];

const TEAM_FEATURES = [
  { text: 'Everything in Pro', locked: false },
  { text: 'Up to 5 team members', locked: false },
  { text: 'Shared reading lists', locked: false },
  { text: 'Team activity feed', locked: false },
  { text: 'Admin controls & billing', locked: false },
  { text: 'Slack/Discord notifications', locked: true },
];

const FAQ_ITEMS = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes — upgrade or downgrade at any time. Changes take effect immediately, and we\'ll prorate the difference.',
  },
  {
    q: 'What counts as a "saved article"?',
    a: 'Any URL you paste into Ghost Notes counts as one article. Articles you\'ve read or culled still count toward your total, but the Archive is separate.',
  },
  {
    q: 'What happens when I hit my Free limit?',
    a: 'You\'ll still be able to read and cull your existing hauls. To save new articles, you\'ll need to upgrade or free up space by culling old ones.',
  },
  {
    q: 'Is my data export really mine?',
    a: '100%. Export gives you a JSON file with every article you\'ve saved — titles, URLs, dates, notes. No proprietary lock-in.',
  },
  {
    q: 'How does team billing work?',
    a: 'Team plans are billed per seat. You can add or remove seats at any time. The billing admin gets a single receipt.',
  },
  {
    q: 'When are the iOS and Android apps coming?',
    a: 'iOS Share Extension is in beta for Pro members. Android is on the roadmap — sign up to get notified when it launches.',
  },
  {
    q: 'How does the API work?',
    a: 'Pro members get API access with 1,000 requests/day. Generate a key in Settings, then use our REST API to save articles, manage lists, and export data programmatically.',
  },
];

function FeatureItem({ text, locked }) {
  if (locked) {
    return (
      <li className="tier-feature-item locked">
        <LockIcon />
        <span>{text}</span>
      </li>
    );
  }
  return (
    <li className="tier-feature-item">
      <CheckIcon />
      <span>{text}</span>
    </li>
  );
}

function FaqItem({ q, a }) {
  return (
    <div className="faq-item">
      <button className="faq-question">
        <span>{q}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="pricing-page">
      <div className="pricing-topband">
        <span className="pricing-eyebrow">Simple, honest pricing</span>
        <h1 className="pricing-title">Pick your plan.</h1>
        <p className="pricing-subtitle">
          Start free. Save what matters. When you're ready for more, we're here.
        </p>
      </div>

      <div className="pricing-grid">
        {/* ── Free ── */}
        <div className="tier-card">
          <div>
            <p className="tier-name">Free</p>
            <div className="tier-price-row">
              <span className="tier-price">$0</span>
              <span className="tier-price-period">/mo</span>
            </div>
            <p className="tier-description">
              For casual readers who save a few things and actually get around to them.
            </p>
          </div>

          <ul className="tier-features">
            {FREE_FEATURES.map((f, i) => (
              <FeatureItem key={i} text={f.text} locked={f.locked} />
            ))}
          </ul>

          <div className="tier-cta">
            <Link to="/auth" className="btn btn-secondary">
              Start for free
            </Link>
          </div>
        </div>

        {/* ── Pro ── */}
        <div className="tier-card featured">
          <div>
            <p className="tier-name">
              Pro
              <span className="pro-badge">Pro</span>
            </p>
            <div className="tier-price-row">
              <span className="tier-price">$4.99</span>
              <span className="tier-price-period">/mo</span>
            </div>
            <p className="tier-description">
              For serious readers who save more than they finish — and want their data back.
            </p>
          </div>

          <ul className="tier-features">
            {PRO_FEATURES.map((f, i) => (
              <FeatureItem key={i} text={f.text} locked={f.locked} />
            ))}
          </ul>

          <div className="tier-cta">
            <Link to="/auth?plan=pro" className="btn btn-primary">
              Get Pro
            </Link>
          </div>
        </div>

        {/* ── Team ── */}
        <div className="tier-card">
          <div>
            <p className="tier-name">Team</p>
            <div className="tier-price-row">
              <span className="tier-price">$12.99</span>
              <span className="tier-price-period">/mo</span>
            </div>
            <p className="tier-description">
              For crews and collectives who read together and keep each other honest.
            </p>
          </div>

          <ul className="tier-features">
            {TEAM_FEATURES.map((f, i) => (
              <FeatureItem key={i} text={f.text} locked={f.locked} />
            ))}
          </ul>

          <div className="tier-cta">
            <Link to="/auth?plan=team" className="btn btn-secondary">
              Start a team
            </Link>
          </div>
        </div>
      </div>

      <div className="pricing-faq">
        <h2 className="pricing-faq-title">Common questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem key={i} q={item.q} a={item.a} />
        ))}
      </div>

      <p className="pricing-footer-note">
        All plans include a 14-day free trial. No credit card required to start.
      </p>

      {/* Mobile + API Section */}
      <div className="pricing-extras">
        <div className="pricing-extra-card">
          <div className="pricing-extra-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12" y2="18"/>
            </svg>
          </div>
          <div>
            <h3 className="pricing-extra-title">Mobile apps</h3>
            <p className="pricing-extra-desc">iOS Share Extension and Android app for Pro members. Save from anywhere.</p>
          </div>
          <Link to="/platforms" className="btn btn-ghost btn-sm">
            Learn more
          </Link>
        </div>
        <div className="pricing-extra-card">
          <div className="pricing-extra-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <div>
            <h3 className="pricing-extra-title">Developer API</h3>
            <p className="pricing-extra-desc">Build automations, integrate with Zapier, Buffer, and Readwise. For Pro members.</p>
          </div>
          <Link to="/api" className="btn btn-ghost btn-sm">
            Read docs
          </Link>
        </div>
      </div>
    </div>
  );
}
